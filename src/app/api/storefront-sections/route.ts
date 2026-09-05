import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";
import { isPremiumActive } from "@/lib/premium";
import {
  DEFAULT_SECTION_ORDER,
  SECTION_META,
  isMissingTable,
  type SectionType,
  type StoreSection,
} from "@/lib/sections";

function seedDefaults(): Omit<StoreSection, "id">[] {
  return DEFAULT_SECTION_ORDER.map((type, i) => ({
    type,
    position: i,
    visible: true,
    settings: {},
  }));
}

async function readSections(userId: string) {
  const service = createServiceRoleClient();
  const { data, error } = await service
    .from("storefront_sections")
    .select("id, type, position, visible, settings")
    .eq("user_id", userId)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data || []) as StoreSection[];
}

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    let sections = await readSections(user.id);
    if (sections.length === 0) {
      // First visit: seed the default layout so the builder has something
      // to arrange immediately.
      const service = createServiceRoleClient();
      const { data: seeded, error } = await service
        .from("storefront_sections")
        .insert(
          seedDefaults().map((s) => ({ ...s, user_id: user.id }))
        )
        .select("id, type, position, visible, settings");
      if (error) throw error;
      sections = (seeded || []) as StoreSection[];
    }
    return NextResponse.json({ sections });
  } catch (e) {
    if (isMissingTable(e)) {
      return NextResponse.json(
        { error: "Sections table missing. Run supabase/storefront-sections.sql", missingTable: true },
        { status: 500 }
      );
    }
    console.error("[storefront-sections] read failed", e);
    return NextResponse.json({ error: "Could not load sections" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("is_premium, premium_until")
    .eq("id", user.id)
    .single();
  if (!profile || !isPremiumActive(profile as never)) {
    return NextResponse.json({ error: "Premium required" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const incoming = Array.isArray(body.sections) ? body.sections : null;
  if (!incoming) return NextResponse.json({ error: "sections array required" }, { status: 400 });

  // Validate: known types only, locked singles appear at most once.
  const seen = new Set<string>();
  const clean: Omit<StoreSection, "id">[] = [];
  for (const [i, raw] of incoming.entries()) {
    const type = raw?.type as SectionType;
    if (!type || !SECTION_META[type]) {
      return NextResponse.json({ error: `Unknown section type at index ${i}` }, { status: 400 });
    }
    if (!SECTION_META[type].repeatable) {
      if (seen.has(type)) {
        return NextResponse.json({ error: `Duplicate section: ${type}` }, { status: 400 });
      }
      seen.add(type);
    }
    const settings =
      raw.settings && typeof raw.settings === "object" && !Array.isArray(raw.settings)
        ? (raw.settings as Record<string, unknown>)
        : {};
    clean.push({
      type,
      position: i,
      visible: raw.visible !== false,
      // Text blocks carry heading/body/align, sanitized + length-capped.
      settings:
        type === "text"
          ? {
              heading: String(settings.heading || "").replace(/[<>"']/g, "").slice(0, 80) || null,
              body: String(settings.body || "").replace(/[<>"']/g, "").slice(0, 500) || null,
              align: ["left", "center", "right"].includes(String(settings.align))
                ? String(settings.align)
                : "center",
            }
          : {},
    });
  }

  try {
    const service = createServiceRoleClient();
    // Full replace is the simplest consistent write for an ordered list.
    const { error: delError } = await service
      .from("storefront_sections")
      .delete()
      .eq("user_id", user.id);
    if (delError) throw delError;

    let sections: StoreSection[] = [];
    if (clean.length > 0) {
      const { data, error } = await service
        .from("storefront_sections")
        .insert(clean.map((s) => ({ ...s, user_id: user.id })))
        .select("id, type, position, visible, settings");
      if (error) throw error;
      sections = (data || []) as StoreSection[];
    }

    // Keep the legacy boolean flags in sync so both render paths agree.
    const vis = (t: SectionType) => sections.find((s) => s.type === t)?.visible ?? false;
    await service
      .from("storefront_settings")
      .update({
        show_announcement: vis("announcement"),
        show_socials: vis("socials"),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    return NextResponse.json({ sections });
  } catch (e) {
    if (isMissingTable(e)) {
      return NextResponse.json(
        { error: "Sections table missing. Run supabase/storefront-sections.sql", missingTable: true },
        { status: 500 }
      );
    }
    console.error("[storefront-sections] save failed", e);
    return NextResponse.json({ error: "Could not save sections" }, { status: 500 });
  }
}

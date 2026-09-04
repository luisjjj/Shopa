import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isPremiumActive } from "@/lib/premium";
import { isHexColor, isHttpsUrl, sanitizeText } from "@/lib/security";

export async function GET(request: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  let targetUserId = userId;

  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    targetUserId = user.id;
  }

  const { data } = await supabase
    .from("storefront_settings")
    .select("*")
    .eq("user_id", targetUserId)
    .single();

  return NextResponse.json(data || null);
}

export async function PUT(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("is_premium, premium_until")
    .eq("id", user.id)
    .single();

  if (!profile || !isPremiumActive(profile as never)) {
    return NextResponse.json({ error: "Premium required — plan expired or not active" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));

  // Validate freeform fields: colors must be hex, links must be https,
  // text must not carry markup (rendered into storefronts + emails).
  const pick = (v: unknown, fallback: string) => (typeof v === "string" && v ? v : fallback);
  const color = (v: unknown, fallback: string) => (isHexColor(v) ? (v as string).trim() : fallback);
  const link = (v: unknown) => (isHttpsUrl(v) ? (v as string).trim().slice(0, 500) : null);

  const settings = {
    user_id: user.id,
    primary_color: color(body.primary_color, "#ed7712"),
    background_color: color(body.background_color, "#faf9f7"),
    text_color: color(body.text_color, "#1a1a1a"),
    accent_color: color(body.accent_color, "#ed7712"),
    card_background: color(body.card_background, "#ffffff"),
    banner_url: link(body.banner_url),
    font_style: body.font_style || "sans",
    font_size: body.font_size || "medium",
    layout: body.layout || "grid",
    image_shape: body.image_shape || "rounded",
    spacing: body.spacing || "normal",
    card_style: body.card_style || "minimal",
    card_border_radius: body.card_border_radius || "md",
    product_name_weight: body.product_name_weight || "medium",
    text_align: body.text_align || "center",
    banner_height: body.banner_height || "medium",
    banner_overlay: body.banner_overlay || false,
    header_style: pick(body.header_style, "centered"),
    tagline: sanitizeText(body.tagline, 140),
    show_store_name: body.show_store_name !== false,
    show_socials: body.show_socials || false,
    social_style: pick(body.social_style, "pills"),
    instagram: sanitizeText(body.instagram, 60),
    twitter: sanitizeText(body.twitter, 60),
    tiktok: sanitizeText(body.tiktok, 60),
    facebook: link(body.facebook),
    whatsapp_store: sanitizeText(body.whatsapp_store, 30)?.replace(/[^0-9+]/g, "") || null,
    phone: sanitizeText(body.phone, 30)?.replace(/[^0-9+]/g, "") || null,
    email: sanitizeText(body.email, 120),
    product_name_size: body.product_name_size || "medium",
    price_style: body.price_style || "bold",
    card_padding: body.card_padding || "normal",
    card_border: body.card_border || "none",
    card_shadow: body.card_shadow || "none",
    container_width: body.container_width || "normal",
    product_image_ratio: body.product_image_ratio || "square",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("storefront_settings")
    .upsert(settings, { onConflict: "user_id" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

const LAUNCH_DATE = "2026-09-10";

async function requireOwner() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerEmail = (process.env.OWNER_EMAIL || "").toLowerCase();
  if (!user || !ownerEmail || user.email?.toLowerCase() !== ownerEmail) {
    return null;
  }
  return user;
}

export async function GET() {
  if (!(await requireOwner())) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const service = createServiceRoleClient();

  const { data: users, error } = await service
    .from("users")
    .select("created_at, is_premium, is_pro_plus")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Could not load stats" }, { status: 500 });
  }

  const all = users || [];
  const since = all.filter((u) => (u.created_at || "") >= LAUNCH_DATE);
  const byDay: Record<string, number> = {};
  for (const u of since) {
    const day = String(u.created_at).slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
  }

  const { count: orderCount } = await service
    .from("orders")
    .select("id", { count: "exact", head: true })
    .gte("created_at", LAUNCH_DATE);

  const { count: paidCount } = await service
    .from("orders")
    .select("id", { count: "exact", head: true })
    .gte("created_at", LAUNCH_DATE)
    .eq("paid", true);

  return NextResponse.json({
    launchDate: LAUNCH_DATE,
    signupsTotal: all.length,
    signupsSinceLaunch: since.length,
    premiumStores: all.filter((u) => u.is_premium).length,
    proPlusStores: all.filter((u) => u.is_pro_plus).length,
    ordersSinceLaunch: orderCount ?? 0,
    paidOrdersSinceLaunch: paidCount ?? 0,
    signupsByDay: Object.entries(byDay)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => (a.day < b.day ? -1 : 1)),
  });
}

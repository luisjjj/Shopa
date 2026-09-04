import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { requireCronSecret } from "@/lib/security";

export async function GET(request: Request) {
  if (!requireCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createServiceRoleClient();
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: stale } = await supabase
    .from("orders")
    .select("id")
    .eq("paid", false)
    .eq("confirmed_by_buyer", false)
    .lt("created_at", cutoff);

  let expired = 0;
  if (stale && stale.length > 0) {
    const ids = stale.map((o) => o.id);
    const { error } = await supabase.from("orders").delete().in("id", ids);
    if (!error) expired = ids.length;
  }

  return NextResponse.json({ expired, checkedAt: new Date().toISOString() });
}

export async function POST(request: Request) {
  return GET(request);
}

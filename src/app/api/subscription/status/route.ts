import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("is_premium, premium_until, is_pro_plus, pro_plus_until")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 404 });

  return NextResponse.json({
    isPremium: (profile as { is_premium: boolean }).is_premium,
    premiumUntil: (profile as { premium_until: string | null }).premium_until,
    isProPlus: (profile as { is_pro_plus: boolean }).is_pro_plus,
    proPlusUntil: (profile as { pro_plus_until: string | null }).pro_plus_until,
  });
}

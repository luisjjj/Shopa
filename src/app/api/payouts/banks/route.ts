import { createClient } from "@/lib/supabase/server";
import { listBanks } from "@/lib/paystack";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const result = await listBanks("nigeria");
    if (!result.status || !Array.isArray(result.data)) {
      return NextResponse.json({ error: result.message || "Could not load banks" }, { status: 502 });
    }
    return NextResponse.json({
      banks: result.data
        .filter((b) => b.currency === "NGN")
        .map((b) => ({ name: b.name, code: b.code }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    });
  } catch (e) {
    console.error("[payouts/banks] failed", e);
    return NextResponse.json({ error: "Could not load banks" }, { status: 502 });
  }
}

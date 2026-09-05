import { createClient } from "@/lib/supabase/server";
import { resolveAccount } from "@/lib/paystack";
import { isStarterSafeError } from "@/lib/platform";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { bank_code, account_number } = await request.json().catch(() => ({}));
  if (!bank_code || !/^\d{10}$/.test(String(account_number || ""))) {
    return NextResponse.json(
      { error: "Select a bank and enter a valid 10-digit account number" },
      { status: 400 }
    );
  }

  try {
    const result = await resolveAccount({ bank_code, account_number: String(account_number) });
    if (!result.status || !result.data?.account_name) {
      if (isStarterSafeError(result.message || "")) {
        console.error("[payouts/resolve] possible Starter Business restriction:", result.message);
      }
      return NextResponse.json(
        { error: "Could not resolve this account, double-check the bank and number" },
        { status: 400 }
      );
    }
    return NextResponse.json({
      account_name: result.data.account_name,
      account_number: result.data.account_number,
    });
  } catch (e) {
    console.error("[payouts/resolve] failed", e);
    return NextResponse.json({ error: "Account verification failed. Try again" }, { status: 502 });
  }
}

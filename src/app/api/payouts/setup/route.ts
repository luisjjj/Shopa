import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { createSubaccount, resolveAccount } from "@/lib/paystack";
import { getPlatformFeePercent, isStarterSafeError } from "@/lib/platform";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { bank_code, bank_name, account_number, account_name, manual_confirm } =
    await request.json().catch(() => ({}));
  if (!bank_code || !/^\d{10}$/.test(String(account_number || ""))) {
    return NextResponse.json(
      { error: "Select a bank and enter a valid 10-digit account number" },
      { status: 400 }
    );
  }
  if (manual_confirm && (typeof account_name !== "string" || !account_name.trim())) {
    return NextResponse.json(
      { error: "Type the account name exactly as your bank shows it" },
      { status: 400 }
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, username, email, paystack_subaccount_code")
    .eq("id", user.id)
    .single() as never as { data: { id: string; username: string; email: string; paystack_subaccount_code: string | null } | null };

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  if (profile.paystack_subaccount_code) {
    return NextResponse.json({ error: "Payouts already set up for this store" }, { status: 400 });
  }

  // Prefer the Paystack-resolved name. If resolution is unavailable
  // (rate limits / Starter restrictions), fall back to the seller-typed name
  // they explicitly confirmed — subaccount creation still validates the
  // account for real, so bad details fail there with Paystack's message.
  let storedName: string;
  if (manual_confirm) {
    storedName = String(account_name).trim().slice(0, 120);
  } else {
    const resolved = await resolveAccount({ bank_code, account_number: String(account_number) });
    if (!resolved.status || !resolved.data?.account_name) {
      return NextResponse.json(
        {
          error: "RESOLVE_UNAVAILABLE",
          message: "Paystack couldn't verify this account right now. You can still continue — just confirm the details below are exactly right.",
        },
        { status: 400 }
      );
    }
    storedName = resolved.data.account_name;
  }

  const feePct = getPlatformFeePercent();
  let created;
  try {
    created = await createSubaccount({
      business_name: `${profile.username} (Shopa store)`,
      bank_code,
      account_number: String(account_number),
      percentage_charge: feePct,
      primary_contact_email: profile.email,
    });
  } catch (e) {
    console.error("[payouts/setup] failed", e);
    return NextResponse.json({ error: "Payout setup failed — try again" }, { status: 502 });
  }

  if (!created.status || !created.data?.subaccount_code) {
    const message = created.message || "Payout setup failed";
    if (isStarterSafeError(message)) {
      // Flag immediately per migration spec: Starter Business must allow this.
      console.error("[payouts/setup] POSSIBLE STARTER-BUSINESS RESTRICTION:", message);
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const service = createServiceRoleClient();
  const { error: saveError } = await service
    .from("users")
    .update({
      paystack_subaccount_code: created.data.subaccount_code,
      bank_code,
      bank_name: bank_name || created.data.settlement_bank || null,
      account_number: String(account_number),
      account_name: storedName,
      payout_setup_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (saveError) {
    console.error("[payouts/setup] save failed", saveError);
    return NextResponse.json({ error: "Subaccount created but could not be saved — contact support" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    subaccount_code: created.data.subaccount_code,
    account_name: storedName,
  });
}

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("paystack_subaccount_code, bank_name, account_number, account_name, payout_setup_completed_at")
    .eq("id", user.id)
    .single();

  return NextResponse.json({ payout: profile || null });
}

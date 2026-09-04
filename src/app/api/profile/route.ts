import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { createSubaccount, listBanks, resolveAccount } from "@/lib/paystack";
import { getPlatformFeePercent, isStarterSafeError } from "@/lib/platform";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();

  const updates: Record<string, unknown> = {};

  if (body.whatsapp_number !== undefined) {
    updates.whatsapp_number = body.whatsapp_number || null;
  }
  if (body.bank_name !== undefined) {
    updates.bank_name = body.bank_name || null;
  }
  if (body.account_number !== undefined) {
    updates.account_number = body.account_number || null;
  }
  if (body.account_name !== undefined) {
    updates.account_name = body.account_name || null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If bank details were saved and this store has no payout subaccount yet,
  // use them to create one automatically (same flow as /dashboard/payouts).
  let payout: { attempted: boolean; ok: boolean; message?: string } | undefined;
  const bankFieldsTouched =
    body.bank_name !== undefined || body.account_number !== undefined;

  if (bankFieldsTouched) {
    const { data: profile } = await supabase
      .from("users")
      .select("username, email, bank_name, account_number, paystack_subaccount_code")
      .eq("id", user.id)
      .single() as never as {
      data: {
        username: string;
        email: string;
        bank_name: string | null;
        account_number: string | null;
        paystack_subaccount_code: string | null;
      } | null;
    };

    if (
      profile &&
      !profile.paystack_subaccount_code &&
      profile.bank_name &&
      /^\d{10}$/.test(String(profile.account_number || ""))
    ) {
      payout = { attempted: true, ok: false };
      try {
        const banks = await listBanks("nigeria");
        const match = (banks.data || []).find(
          (b) => b.currency === "NGN" && b.name.toLowerCase() === profile.bank_name!.toLowerCase()
        );
        if (!match) {
          payout.message =
            "Bank name didn't match Paystack's list — finish setup on the payouts page";
        } else {
          const resolved = await resolveAccount({
            bank_code: match.code,
            account_number: String(profile.account_number),
          });
          if (!resolved.status || !resolved.data?.account_name) {
            payout.message = "Could not verify this account — finish setup on the payouts page";
          } else {
            const created = await createSubaccount({
              business_name: `${profile.username} (Shopa store)`,
              bank_code: match.code,
              account_number: String(profile.account_number),
              percentage_charge: getPlatformFeePercent(),
              primary_contact_email: profile.email,
            });
            if (!created.status || !created.data?.subaccount_code) {
              if (isStarterSafeError(created.message || "")) {
                console.error("[profile] POSSIBLE STARTER-BUSINESS RESTRICTION:", created.message);
              }
              payout.message = created.message || "Payout activation failed";
            } else {
              const service = createServiceRoleClient();
              const { error: saveError } = await service
                .from("users")
                .update({
                  paystack_subaccount_code: created.data.subaccount_code,
                  bank_code: match.code,
                  account_name: resolved.data.account_name,
                  payout_setup_completed_at: new Date().toISOString(),
                })
                .eq("id", user.id);
              if (saveError) {
                console.error("[profile] payout save failed", saveError);
                payout.message = "Subaccount created but could not be saved — contact support";
              } else {
                payout = { attempted: true, ok: true };
              }
            }
          }
        }
      } catch (e) {
        console.error("[profile] payout auto-setup failed", e);
        payout.message = "Payout activation failed — finish setup on the payouts page";
      }
    }
  }

  return NextResponse.json({ success: true, payout });
}

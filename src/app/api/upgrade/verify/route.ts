import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { verifyTransaction } from "@/lib/paystack";
import { NextResponse } from "next/server";

const PLAN_AMOUNTS_KOBO: Record<string, number> = {
  premium: 5000 * 100,
  pro_plus: 10000 * 100,
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.redirect(
      `${origin}/dashboard?upgrade=error&message=Missing+reference`
    );
  }

  const result = await verifyTransaction(reference);

  if (result.status && result.data.status === "success") {
    const supabase = createClient();
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser();

    const userId = result.data.metadata?.userId;
    const plan = result.data.metadata?.plan === "pro_plus" ? "pro_plus" : "premium";

    // Bind the upgrade to the logged-in buyer, a shared/copied callback
    // link must not extend someone else's plan.
    if (!userId || (sessionUser && sessionUser.id !== userId)) {
      return NextResponse.redirect(
        `${origin}/dashboard?upgrade=error&message=Account+mismatch`
      );
    }

    // Verify the amount actually paid matches the plan price. Prevents a
    // tampered/lower-value transaction from granting premium time.
    const paidKobo = Number(result.data.amount);
    if (paidKobo !== PLAN_AMOUNTS_KOBO[plan]) {
      console.error("[upgrade/verify] amount mismatch", { reference, plan, paidKobo });
      return NextResponse.redirect(
        `${origin}/dashboard?upgrade=error&message=Amount+mismatch`
      );
    }

    const service = createServiceRoleClient();

    // Idempotency: each Paystack reference grants time exactly once.
    // Replaying ?reference=... can no longer stack +30d forever.
    const { data: seen, error: seenError } = await service
      .from("processed_payments")
      .select("reference")
      .eq("reference", reference)
      .maybeSingle();

    if (!seenError && seen) {
      return NextResponse.redirect(`${origin}/dashboard?upgrade=success`);
    }

    const claimed = await service
      .from("processed_payments")
      .insert({ reference, user_id: userId, plan, amount_kobo: paidKobo });
    if (claimed.error) {
      // Duplicate reference (23505) or the pre-check above = replay: the
      // time was already granted, so report success without granting again.
      // Missing table (42P01) fails closed with guidance instead.
      const code = (claimed.error as { code?: string }).code;
      if (code === "23505") {
        return NextResponse.redirect(`${origin}/dashboard?upgrade=success`);
      }
      console.error("[upgrade/verify] idempotency claim failed", claimed.error);
      return NextResponse.redirect(
        `${origin}/dashboard?upgrade=error&message=Payment+ledger+not+set+up`
      );
    }

    if (userId) {
      const { data: existing } = await supabase.from("users").select("premium_until, pro_plus_until").eq("id", userId).single();
      const basePremium = existing?.premium_until && new Date(existing.premium_until).getTime() > Date.now() ? new Date(existing.premium_until) : new Date();
      const basePro = existing?.pro_plus_until && new Date(existing.pro_plus_until).getTime() > Date.now() ? new Date(existing.pro_plus_until) : new Date();
      const untilPremium = new Date(basePremium);
      untilPremium.setDate(untilPremium.getDate() + 30);
      const untilPro = new Date(basePro);
      untilPro.setDate(untilPro.getDate() + 30);

      if (plan === "pro_plus") {
        const { error } = await supabase
          .from("users")
          .update({
            is_pro_plus: true,
            pro_plus_until: untilPro.toISOString(),
            is_premium: true,
            premium_until: untilPremium.toISOString(),
          })
          .eq("id", userId);

        if (error) {
          console.error("Failed to upgrade user:", error);
          return NextResponse.redirect(
            `${origin}/dashboard?upgrade=error&message=Failed+to+update+profile`
          );
        }
      } else {
        const { error } = await supabase
          .from("users")
          .update({
            is_premium: true,
            premium_until: untilPremium.toISOString(),
          })
          .eq("id", userId);

        if (error) {
          console.error("Failed to upgrade user:", error);
          return NextResponse.redirect(
            `${origin}/dashboard?upgrade=error&message=Failed+to+update+profile`
          );
        }
      }

      return NextResponse.redirect(
        `${origin}/dashboard?upgrade=success`
      );
    }
  }

  return NextResponse.redirect(
    `${origin}/dashboard?upgrade=error&message=Payment+verification+failed`
  );
}

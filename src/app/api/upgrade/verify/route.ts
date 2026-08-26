import { createClient } from "@/lib/supabase/server";
import { verifyTransaction } from "@/lib/paystack";
import { NextResponse } from "next/server";

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

    const userId = result.data.metadata?.userId;
    const plan = result.data.metadata?.plan || "premium";

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

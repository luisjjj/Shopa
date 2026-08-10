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
      const until = new Date();
      until.setDate(until.getDate() + 30);

      if (plan === "pro_plus") {
        const { error } = await supabase
          .from("users")
          .update({
            is_pro_plus: true,
            pro_plus_until: until.toISOString(),
            is_premium: true,
            premium_until: until.toISOString(),
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
            premium_until: until.toISOString(),
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

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

    if (userId) {
      const premiumUntil = new Date();
      premiumUntil.setDate(premiumUntil.getDate() + 30);

      const { error } = await supabase
        .from("users")
        .update({
          is_premium: true,
          premium_until: premiumUntil.toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("Failed to upgrade user:", error);
        return NextResponse.redirect(
          `${origin}/dashboard?upgrade=error&message=Failed+to+update+profile`
        );
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

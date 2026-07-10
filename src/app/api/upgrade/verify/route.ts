import { createClient } from "@/lib/supabase/server";
import { verifyTransaction } from "@/lib/paystack";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (!reference) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard?upgrade=error&message=Missing+reference`
    );
  }

  const result = await verifyTransaction(reference);

  if (result.status && result.data.status === "success") {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const premiumUntil = new Date();
      premiumUntil.setDate(premiumUntil.getDate() + 30);

      await supabase
        .from("users")
        .update({
          is_premium: true,
          premium_until: premiumUntil.toISOString(),
        })
        .eq("id", user.id);

      return NextResponse.redirect(
        `${baseUrl}/dashboard?upgrade=success`
      );
    }
  }

  return NextResponse.redirect(
    `${baseUrl}/dashboard?upgrade=error&message=Payment+verification+failed`
  );
}

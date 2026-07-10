import { createClient } from "@/lib/supabase/server";
import { verifyTransaction } from "@/lib/paystack";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");
  const product = searchParams.get("product");
  const amount = searchParams.get("amount");
  const buyer = searchParams.get("buyer");

  if (!reference) {
    return NextResponse.redirect(
      new URL("/confirm?status=error&message=Missing+reference", request.url)
    );
  }

  const result = await verifyTransaction(reference);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (result.status && result.data.status === "success") {
    const supabase = createClient();

    const { error } = await supabase
      .from("orders")
      .update({ paid: true })
      .eq("paystack_reference", reference);

    if (error) {
      console.error("Failed to mark order as paid:", error);
    }

    const params = new URLSearchParams({
      status: "success",
      product: product || "",
      amount: amount || "",
      buyer: buyer || "",
      reference,
    });

    return NextResponse.redirect(`${baseUrl}/confirm?${params.toString()}`);
  }

  return NextResponse.redirect(
    `${baseUrl}/confirm?status=error&message=Payment+verification+failed`
  );
}

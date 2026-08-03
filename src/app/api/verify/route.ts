import { createServiceRoleClient } from "@/lib/supabase/service";
import { verifyTransaction } from "@/lib/paystack";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
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

  if (result.status && result.data.status === "success") {
    const supabase = createServiceRoleClient();

    const { data: order } = await supabase
      .from("orders")
      .update({ paid: true })
      .eq("paystack_reference", reference)
      .select("user_id, product_id")
      .single();

    if (order?.product_id) {
      const { data: prod } = await supabase
        .from("products")
        .select("stock")
        .eq("id", order.product_id)
        .single();

      if (prod && prod.stock != null && prod.stock > 0) {
        await supabase
          .from("products")
          .update({ stock: prod.stock - 1 })
          .eq("id", order.product_id);
      }
    }

    if (order?.user_id) {
      fetch(`${origin}/api/push/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: order.user_id,
          title: "New Order!",
          body: `You just received an order for ${product || "a product"} — ₦${amount ? parseInt(amount).toLocaleString() : ""}`,
          url: "/dashboard",
        }),
      }).catch(() => {});
    }

    const params = new URLSearchParams({
      status: "success",
      product: product || "",
      amount: amount || "",
      buyer: buyer || "",
      reference,
      seller: order?.user_id || "",
    });

    return NextResponse.redirect(`${origin}/confirm?${params.toString()}`);
  }

  return NextResponse.redirect(
    `${origin}/confirm?status=error&message=Payment+verification+failed`
  );
}

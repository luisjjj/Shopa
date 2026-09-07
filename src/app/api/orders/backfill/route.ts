import { createServiceRoleClient } from "@/lib/supabase/service";
import { verifyTransaction } from "@/lib/paystack";
import { requireCronSecret } from "@/lib/security";
import { serverError } from "@/lib/api-error";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!requireCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createServiceRoleClient();

  const { data: unpaidOrders, error } = await supabase
    .from("orders")
    .select("id, paystack_reference, product_id")
    .eq("paid", false)
    .not("paystack_reference", "is", null);

  if (error) {
    return serverError("orders:backfill", error, "Could not check unpaid orders. Try again.");
  }

  if (!unpaidOrders || unpaidOrders.length === 0) {
    return NextResponse.json({ fixed: 0, message: "No unpaid orders to check" });
  }

  let fixed = 0;
  let failed = 0;

  for (const order of unpaidOrders) {
    try {
      const result = await verifyTransaction(order.paystack_reference);
      if (result.status && result.data.status === "success") {
        await supabase
          .from("orders")
          .update({ paid: true })
          .eq("id", order.id);

        if (order.product_id) {
          const { data: product } = await supabase
            .from("products")
            .select("stock")
            .eq("id", order.product_id)
            .single();

          if (product && product.stock != null && product.stock > 0) {
            await supabase
              .from("products")
              .update({ stock: product.stock - 1 })
              .eq("id", order.product_id);
          }
        }

        fixed++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return NextResponse.json({
    total: unpaidOrders.length,
    fixed,
    failed,
    message: `Fixed ${fixed} orders, ${failed} still unpaid or failed verification`,
  });
}

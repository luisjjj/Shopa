import { NextResponse } from "next/server";

// DISABLED: manual seller payment confirmation was removed when purchases
// migrated to Paystack Split Payments (markOrderPaid in src/lib/orders.ts,
// driven by the webhook, is the only paid=true path now).
// Kept as a stub for rollback, restore from git history to re-enable.
export async function POST() {
  return NextResponse.json(
    { error: "Manual payment confirmation is disabled, orders settle via Paystack" },
    { status: 410 }
  );
}

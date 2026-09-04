import { NextResponse } from "next/server";

// DISABLED: manual bank-transfer buyer confirmation was removed when
// purchases migrated to Paystack Split Payments (webhook is source of truth).
// Kept as a stub for rollback — restore from git history to re-enable.
export async function POST() {
  return NextResponse.json(
    { error: "Manual payment confirmation is disabled — pay via Paystack checkout" },
    { status: 410 }
  );
}

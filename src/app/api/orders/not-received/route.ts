import { NextResponse } from "next/server";

// DISABLED: manual "did not receive" flow belonged to bank-transfer
// purchases, which no longer exist. Paystack settlement is automatic.
// Kept as a stub for rollback — restore from git history to re-enable.
export async function POST() {
  return NextResponse.json(
    { error: "Manual payment disputes are disabled — orders settle via Paystack" },
    { status: 410 }
  );
}

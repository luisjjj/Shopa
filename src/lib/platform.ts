// Platform fee + Paystack amount helpers for product purchases.
// The fee lives in PLATFORM_FEE_PERCENT (default 1) so it can be changed
// without touching code. It is applied per-transaction as a flat
// transaction_charge (kobo), overriding each subaccount's stored
// percentage_charge — so changing the fee never requires updating
// existing subaccounts.

export function getPlatformFeePercent(): number {
  const raw = process.env.PLATFORM_FEE_PERCENT;
  const parsed = raw != null && raw !== "" ? Number(raw) : 1;
  if (!Number.isFinite(parsed) || parsed < 0 || parsed >= 100) return 1;
  return parsed;
}

export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

// Paystack NGN floor is 10000 kobo (₦100). Keep product minimums at/above this.
export const MIN_ORDER_NAIRA = 100;
export const MIN_ORDER_KOBO = MIN_ORDER_NAIRA * 100;

export function computePlatformFeeKobo(amountKobo: number): number {
  return Math.max(0, Math.round((amountKobo * getPlatformFeePercent()) / 100));
}

export function isStarterSafeError(message: string): boolean {
  return /register|verif|kyc|complian|business.*(tier|type|status)|upgrade/i.test(message || "");
}

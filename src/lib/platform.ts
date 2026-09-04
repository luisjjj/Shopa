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

// Buyer-pays-fees pricing: the seller nets the FULL product price, while the
// buyer covers the Shopa fee + the Paystack processing estimate on top.
// Paystack NG estimate (local cards/bank/USSD): 1.5% + ₦100 stub (waived
// under ₦2,500), capped at ₦2,000. International cards cost more (3.9%) —
// that difference is absorbed by the platform (bearer: "account"), never
// passed to the seller. Server is authoritative; any client copy is display-only.
export const PAYSTACK_NG_RATE = 0.015;
export const PAYSTACK_NG_STUB = 100;
export const PAYSTACK_NG_CAP = 2000;
export const PAYSTACK_WAIVER_BELOW = 2500;

export type BuyerTotal = {
  total: number;
  product: number;
  shopaFee: number;
  paystackFee: number;
};

export function computeBuyerTotal(
  productNaira: number,
  feePct: number = getPlatformFeePercent()
): BuyerTotal {
  const P = Math.max(0, Math.round(productNaira));
  const shopaFee = Math.round((P * feePct) / 100);
  let T = P + shopaFee;
  for (let i = 0; i < 4; i++) {
    const fee =
      T >= PAYSTACK_WAIVER_BELOW
        ? Math.min(Math.round(T * PAYSTACK_NG_RATE) + PAYSTACK_NG_STUB, PAYSTACK_NG_CAP)
        : Math.round(T * PAYSTACK_NG_RATE);
    T = P + shopaFee + fee;
  }
  return { total: T, product: P, shopaFee, paystackFee: T - P - shopaFee };
}

export function isStarterSafeError(message: string): boolean {
  return /register|verif|kyc|complian|business.*(tier|type|status)|upgrade/i.test(message || "");
}

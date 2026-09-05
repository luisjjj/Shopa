const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE = "https://api.paystack.co";

export async function initializeTransaction(params: {
  email: string;
  amount: number; // in naira
  callback_url: string;
  reference?: string;
  metadata?: Record<string, unknown>;
}) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amount * 100, // convert to kobo
      callback_url: params.callback_url,
      reference: params.reference,
      metadata: params.metadata,
    }),
  });
  return res.json();
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
    },
  });
  return res.json();
}

// ---------- Marketplace split payments (product purchases only) ----------
// Subscriptions (Pro plans) use initializeTransaction/verifyTransaction above
// and must NOT pass subaccount/transaction_charge/bearer.

export type PaystackBank = {
  name: string;
  code: string;
  currency: string;
  type: string;
};

export async function listBanks(country = "nigeria"): Promise<{ status: boolean; data?: PaystackBank[]; message?: string }> {
  const res = await fetch(`${PAYSTACK_BASE}/bank?country=${country}&perPage=100`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  });
  return res.json();
}

export async function resolveAccount(params: {
  account_number: string;
  bank_code: string;
}): Promise<{ status: boolean; data?: { account_name: string; account_number: string }; message?: string }> {
  const qs = new URLSearchParams({
    account_number: params.account_number,
    bank_code: params.bank_code,
  });
  const res = await fetch(`${PAYSTACK_BASE}/bank/resolve?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  });
  return res.json();
}

export type PaystackSubaccount = {
  id: number;
  subaccount_code: string;
  business_name: string;
  account_number: string;
  percentage_charge: number;
  settlement_bank: string;
  active: boolean;
  is_verified: boolean;
};

export async function createSubaccount(params: {
  business_name: string;
  bank_code: string;
  account_number: string;
  // Per Paystack docs, percentage_charge is the % of each payment
  // that goes to the MAIN (platform) account. Kept equal to the
  // platform fee as a fallback; per-transaction transaction_charge
  // overrides it at checkout (see src/lib/platform.ts).
  percentage_charge: number;
  primary_contact_email?: string;
}): Promise<{ status: boolean; data?: PaystackSubaccount; message?: string }> {
  const res = await fetch(`${PAYSTACK_BASE}/subaccount`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function getSubaccount(idOrCode: string | number) {
  const res = await fetch(`${PAYSTACK_BASE}/subaccount/${idOrCode}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  });
  return res.json();
}

// NOTE on refunds: a refund on a split transaction is pulled from OUR main
// Paystack balance, it is NOT automatically clawed back from the seller's
// settled share. If a refund feature is ever built, it needs a manual
// reconciliation step (or a hold period before seller payout settles).
export async function initializeSplitTransaction(params: {
  email: string;
  amountKobo: number; // integer kobo, convert BEFORE calling
  subaccount: string; // ACCT_... code
  transactionChargeKobo: number; // flat kobo to the MAIN account (overrides stored %)
  bearer?: "account" | "subaccount"; // who bears Paystack fees; default "account" (platform)
  reference: string;
  callback_url: string;
  metadata?: Record<string, unknown>;
}) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amountKobo),
      subaccount: params.subaccount,
      transaction_charge: Math.round(params.transactionChargeKobo),
      bearer: params.bearer || "account",
      reference: params.reference,
      callback_url: params.callback_url,
      metadata: params.metadata,
    }),
  });
  return res.json();
}

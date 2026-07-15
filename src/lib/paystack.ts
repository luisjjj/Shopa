const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE = "https://api.paystack.co";

export async function initializeTransaction(params: {
  email: string;
  amount: number; // in naira
  callback_url: string;
  reference?: string;
  metadata?: Record<string, unknown>;
}) {
  console.log("Paystack initialize - sending:", {
    email: params.email,
    amount: params.amount * 100,
    callback_url: params.callback_url,
    reference: params.reference,
  });

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

  const data = await res.json();
  console.log("Paystack initialize - response:", JSON.stringify(data, null, 2));
  return data;
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
    },
  });
  return res.json();
}

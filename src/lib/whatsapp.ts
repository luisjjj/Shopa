export function normalizePhone(raw: string): string {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("234") && digits.length === 13) return digits;
  if (digits.startsWith("0") && digits.length === 11) return `234${digits.slice(1)}`;
  if (digits.length === 10) return `234${digits}`;
  return digits;
}

export function buildWaLink(to: string, text: string): string {
  return `https://wa.me/${normalizePhone(to)}?text=${encodeURIComponent(text)}`;
}

export function sellerPaidAlertText(args: {
  buyerName: string;
  productName: string;
  amount: number;
  reference: string;
}): string {
  return (
    `Shopa: NEW PAID ORDER\n` +
    `${args.buyerName} just paid ₦${args.amount.toLocaleString()} for ${args.productName}.\n` +
    `Ref: ${args.reference}\nFulfill it in your dashboard.`
  );
}

export const ORDER_ALERT_TEMPLATE = "new_order";

export function buildOrderAlertParams(order: {
  buyerName: string;
  productName: string;
  amount: number | string;
  reference: string;
}): string[] {
  return [
    String(order.buyerName),
    String(order.productName),
    typeof order.amount === "number" ? `₦${order.amount.toLocaleString()}` : String(order.amount),
    String(order.reference),
  ];
}

export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string,
  bodyParams: string[]
): Promise<boolean> {
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  const phoneId = process.env.WHATSAPP_CLOUD_PHONE_ID;
  if (!token || !phoneId) return false;
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalizePhone(to),
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          ...(bodyParams.length > 0
            ? {
                components: [
                  {
                    type: "body",
                    parameters: bodyParams.map((t) => ({
                      type: "text",
                      text: String(t).slice(0, 200),
                    })),
                  },
                ],
              }
            : {}),
        },
      }),
    });
    if (!res.ok) {
      console.error("[whatsapp] template send failed", await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[whatsapp] template send error", e);
    return false;
  }
}

export async function sendSellerWhatsAppAlert(to: string, text: string): Promise<boolean> {
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  const phoneId = process.env.WHATSAPP_CLOUD_PHONE_ID;
  if (!token || !phoneId) return false;
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalizePhone(to),
        type: "text",
        text: { body: text.slice(0, 1000) },
      }),
    });
    if (!res.ok) {
      console.error("[whatsapp] cloud send failed", await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[whatsapp] cloud send error", e);
    return false;
  }
}

type Rule = { match: RegExp; reply: string };

const RULES: Rule[] = [
  {
    match: /(price|cost|how much|plan|premium|pro\+|upgrade|pay for|subscription)/i,
    reply:
      "Premium is ₦5,000/month (unlimited products, customization, no branding) and Pro+ is ₦10,000/month (everything plus multiple stores and promo codes). There is also a free 7-day Premium trial from the pricing page. Upgrade anytime from Dashboard → Upgrade.",
  },
  {
    match: /(payout|bank|account|paystack|subaccount|withdraw|settle)/i,
    reply:
      "Payouts go straight to your bank via Paystack. Set it once in Dashboard → Payouts with your bank name and 10-digit account number. Buyers pay you directly, Shopa only keeps a 1% fee plus the Paystack charge.",
  },
  {
    match: /(deliver|shipping|dispatch|waybill|fulfil|fulfill)/i,
    reply:
      "You handle delivery yourself after payment (any dispatch rider or waybill works). Mark the order Fulfilled in Dashboard → Orders once sent, and the buyer can follow it on the Track page.",
  },
  {
    match: /(track|where.*order|order.*(status|where)|not received)/i,
    reply:
      "Buyers can track any order at myshopa.shop/track with their order reference plus the phone number or email used at checkout. No login needed.",
  },
  {
    match: /(trial|free)/i,
    reply:
      "Every new store gets 7 days of Premium free via the Start free trial button on the homepage. No card required, and it drops back to Free automatically unless you upgrade.",
  },
  {
    match: /(login|log in|sign in|password|reset|forgot|can't access|locked)/i,
    reply:
      "Locked out? Use Forgot password on the login page for a reset link (expires in 1 hour). If that email never arrives, tell me here and I will sort it out.",
  },
  {
    match: /(whatsapp|alert|notification|notify)/i,
    reply:
      "Add your WhatsApp number in Dashboard → Profile and you will get instant pings for every paid order, plus a push notification if you enabled them on this device.",
  },
  {
    match: /(template|theme|customi|design|color|banner|store.*look)/i,
    reply:
      "Premium unlocks full store customization: 20+ one-tap themes, colors, fonts, layouts, banners, and drag-and-drop sections in Dashboard → Customize.",
  },
  {
    match: /(review|rating|star)/i,
    reply:
      "Buyers can rate paid orders from their receipt page, and the latest reviews show up automatically on your storefront once you add the Reviews block in Customize.",
  },
  {
    match: /(hello|hi|hey|good (morning|afternoon|evening)|yo)\b/i,
    reply:
      "Hello! Ask me anything about selling on Shopa: pricing, payouts, delivery, tracking, or your store. A human jumps in if I can't help.",
  },
];

export const BOT_FALLBACK =
  "Noted! I don't have a perfect answer for that yet, so I've passed it to the Shopa team. We reply here and by email, usually within a day. Anything else I can help with meanwhile?";

export function botReplyFor(message: string): { reply: string; confident: boolean } {
  for (const rule of RULES) {
    if (rule.match.test(message)) return { reply: rule.reply, confident: true };
  }
  return { reply: BOT_FALLBACK, confident: false };
}

import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST || "in-v3.mailjet.com";
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  if (!user || !pass) return null;
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

function getFrom() {
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@shopa.store";
  const fromName = process.env.SMTP_FROM_NAME || "Shopa";
  return { fromEmail: fromEmail.replace(/^.*<|>.*$/g, ""), fromName };
}

async function sendViaMailjet(opts: { to: string; subject: string; html: string; text?: string }) {
  const apiKey = process.env.MAILJET_API_KEY || "";
  const apiSecret = process.env.MAILJET_API_SECRET_KEY || "";
  if (!apiKey || !apiSecret) return null;
  const { fromEmail, fromName } = getFrom();
  try {
    const res = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Messages: [
          {
            From: { Email: fromEmail, Name: fromName },
            To: [{ Email: opts.to }],
            Subject: opts.subject,
            HTMLPart: opts.html,
            TextPart: opts.text || opts.html.replace(/<[^>]+>/g, ""),
          },
        ],
      }),
    });
    const data = await res.json().catch(() => ({}));
    // v3.1 shape: { Messages: [{ Status: "success"|"error", To: [{ MessageUUID, MessageID }], Errors: [...] }] }
    const msg = (data as {
      Messages?: {
        Status?: string;
        To?: { Email?: string; MessageUUID?: string; MessageID?: number }[];
        Errors?: { ErrorMessage?: string; ErrorCode?: string }[];
      }[];
    }).Messages?.[0];
    const firstError = msg?.Errors?.[0];
    const to0 = msg?.To?.[0];
    if (!res.ok || !msg || msg.Status !== "success" || firstError) {
      const detail =
        (firstError && `${firstError.ErrorCode || ""} ${firstError.ErrorMessage || ""}`.trim()) ||
        `Mailjet error ${res.status}`;
      console.error("[email] mailjet send failed", detail);
      return { error: detail };
    }
    console.log(`[email] sent via mailjet to ${opts.to} uuid=${to0?.MessageUUID} id=${to0?.MessageID}`);
    return { queued: true, id: String(to0?.MessageID || "") };
  } catch (e) {
    console.error("[email] mailjet send error", e);
    return { error: String(e) };
  }
}

export async function sendEmail(opts: { to: string; subject: string; html: string; text?: string }) {
  if (!opts.to || !opts.to.includes("@")) return { error: "Invalid recipient" };
  // Primary: Mailjet Send API. Fallback: SMTP (also Mailjet after migration).
  const viaApi = await sendViaMailjet(opts);
  if (viaApi) return viaApi;
  const transporter = getTransporter();
  const { fromEmail, fromName } = getFrom();
  const from = `${fromName} <${fromEmail}>`;
  if (!transporter) {
    console.log(`[email] no provider configured, would send to ${opts.to}: ${opts.subject}`);
    return { queued: false };
  }
  try {
    const info = await transporter.sendMail({ from, to: opts.to, subject: opts.subject, html: opts.html, text: opts.text || opts.html.replace(/<[^>]+>/g, "") });
    console.log(`[email] sent to ${opts.to} id=${info.messageId}`);
    return { queued: true, id: info.messageId };
  } catch (e) {
    console.error("[email] failed", e);
    return { error: String(e) };
  }
}

export function emailTemplates() {
  const brand = "Shopa";
  const base = (process.env.NEXT_PUBLIC_BASE_URL || "https://myshopa.com.ng").replace(/\/$/, "");
  return {
    welcome: (name: string) => ({
      subject: `Welcome to ${brand}, your store is ready`,
      html: shell(
        "Welcome to Shopa",
        "Your store is live",
        `<p style="${p()}">Hi ${esc(name)},</p>
        <p style="${p()}">Your Shopa store is live. Add products, share your link, and start selling on WhatsApp.</p>
        ${btn(`${base}/dashboard`, "Go to dashboard")}
        <p style="${muted()}">- The Shopa Team</p>`
      ),
    }),
    passwordReset: (link: string) => ({
      subject: "Reset your Shopa password",
      html: shell(
        "Reset your password",
        "Password reset requested",
        `<p style="${p()}">Click below to set a new password. This link expires in 1 hour.</p>
        ${btn(esc(link), "Reset password")}
        <p style="${muted()}">If you didn't request this, ignore this email.</p>`
      ),
    }),
    orderNotReceived: (productName: string, amount: number) => ({
      subject: `Payment not confirmed: ${productName}`,
      html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto"><h2>Payment not confirmed</h2><p>Your payment of <b>₦${amount.toLocaleString()}</b> for <b>${productName}</b> was not confirmed by the seller. Please verify transfer details or contact support.</p></div>`,
    }),
    buyerOtp: (code: string) => ({
      subject: `Your Shopa verification code: ${code}`,
      html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto"><h2>Verify your email</h2><p>Your Shopa verification code is:</p><p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#ed7712">${code}</p><p>It expires in 10 minutes. If you didn't request this, ignore this email.</p></div>`,
    }),
    trialActivated: (name: string, endsDate: string) => ({
      subject: `Your 7-day Premium trial is active`,
      html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto"><h2>Welcome to Premium, ${name}!</h2><p>Your free 7-day Premium trial is now active until <b>${endsDate}</b>. Enjoy unlimited products, store customization, and no Shopa branding.</p><a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://myshopa.com.ng"}/dashboard" style="display:inline-block;background:#ed7712;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">Set up your store</a><p style="color:#888;font-size:12px;margin-top:24px">No card was charged. Upgrade anytime to keep Premium after the trial.</p></div>`,
    }),
    premiumActivated: (name: string, plan: string) => ({
      subject: `You're on Shopa ${plan}, enjoy!`,
      html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto"><h2>Welcome to ${plan}, ${name}!</h2><p>Your payment went through and <b>${plan}</b> is now active on your store. Thanks for supporting Shopa.</p><a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://myshopa.com.ng"}/dashboard" style="display:inline-block;background:#ed7712;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">Go to dashboard</a><p style="color:#888;font-size:12px;margin-top:24px">- The Shopa Team</p></div>`,
    }),
    orderReceiptBuyer: (d: OrderMail) => ({
      subject: `Receipt: ${d.productName} (₦${d.total.toLocaleString()})`,
      html: shell(
        "Payment successful",
        `Receipt for ${d.productName}`,
        `<p style="${p()}">Hi ${esc(d.buyerName)},</p>
        <p style="${p()}">Your payment to <b>${esc(d.storeName)}</b> went through. The seller has been notified and will fulfill your order shortly.</p>
        ${orderCard(d, [
          row("Product", esc(d.productName) + (d.variantName ? ` <span style="color:#9aa0a6;">(${esc(d.variantName)})</span>` : "")),
          row("Seller", esc(d.storeName)),
          row("Reference", `<span style="font-family:monospace;font-size:12px;">${esc(d.reference)}</span>`),
          row("Date", esc(d.date)),
        ], [
          row("Price", naira(d.price)),
          ...(d.shopaFee ? [row("Shopa fee (1%)", naira(d.shopaFee))] : []),
          ...(d.paystackFee ? [row("Paystack fee", naira(d.paystackFee))] : []),
          totalRow("Total paid", naira(d.total)),
        ])}
        ${btn(d.trackUrl, "Track your order")}
        <p style="${muted()}">Bought from <a href="${d.storeUrl}" style="color:#ed7712;">${esc(d.storeName)}</a> on Shopa.</p>`
      ),
    }),
    orderPaidSeller: (d: OrderMail) => ({
      subject: `New paid order: ${d.productName} (₦${d.total.toLocaleString()})`,
      html: shell(
        "You have a new paid order",
        `${d.buyerName} just paid ₦${d.total.toLocaleString()}`,
        `<p style="${p()}"><b>${esc(d.buyerName)}</b> just paid via Paystack. All that is left is fulfillment.</p>
        ${orderCard(d, [
          row("Product", esc(d.productName) + (d.variantName ? ` <span style="color:#9aa0a6;">(${esc(d.variantName)})</span>` : "")),
          row("Buyer", esc(d.buyerName)),
          ...(d.buyerPhone ? [row("Buyer phone", `<a href="https://wa.me/${d.buyerPhone.replace(/\D/g, "")}" style="color:#25D366;">${esc(d.buyerPhone)} (WhatsApp)</a>`)] : []),
          ...(d.deliveryAddress ? [row("Deliver to", esc(d.deliveryAddress))] : []),
          row("Reference", `<span style="font-family:monospace;font-size:12px;">${esc(d.reference)}</span>`),
          row("Date", esc(d.date)),
          totalRow("Order value", naira(d.total)),
        ])}
        ${btn(d.dashboardUrl, "View order")}
        ${d.waForwardUrl ? `<p style="text-align:center;margin:12px 0 0;"><a href="${d.waForwardUrl}" style="color:#25D366;font-size:13px;">Forward this alert to WhatsApp</a></p>` : `<p style="${muted()}">Add your WhatsApp number in Profile to get instant WhatsApp pings for paid orders.</p>`}`
      ),
    }),
    orderPendingSeller: (d: OrderMail) => ({
      subject: `New pending order: ${d.productName}`,
      html: shell(
        "New pending order",
        `${d.buyerName} started checkout`,
        `<p style="${p()}"><b>${esc(d.buyerName)}</b> started checkout for <b>${esc(d.productName)}</b> (${naira(d.total)}). You'll get another email the moment they complete payment.</p>
        ${orderCard(d, [
          row("Product", esc(d.productName)),
          row("Buyer", esc(d.buyerName)),
          totalRow("Amount", naira(d.total)),
        ])}
        ${btn(d.dashboardUrl, "View dashboard")}`
      ),
    }),
    orderPendingBuyer: (d: OrderMail) => ({
      subject: `Order placed: ${d.productName}`,
      html: shell(
        "Order placed",
        "Complete payment to confirm it",
        `<p style="${p()}">Hi ${esc(d.buyerName)},</p>
        <p style="${p()}">Your order for <b>${esc(d.productName)}</b> (${naira(d.total)}) at <b>${esc(d.storeName)}</b> is pending. Complete payment on the Paystack page to confirm it.</p>
        ${orderCard(d, [
          row("Product", esc(d.productName)),
          row("Seller", esc(d.storeName)),
          totalRow("Amount", naira(d.total)),
        ])}
        ${btn(d.trackUrl, "Track your order")}`
      ),
    }),
  };
}

export type OrderMail = {
  buyerName: string;
  buyerPhone?: string | null;
  productName: string;
  variantName?: string | null;
  storeName: string;
  storeUrl: string;
  trackUrl: string;
  dashboardUrl: string;
  waForwardUrl?: string | null;
  deliveryAddress?: string | null;
  reference: string;
  date: string;
  price: number;
  shopaFee?: number | null;
  paystackFee?: number | null;
  total: number;
};

function esc(s: string): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function naira(n: number): string {
  return `₦${Number(n || 0).toLocaleString("en-NG")}`;
}

function p(): string {
  return "margin:0 0 12px;font-size:14px;line-height:1.6;color:#3c4043;";
}

function muted(): string {
  return "margin:16px 0 0;font-size:12px;line-height:1.6;color:#9aa0a6;";
}

function btn(url: string, label: string): string {
  return `<p style="text-align:center;margin:20px 0 8px;"><a href="${url}" style="display:inline-block;background-color:#ed7712;background-image:linear-gradient(135deg,#F49A35,#D95012);color:#ffffff;font-size:14px;font-weight:bold;padding:12px 28px;border-radius:10px;text-decoration:none;">${esc(label)}</a></p>`;
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:8px 0;font-size:13px;color:#9aa0a6;vertical-align:top;width:40%;">${label}</td><td style="padding:8px 0;font-size:13px;color:#1a1a1a;font-weight:500;text-align:right;">${value}</td></tr>`;
}

function totalRow(label: string, value: string): string {
  return `<tr><td colspan="2" style="padding:0;"><div style="border-top:1px dashed #dadce0;margin:6px 0;"></div></td></tr><tr><td style="padding:8px 0;font-size:14px;font-weight:bold;color:#1a1a1a;">${label}</td><td style="padding:8px 0;font-size:18px;font-weight:bold;color:#D95012;text-align:right;">${value}</td></tr>`;
}

function orderCard(d: OrderMail, lines: string[], totals: string[] = []): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#ffffff;border:1px solid #e8eaed;border-radius:12px;margin:16px 0;"><tr><td style="padding:16px 20px;"><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">${lines.join("")}${totals.join("")}</table></td></tr></table>`;
}

function shell(title: string, preheader: string, body: string): string {
  return `<div style="font-family:Inter,-apple-system,'Segoe UI',Roboto,sans-serif;background-color:#faf9f7;padding:24px 12px;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
  <div style="max-width:600px;margin:0 auto;">
    <div style="background-color:#ed7712;background-image:linear-gradient(135deg,#F49A35,#D95012);border-radius:12px 12px 0 0;padding:24px;text-align:center;">
      <p style="margin:0;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Shopa</p>
      <p style="margin:4px 0 0;font-size:14px;color:rgba(255,255,255,0.9);">${esc(title)}</p>
    </div>
    <div style="background:#ffffff;border:1px solid #e8eaed;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
      ${body}
    </div>
    <p style="text-align:center;font-size:12px;color:#9aa0a6;margin:16px 0 0;">myshopa.com.ng, sell on WhatsApp.</p>
  </div>
</div>`;
}


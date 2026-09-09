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
  return {
    welcome: (name: string) => ({
      subject: `Welcome to ${brand}, your store is ready`,
      html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto"><h2>Welcome, ${name}!</h2><p>Your Shopa store is live. Add products, share your link, and start selling on WhatsApp.</p><a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://myshopa.com.ng"}/dashboard" style="display:inline-block;background:#ed7712;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">Go to dashboard</a><p style="color:#888;font-size:12px;margin-top:24px">- The Shopa Team</p></div>`,
    }),
    passwordReset: (link: string) => ({
      subject: "Reset your Shopa password",
      html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto"><h2>Reset your password</h2><p>Click below to set a new password. Link expires in 1 hour.</p><a href="${link}" style="display:inline-block;background:#ed7712;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">Reset password</a><p style="color:#888;font-size:12px;margin-top:24px">If you didn't request this, ignore this email.</p></div>`,
    }),
    orderAwaiting: (buyerName: string, productName: string, amount: number) => ({
      subject: `New order awaiting confirmation: ${productName}`,
      html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto"><h2>New order awaiting confirmation</h2><p><b>${buyerName}</b> placed an order for <b>${productName}</b>, <b>₦${amount.toLocaleString()}</b>.</p><p>The buyer has marked payment as sent. Please confirm receipt in your dashboard.</p><a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://myshopa.com.ng"}/dashboard" style="display:inline-block;background:#ed7712;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none">View order</a></div>`,
    }),
    orderConfirmed: (productName: string, amount: number) => ({
      subject: `Payment confirmed, your order for ${productName} is being processed`,
      html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto"><h2>Payment confirmed!</h2><p>Your payment of <b>₦${amount.toLocaleString()}</b> for <b>${productName}</b> has been confirmed by the seller. They'll fulfill it shortly.</p></div>`,
    }),
    orderNotReceived: (productName: string, amount: number) => ({
      subject: `Payment not confirmed: ${productName}`,
      html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto"><h2>Payment not confirmed</h2><p>Your payment of <b>₦${amount.toLocaleString()}</b> for <b>${productName}</b> was not confirmed by the seller. Please verify transfer details or contact support.</p></div>`,
    }),
    orderPlaced: (sellerName: string, productName: string, amount: number) => ({
      subject: `New pending order: ${productName}`,
      html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto"><h2>New pending order</h2><p>You have a new pending order for <b>${productName}</b>: ₦${amount.toLocaleString()}. You'll be notified the moment the buyer completes Paystack checkout.</p></div>`,
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
  };
}

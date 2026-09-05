import { createHash } from "crypto";

// Canonical public base URL. Never derive redirect/login URLs from
// request headers (Host/X-Forwarded-Host/Origin), those are
// attacker-controlled and enable reset-link and callback theft.
export function getAppBaseUrl(): string {
  const env = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/$/, "");
  if (env && !env.includes("localhost")) return env;
  return "https://myshopa.com.ng";
}

export function requireSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = (request.headers.get("host") || "").split(",")[0].trim();
  const check = (url: string | null) => {
    if (!url) return false;
    try {
      return new URL(url).host === host;
    } catch {
      return false;
    }
  };
  // Browser form posts always send Origin (or Referer as fallback).
  // Non-browser clients send neither, reject those too for form routes.
  if (origin) return check(origin);
  if (referer) return check(referer);
  return false;
}

export function requireCronSecret(request: Request): boolean {
  // Fail CLOSED: if CRON_SECRET is unset, deny everything rather than
  // leaving mass-update/delete endpoints open to the internet.
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export function sanitizeText(value: unknown, maxLen = 200): string | null {
  if (value == null) return null;
  const s = String(value).replace(/[<>"']/g, "").trim().slice(0, maxLen);
  return s || null;
}

export function isHttpsUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

export function isHexColor(value: unknown): boolean {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value.trim());
}

export function hashOtp(code: string): string {
  return createHash("sha256").update(`shopa-otp:${String(code).trim()}`).digest("hex");
}

export function sanitizeCsvCell(value: unknown): string {
  const s = String(value ?? "");
  const escaped = `"${s.replace(/"/g, '""')}"`;
  // Neutralize spreadsheet formula injection (=cmd, +cmd, -cmd, @cmd).
  return /^[=+\-@]/.test(s) ? `"'${s.replace(/"/g, '""')}"` : escaped;
}

const buckets = new Map<string, number[]>();

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export function rateLimit(
  request: Request,
  key: string,
  max: number,
  windowMs: number
): { ok: boolean; remaining: number } {
  const bucketKey = `${key}:${clientIp(request)}`;
  const now = Date.now();
  const hits = (buckets.get(bucketKey) || []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(bucketKey, hits);
    return { ok: false, remaining: 0 };
  }
  hits.push(now);
  buckets.set(bucketKey, hits);
  return { ok: true, remaining: max - hits.length };
}

export function rateLimitKey(request: Request, key: string, extra = ""): string {
  return `${key}:${clientIp(request)}:${extra}`;
}

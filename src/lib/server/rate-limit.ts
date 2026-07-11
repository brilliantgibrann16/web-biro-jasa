import "server-only";

import { createHash } from "node:crypto";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
type GlobalWithRateLimit = typeof globalThis & {
  __biroJasaInquiryRateLimit?: Map<string, RateLimitEntry>;
};

function getStore(): Map<string, RateLimitEntry> {
  const globalStore = globalThis as GlobalWithRateLimit;
  globalStore.__biroJasaInquiryRateLimit ??= new Map<string, RateLimitEntry>();
  return globalStore.__biroJasaInquiryRateLimit;
}

function getForwardedAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0];
  return (
    forwarded?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

function getFingerprint(request: Request): string {
  const raw = [
    getForwardedAddress(request),
    request.headers.get("user-agent")?.slice(0, 180) || "unknown-agent",
  ].join("|");

  return createHash("sha256").update(raw).digest("hex");
}

function removeExpiredEntries(store: Map<string, RateLimitEntry>, now: number) {
  if (store.size < 200) return;

  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

export function checkInquiryRateLimit(request: Request): RateLimitResult {
  const now = Date.now();
  const store = getStore();
  const fingerprint = getFingerprint(request);
  const existing = store.get(fingerprint);

  removeExpiredEntries(store, now);

  if (!existing || existing.resetAt <= now) {
    store.set(fingerprint, { count: 1, resetAt: now + WINDOW_MS });
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      retryAfterSeconds: 0,
    };
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((existing.resetAt - now) / 1000),
  );

  if (existing.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  existing.count += 1;
  store.set(fingerprint, existing);

  return {
    allowed: true,
    remaining: MAX_REQUESTS - existing.count,
    retryAfterSeconds: 0,
  };
}

export const INQUIRY_RATE_LIMIT = {
  maxRequests: MAX_REQUESTS,
  windowMinutes: WINDOW_MS / 60_000,
} as const;

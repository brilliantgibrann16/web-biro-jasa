import "server-only";

import { createHash } from "node:crypto";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface TrackingRateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  limit: number;
}

const WINDOW_MS = 15 * 60 * 1000;
const MAX_STORE_ENTRIES = 2_000;
const TRUSTED_PROXY_HEADERS = new Set([
  "cf-connecting-ip",
  "x-forwarded-for",
  "x-real-ip",
  "x-vercel-forwarded-for",
]);

type TrackingRateLimitGlobal = typeof globalThis & {
  __biroJasaTrackingRateLimit?: Map<string, RateLimitEntry>;
};

function getStore(): Map<string, RateLimitEntry> {
  const globalStore = globalThis as TrackingRateLimitGlobal;
  globalStore.__biroJasaTrackingRateLimit ??= new Map<string, RateLimitEntry>();
  return globalStore.__biroJasaTrackingRateLimit;
}

function getTrustedClientAddress(request: Request): string {
  const configuredHeader = process.env.RATE_LIMIT_TRUSTED_PROXY_HEADER
    ?.trim()
    .toLowerCase();

  if (!configuredHeader || !TRUSTED_PROXY_HEADERS.has(configuredHeader)) {
    return "shared-untrusted-proxy";
  }

  const headerValue = request.headers.get(configuredHeader);
  return headerValue?.split(",", 1)[0]?.trim().slice(0, 256) || "shared-missing-address";
}

function pruneStore(store: Map<string, RateLimitEntry>, now: number) {
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }

  while (store.size >= MAX_STORE_ENTRIES) {
    const oldestKey = store.keys().next().value as string | undefined;
    if (!oldestKey) break;
    store.delete(oldestKey);
  }
}

export function checkTrackingRateLimit(
  request: Request,
  operation: "lookup" | "confirmation",
): TrackingRateLimitResult {
  const now = Date.now();
  const store = getStore();
  pruneStore(store, now);

  const limit = operation === "lookup" ? 10 : 5;
  const fingerprint = createHash("sha256")
    .update(
      [
        operation,
        getTrustedClientAddress(request),
      ].join("|"),
    )
    .digest("hex");
  const existing = store.get(fingerprint);

  if (!existing || existing.resetAt <= now) {
    store.set(fingerprint, { count: 1, resetAt: now + WINDOW_MS });
    return {
      allowed: true,
      remaining: limit - 1,
      retryAfterSeconds: 0,
      limit,
    };
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((existing.resetAt - now) / 1000),
  );

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds, limit };
  }

  existing.count += 1;
  store.set(fingerprint, existing);

  return {
    allowed: true,
    remaining: limit - existing.count,
    retryAfterSeconds: 0,
    limit,
  };
}

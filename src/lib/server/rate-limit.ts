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
const ADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1000;
const ADMIN_LOGIN_MAX_REQUESTS = 5;
const ADMIN_LOGIN_GLOBAL_MAX_REQUESTS = 50;
const MAX_STORE_ENTRIES = 2_000;
const ADMIN_LOGIN_GLOBAL_KEY = "global";
const TRUSTED_PROXY_HEADERS = new Set([
  "cf-connecting-ip",
  "x-forwarded-for",
  "x-real-ip",
  "x-vercel-forwarded-for",
]);
type GlobalWithRateLimit = typeof globalThis & {
  __biroJasaInquiryRateLimit?: Map<string, RateLimitEntry>;
  __biroJasaAdminLoginRateLimit?: Map<string, RateLimitEntry>;
};

function getStore(): Map<string, RateLimitEntry> {
  const globalStore = globalThis as GlobalWithRateLimit;
  globalStore.__biroJasaInquiryRateLimit ??= new Map<string, RateLimitEntry>();
  return globalStore.__biroJasaInquiryRateLimit;
}

function getAdminLoginStore(): Map<string, RateLimitEntry> {
  const globalStore = globalThis as GlobalWithRateLimit;
  globalStore.__biroJasaAdminLoginRateLimit ??= new Map<string, RateLimitEntry>();
  return globalStore.__biroJasaAdminLoginRateLimit;
}

function getTrustedClientAddress(request: Request): string {
  const configuredHeader = process.env.RATE_LIMIT_TRUSTED_PROXY_HEADER
    ?.trim()
    .toLowerCase();

  if (!configuredHeader || !TRUSTED_PROXY_HEADERS.has(configuredHeader)) {
    return "shared-untrusted-proxy";
  }

  const headerValue = request.headers.get(configuredHeader);
  const firstAddress = headerValue?.split(",", 1)[0]?.trim().slice(0, 256);
  return firstAddress || "shared-missing-address";
}

function getFingerprint(request: Request): string {
  const raw = [
    getTrustedClientAddress(request),
    request.headers.get("user-agent")?.slice(0, 180) || "unknown-agent",
  ].join("|");

  return createHash("sha256").update(raw).digest("hex");
}

function getAdminLoginFingerprint(request: Request): string {
  return createHash("sha256")
    .update(getTrustedClientAddress(request))
    .digest("hex");
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

export function checkInquiryRateLimit(request: Request): RateLimitResult {
  const now = Date.now();
  const store = getStore();
  const fingerprint = getFingerprint(request);
  const existing = store.get(fingerprint);

  pruneStore(store, now);

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

export function checkAdminLoginRateLimit(request: Request): RateLimitResult {
  const now = Date.now();
  const store = getAdminLoginStore();
  pruneStore(store, now);

  const fingerprint = getAdminLoginFingerprint(request);
  const addressKey = `address:${fingerprint}`;
  const addressEntry = store.get(addressKey);
  const globalEntry = store.get(ADMIN_LOGIN_GLOBAL_KEY);

  const activeAddressEntry =
    addressEntry && addressEntry.resetAt > now ? addressEntry : undefined;
  const activeGlobalEntry =
    globalEntry && globalEntry.resetAt > now ? globalEntry : undefined;

  if (
    activeAddressEntry &&
    activeAddressEntry.count >= ADMIN_LOGIN_MAX_REQUESTS
  ) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((activeAddressEntry.resetAt - now) / 1000),
      ),
    };
  }

  if (
    activeGlobalEntry &&
    activeGlobalEntry.count >= ADMIN_LOGIN_GLOBAL_MAX_REQUESTS
  ) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((activeGlobalEntry.resetAt - now) / 1000),
      ),
    };
  }

  const nextAddressCount = (activeAddressEntry?.count ?? 0) + 1;
  const nextGlobalCount = (activeGlobalEntry?.count ?? 0) + 1;

  store.set(addressKey, {
    count: nextAddressCount,
    resetAt: activeAddressEntry?.resetAt ?? now + ADMIN_LOGIN_WINDOW_MS,
  });
  store.set(ADMIN_LOGIN_GLOBAL_KEY, {
    count: nextGlobalCount,
    resetAt: activeGlobalEntry?.resetAt ?? now + ADMIN_LOGIN_WINDOW_MS,
  });

  return {
    allowed: true,
    remaining: Math.min(
      ADMIN_LOGIN_MAX_REQUESTS - nextAddressCount,
      ADMIN_LOGIN_GLOBAL_MAX_REQUESTS - nextGlobalCount,
    ),
    retryAfterSeconds: 0,
  };
}

export const INQUIRY_RATE_LIMIT = {
  maxRequests: MAX_REQUESTS,
  windowMinutes: WINDOW_MS / 60_000,
  maxTrackedFingerprints: MAX_STORE_ENTRIES,
} as const;

export const ADMIN_LOGIN_RATE_LIMIT = {
  maxRequests: ADMIN_LOGIN_MAX_REQUESTS,
  globalMaxRequests: ADMIN_LOGIN_GLOBAL_MAX_REQUESTS,
  windowMinutes: ADMIN_LOGIN_WINDOW_MS / 60_000,
  maxTrackedFingerprints: MAX_STORE_ENTRIES,
} as const;

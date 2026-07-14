import "server-only";

import { readTextBodyWithLimit } from "@/lib/server/request-body";
import type { TrackingRateLimitResult } from "@/lib/tracking/rate-limit";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Expires: "0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
} as const;

export function isSameOriginPublicMutation(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;

  const origin = request.headers.get("origin");
  if (!origin) return fetchSite === "same-origin";

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function trackingJsonResponse(
  body: unknown,
  init: ResponseInit & { rateLimit?: TrackingRateLimitResult } = {},
): Response {
  const { rateLimit, ...responseInit } = init;
  const headers = new Headers(responseInit.headers);

  for (const [name, value] of Object.entries(NO_STORE_HEADERS)) {
    headers.set(name, value);
  }

  if (rateLimit) {
    headers.set("X-RateLimit-Limit", String(rateLimit.limit));
    headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
    if (!rateLimit.allowed) {
      headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
    }
  }

  return Response.json(body, {
    ...responseInit,
    status: responseInit.status ?? 200,
    headers,
  });
}

export async function readSmallJsonBody(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const body = await readTextBodyWithLimit(request, 1_024);
    const payload = JSON.parse(body) as unknown;
    return payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

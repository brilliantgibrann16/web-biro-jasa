import { INQUIRY_RATE_LIMIT, checkInquiryRateLimit } from "@/lib/server/rate-limit";
import { validatePublicInquiry } from "@/lib/inquiries/validation";
import { createPublicServerClient } from "@/lib/supabase/public-server";

export const runtime = "nodejs";

const RESPONSE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
} as const;

function jsonResponse(
  body: unknown,
  init: ResponseInit & { remaining?: number } = {},
) {
  const { remaining, ...responseInit } = init;
  const headers = new Headers(responseInit.headers);

  for (const [name, value] of Object.entries(RESPONSE_HEADERS)) {
    headers.set(name, value);
  }

  headers.set("X-RateLimit-Limit", String(INQUIRY_RATE_LIMIT.maxRequests));
  if (remaining !== undefined) {
    headers.set("X-RateLimit-Remaining", String(remaining));
  }

  return Response.json(body, { ...responseInit, headers });
}

export async function POST(request: Request) {
  const rateLimit = checkInquiryRateLimit(request);

  if (!rateLimit.allowed) {
    return jsonResponse(
      {
        ok: false,
        message:
          "Terlalu banyak permintaan. Silakan lanjutkan konsultasi melalui WhatsApp.",
      },
      {
        status: 429,
        remaining: 0,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse(
      { ok: false, errors: { form: "Data formulir tidak valid." } },
      { status: 400, remaining: rateLimit.remaining },
    );
  }

  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const honeypot = (payload as Record<string, unknown>).website;

    if (typeof honeypot === "string" && honeypot.trim().length > 0) {
      // Deliberately mirror a successful response so automated spam does not
      // learn that the trap was detected. Nothing is written to the database.
      return jsonResponse(
        { ok: true },
        { status: 201, remaining: rateLimit.remaining },
      );
    }
  }

  const validation = validatePublicInquiry(payload);

  if (!validation.ok) {
    return jsonResponse(
      { ok: false, errors: validation.errors },
      { status: 400, remaining: rateLimit.remaining },
    );
  }

  const supabase = createPublicServerClient();

  if (!supabase) {
    return jsonResponse(
      {
        ok: false,
        message:
          "Pencatatan inquiry belum tersedia. Silakan lanjutkan melalui WhatsApp.",
      },
      { status: 503, remaining: rateLimit.remaining },
    );
  }

  const { error } = await supabase.from("inquiries").insert(validation.data);

  if (error) {
    console.error("Public inquiry insert failed", {
      code: error.code,
      message: error.message,
    });

    return jsonResponse(
      {
        ok: false,
        message:
          "Inquiry belum dapat dicatat. Silakan lanjutkan melalui WhatsApp.",
      },
      { status: 503, remaining: rateLimit.remaining },
    );
  }

  return jsonResponse(
    { ok: true },
    { status: 201, remaining: rateLimit.remaining },
  );
}

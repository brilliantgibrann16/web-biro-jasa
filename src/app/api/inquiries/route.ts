import { COMPANY, WHATSAPP_MESSAGES } from "@/lib/constants";
import { validatePublicInquiry } from "@/lib/inquiries/validation";
import { buildInquiryWhatsAppUrl } from "@/lib/inquiries/whatsapp";
import {
  INQUIRY_RATE_LIMIT,
  checkInquiryRateLimit,
} from "@/lib/server/rate-limit";
import { createPublicServerClient } from "@/lib/supabase/public-server";

export const runtime = "nodejs";

const RESPONSE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
} as const;
const MAX_REQUEST_BODY_BYTES = 16_384;

function isNativeFormSubmission(request: Request): boolean {
  return (
    request.headers
      .get("content-type")
      ?.toLowerCase()
      .includes("application/x-www-form-urlencoded") ?? false
  );
}

async function readPayload(request: Request): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_REQUEST_BODY_BYTES
  ) {
    throw new Error("payload-too-large");
  }

  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_REQUEST_BODY_BYTES) {
    throw new Error("payload-too-large");
  }

  if (isNativeFormSubmission(request)) {
    return Object.fromEntries(new URLSearchParams(body));
  }

  return JSON.parse(body) as unknown;
}

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

function redirectNoStore(
  location: string,
  options: {
    remaining?: number;
    recorded?: boolean;
    retryAfter?: number;
  } = {},
): Response {
  const headers = new Headers(RESPONSE_HEADERS);
  headers.set("Location", location);
  headers.set("X-RateLimit-Limit", String(INQUIRY_RATE_LIMIT.maxRequests));

  if (options.remaining !== undefined) {
    headers.set("X-RateLimit-Remaining", String(options.remaining));
  }
  if (options.recorded !== undefined) {
    headers.set("X-Inquiry-Recorded", options.recorded ? "yes" : "no");
  }
  if (options.retryAfter !== undefined) {
    headers.set("Retry-After", String(options.retryAfter));
  }

  return new Response(null, { status: 303, headers });
}

function invalidFormRedirect(request: Request): Response {
  const location = new URL("/kontak", request.url);
  location.searchParams.set("form", "invalid");
  location.hash = "inquiry-form";
  return redirectNoStore(location.toString());
}

export async function POST(request: Request) {
  const nativeForm = isNativeFormSubmission(request);
  const rateLimit = checkInquiryRateLimit(request);

  if (!rateLimit.allowed) {
    if (nativeForm) {
      return redirectNoStore(
        COMPANY.whatsappUrl(WHATSAPP_MESSAGES.kontak),
        {
          remaining: 0,
          recorded: false,
          retryAfter: rateLimit.retryAfterSeconds,
        },
      );
    }

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
    payload = await readPayload(request);
  } catch {
    if (nativeForm) return invalidFormRedirect(request);

    return jsonResponse(
      { ok: false, errors: { form: "Data formulir tidak valid." } },
      { status: 400, remaining: rateLimit.remaining },
    );
  }

  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const honeypot = (payload as Record<string, unknown>).website;

    if (typeof honeypot === "string" && honeypot.trim().length > 0) {
      // Mirror success so automated spam does not learn that the trap fired.
      // Native form submissions return to the contact page without writing.
      if (nativeForm) {
        return redirectNoStore(new URL("/kontak", request.url).toString(), {
          remaining: rateLimit.remaining,
        });
      }

      return jsonResponse(
        { ok: true },
        { status: 201, remaining: rateLimit.remaining },
      );
    }
  }

  const validation = validatePublicInquiry(payload);

  if (!validation.ok) {
    if (nativeForm) return invalidFormRedirect(request);

    return jsonResponse(
      { ok: false, errors: validation.errors },
      { status: 400, remaining: rateLimit.remaining },
    );
  }

  const supabase = createPublicServerClient();
  const fallbackWhatsAppUrl = buildInquiryWhatsAppUrl(validation.data, {
    recorded: false,
  });

  if (!supabase) {
    if (nativeForm) {
      return redirectNoStore(fallbackWhatsAppUrl, {
        remaining: rateLimit.remaining,
        recorded: false,
      });
    }

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

    if (nativeForm) {
      return redirectNoStore(fallbackWhatsAppUrl, {
        remaining: rateLimit.remaining,
        recorded: false,
      });
    }

    return jsonResponse(
      {
        ok: false,
        message:
          "Inquiry belum dapat dicatat. Silakan lanjutkan melalui WhatsApp.",
      },
      { status: 503, remaining: rateLimit.remaining },
    );
  }

  if (nativeForm) {
    return redirectNoStore(buildInquiryWhatsAppUrl(validation.data), {
      remaining: rateLimit.remaining,
      recorded: true,
    });
  }

  return jsonResponse(
    { ok: true },
    { status: 201, remaining: rateLimit.remaining },
  );
}

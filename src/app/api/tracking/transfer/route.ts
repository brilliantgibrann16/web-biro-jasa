import {
  isTrackingReferenceCode,
  normalizeTrackingReferenceCode,
  type TrackingErrorResponse,
} from "@/lib/tracking/public";
import {
  isSameOriginPublicMutation,
  readSmallJsonBody,
  trackingJsonResponse,
} from "@/lib/tracking/http";
import { checkTrackingRateLimit } from "@/lib/tracking/rate-limit";
import { createPublicRpcClient } from "@/lib/tracking/server";

export const runtime = "nodejs";

const CANNOT_CONFIRM_RESPONSE: TrackingErrorResponse = {
  ok: false,
  message:
    "Konfirmasi belum dapat dikirim. Periksa kembali status pembayaran atau hubungi admin melalui WhatsApp.",
};

export async function POST(request: Request) {
  if (!isSameOriginPublicMutation(request)) {
    return trackingJsonResponse(
      { ok: false, message: "Permintaan tidak diizinkan." },
      { status: 403 },
    );
  }

  const rateLimit = checkTrackingRateLimit(request, "confirmation");
  if (!rateLimit.allowed) {
    return trackingJsonResponse(
      {
        ok: false,
        message:
          "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.",
      } satisfies TrackingErrorResponse,
      { status: 429, rateLimit },
    );
  }

  const payload = await readSmallJsonBody(request);
  const referenceCode = normalizeTrackingReferenceCode(
    payload?.reference_code,
  );

  if (!isTrackingReferenceCode(referenceCode)) {
    return trackingJsonResponse(CANNOT_CONFIRM_RESPONSE, {
      status: 404,
      rateLimit,
    });
  }

  const supabase = createPublicRpcClient();
  if (!supabase) {
    return trackingJsonResponse(CANNOT_CONFIRM_RESPONSE, {
      status: 503,
      rateLimit,
    });
  }

  const { data, error } = await supabase.rpc(
    "request_payment_verification",
    { p_reference_code: referenceCode },
  );

  if (error) {
    console.error("Payment verification request failed", { code: error.code });
    return trackingJsonResponse(CANNOT_CONFIRM_RESPONSE, {
      status: 503,
      rateLimit,
    });
  }

  if (data !== true) {
    return trackingJsonResponse(CANNOT_CONFIRM_RESPONSE, {
      status: 404,
      rateLimit,
    });
  }

  return trackingJsonResponse(
    {
      ok: true,
      message:
        "Konfirmasi transfer sudah dikirim. Admin akan memeriksanya secara manual.",
    },
    { rateLimit },
  );
}

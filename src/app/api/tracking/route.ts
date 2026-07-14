import { SERVICE_CATEGORIES } from "@/lib/constants";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import {
  isPublicPaymentStatus,
  isPublicPaymentTiming,
  isTrackingInquiryStatus,
  isTrackingReferenceCode,
  normalizeTrackingReferenceCode,
  PUBLIC_TRACKING_STATUSES,
  type PublicPaymentInstructions,
  type PublicTrackingResult,
  type TrackingErrorResponse,
} from "@/lib/tracking/public";
import {
  readSmallJsonBody,
  trackingJsonResponse,
} from "@/lib/tracking/http";
import { checkTrackingRateLimit } from "@/lib/tracking/rate-limit";
import { createPublicRpcClient, firstRpcRow } from "@/lib/tracking/server";

export const runtime = "nodejs";

const NOT_FOUND_RESPONSE: TrackingErrorResponse = {
  ok: false,
  message:
    "Kode tidak ditemukan. Periksa kembali kode pada percakapan WhatsApp Anda.",
};

function nullableString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null;
}

function amountString(value: unknown): string | null {
  const normalized = typeof value === "number" ? String(value) : value;
  return typeof normalized === "string" && /^\d{1,15}$/.test(normalized)
    ? normalized
    : null;
}

function paymentAssetUrl(value: unknown): string | null {
  const path = nullableString(value, 220);
  if (
    !path ||
    path.includes("..") ||
    path.includes("//") ||
    !/^[A-Za-z0-9][A-Za-z0-9/_-]*\.(?:png|jpe?g|webp)$/i.test(path)
  ) {
    return null;
  }

  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const config = getSupabasePublicConfig();
  if (!config) return null;

  return new URL(
    `/storage/v1/object/public/payment-assets/${encodedPath}`,
    config.url,
  ).toString();
}

function mapTrackingRow(row: Record<string, unknown>): PublicTrackingResult | null {
  const referenceCode = nullableString(row.reference_code, 24);
  const status = row.inquiry_status;
  const serviceCategory = nullableString(row.service_category, 80);
  const updatedAt = nullableString(row.updated_at, 64);
  const category = SERVICE_CATEGORIES.find(
    (item) => item.id === serviceCategory,
  );

  if (
    !referenceCode ||
    !isTrackingInquiryStatus(status) ||
    !category ||
    !updatedAt ||
    Number.isNaN(new Date(updatedAt).getTime()) ||
    typeof row.payment_required !== "boolean" ||
    !isPublicPaymentStatus(row.payment_status)
  ) {
    return null;
  }

  const paymentStatus = row.payment_status;
  const pendingPayment =
    row.payment_required &&
    (paymentStatus === "menunggu-pembayaran" ||
      paymentStatus === "menunggu-verifikasi");
  const timing = isPublicPaymentTiming(row.payment_timing)
    ? row.payment_timing
    : null;
  const amount = amountString(row.payment_amount);
  const instructions: PublicPaymentInstructions | null = pendingPayment
    ? {
        bankName: nullableString(row.bank_name, 80),
        accountNumber: nullableString(row.bank_account_number, 80),
        accountHolder: nullableString(row.bank_account_holder, 120),
        qrisImageUrl: paymentAssetUrl(row.qris_storage_path),
        note: nullableString(row.payment_instructions, 1_000),
      }
    : null;

  return {
    referenceCode,
    serviceCategory: category.id,
    serviceCategoryLabel: category.title,
    serviceDetail: nullableString(row.service_detail, 160),
    status,
    statusPresentation: PUBLIC_TRACKING_STATUSES[status],
    updatedAt,
    payment: {
      required: row.payment_required,
      status: paymentStatus,
      amountRupiah: pendingPayment || paymentStatus === "sudah-dibayar"
        ? amount
        : null,
      timing,
      verificationRequested:
        paymentStatus === "menunggu-verifikasi" ||
        row.verification_requested === true,
      instructions,
    },
  };
}

export async function POST(request: Request) {
  const rateLimit = checkTrackingRateLimit(request, "lookup");

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
    return trackingJsonResponse(NOT_FOUND_RESPONSE, {
      status: 404,
      rateLimit,
    });
  }

  const supabase = createPublicRpcClient();
  if (!supabase) {
    return trackingJsonResponse(
      {
        ok: false,
        message:
          "Status belum dapat diperiksa. Coba lagi beberapa saat atau hubungi admin melalui WhatsApp.",
      } satisfies TrackingErrorResponse,
      { status: 503, rateLimit },
    );
  }

  const { data, error } = await supabase.rpc("get_inquiry_tracking", {
    p_reference_code: referenceCode,
  });

  if (error) {
    console.error("Public tracking lookup failed", { code: error.code });
    return trackingJsonResponse(
      {
        ok: false,
        message:
          "Status belum dapat diperiksa. Coba lagi beberapa saat atau hubungi admin melalui WhatsApp.",
      } satisfies TrackingErrorResponse,
      { status: 503, rateLimit },
    );
  }

  const row = firstRpcRow(data);
  if (!row) {
    return trackingJsonResponse(NOT_FOUND_RESPONSE, {
      status: 404,
      rateLimit,
    });
  }

  const tracking = mapTrackingRow(row);
  if (!tracking) {
    console.error("Public tracking lookup returned an invalid shape");
    return trackingJsonResponse(
      {
        ok: false,
        message:
          "Status belum dapat diperiksa. Coba lagi beberapa saat atau hubungi admin melalui WhatsApp.",
      } satisfies TrackingErrorResponse,
      { status: 503, rateLimit },
    );
  }

  return trackingJsonResponse({ ok: true, tracking }, { rateLimit });
}

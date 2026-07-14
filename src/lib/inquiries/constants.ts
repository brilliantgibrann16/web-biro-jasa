import {
  SERVICE_CATEGORIES,
  type ServiceCategoryId,
} from "@/lib/constants";

export const INQUIRY_STATUSES = [
  "baru",
  "diproses",
  "menunggu-dokumen",
  "selesai",
  "dibatalkan",
] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const PAYMENT_TIMINGS = [
  "sebelum-proses",
  "setelah-selesai",
] as const;

export type PaymentTiming = (typeof PAYMENT_TIMINGS)[number];

export const PAYMENT_STATUSES = [
  "belum-diperlukan",
  "menunggu-pembayaran",
  "menunggu-verifikasi",
  "sudah-dibayar",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_TIMING_LABELS: Record<PaymentTiming, string> = {
  "sebelum-proses": "Sebelum proses dimulai",
  "setelah-selesai": "Setelah pekerjaan selesai",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  "belum-diperlukan": "Belum diperlukan",
  "menunggu-pembayaran": "Menunggu pembayaran",
  "menunggu-verifikasi": "Menunggu verifikasi admin",
  "sudah-dibayar": "Sudah diverifikasi",
};

export const INQUIRY_REFERENCE_PATTERN =
  /^TS-[0-9]{4}-[0-9A-F]{10}$/;

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  baru: "Baru",
  diproses: "Diproses",
  "menunggu-dokumen": "Menunggu dokumen",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

export const SERVICE_CATEGORY_IDS = SERVICE_CATEGORIES.map(
  (category) => category.id,
);

export const SERVICE_CATEGORY_LABELS = Object.fromEntries(
  SERVICE_CATEGORIES.map((category) => [category.id, category.title]),
) as Record<ServiceCategoryId, string>;

export function isInquiryStatus(value: unknown): value is InquiryStatus {
  return (
    typeof value === "string" &&
    INQUIRY_STATUSES.includes(value as InquiryStatus)
  );
}

export function isPaymentTiming(value: unknown): value is PaymentTiming {
  return (
    typeof value === "string" &&
    PAYMENT_TIMINGS.includes(value as PaymentTiming)
  );
}

export function isPaymentStatus(value: unknown): value is PaymentStatus {
  return (
    typeof value === "string" &&
    PAYMENT_STATUSES.includes(value as PaymentStatus)
  );
}

export function isInquiryReferenceCode(value: unknown): value is string {
  return (
    typeof value === "string" && INQUIRY_REFERENCE_PATTERN.test(value)
  );
}

export function isServiceCategoryId(
  value: unknown,
): value is ServiceCategoryId {
  return (
    typeof value === "string" &&
    SERVICE_CATEGORIES.some((category) => category.id === value)
  );
}

export const PAYMENT_TIMINGS = [
  "sebelum-proses",
  "setelah-selesai",
] as const;

export type PaymentTiming = (typeof PAYMENT_TIMINGS)[number];

export const PAYMENT_TIMING_LABELS: Record<PaymentTiming, string> = {
  "sebelum-proses": "Sebelum proses dimulai",
  "setelah-selesai": "Setelah proses selesai",
};

export const PAYMENT_STATUSES = [
  "belum-diperlukan",
  "menunggu-pembayaran",
  "menunggu-verifikasi",
  "sudah-dibayar",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  "belum-diperlukan": "Belum ditagihkan",
  "menunggu-pembayaran": "Menunggu pembayaran",
  "menunggu-verifikasi": "Transfer perlu diverifikasi",
  "sudah-dibayar": "Pembayaran terverifikasi",
};

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

export function formatRupiah(value: number | null): string {
  if (value === null) return "Belum ditentukan";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

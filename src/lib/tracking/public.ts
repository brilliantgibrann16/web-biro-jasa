export const TRACKING_REFERENCE_CODE_PATTERN =
  /^TS-\d{4}-[A-F0-9]{10}$/;

export const TRACKING_REFERENCE_CODE_MAX_LENGTH = 18;

export type TrackingInquiryStatus =
  | "baru"
  | "diproses"
  | "menunggu-dokumen"
  | "selesai"
  | "dibatalkan";

export type TrackingStatusTone =
  | "new"
  | "progress"
  | "waiting"
  | "success"
  | "cancelled";

export interface PublicStatusPresentation {
  label: string;
  description: string;
  tone: TrackingStatusTone;
}

export const PUBLIC_TRACKING_STATUSES: Record<
  TrackingInquiryStatus,
  PublicStatusPresentation
> = {
  baru: {
    label: "Permintaan sudah diterima",
    description:
      "Admin akan memeriksa ringkasan kebutuhan Anda sebelum menjelaskan langkah berikutnya melalui WhatsApp.",
    tone: "new",
  },
  diproses: {
    label: "Pengurusan sedang berjalan",
    description:
      "Berkas sedang ditangani sesuai tahapan yang telah disepakati bersama admin.",
    tone: "progress",
  },
  "menunggu-dokumen": {
    label: "Menunggu dokumen dari Anda",
    description:
      "Ada dokumen atau informasi tambahan yang perlu dilengkapi. Periksa pesan WhatsApp dari admin.",
    tone: "waiting",
  },
  selesai: {
    label: "Pengurusan selesai",
    description:
      "Pengurusan pada kode ini telah selesai. Hubungi admin untuk memastikan penyerahan hasilnya.",
    tone: "success",
  },
  dibatalkan: {
    label: "Pengurusan tidak dilanjutkan",
    description:
      "Pengurusan pada kode ini telah dihentikan. Hubungi admin bila Anda memerlukan penjelasan.",
    tone: "cancelled",
  },
};

export type PublicPaymentStatus =
  | "belum-diperlukan"
  | "menunggu-pembayaran"
  | "menunggu-verifikasi"
  | "sudah-dibayar";

export type PublicPaymentTiming =
  | "sebelum-proses"
  | "setelah-selesai";

export interface PublicPaymentInstructions {
  bankName: string | null;
  accountNumber: string | null;
  accountHolder: string | null;
  qrisImageUrl: string | null;
  note: string | null;
}

export interface PublicTrackingPayment {
  required: boolean;
  status: PublicPaymentStatus;
  amountRupiah: string | null;
  timing: PublicPaymentTiming | null;
  verificationRequested: boolean;
  instructions: PublicPaymentInstructions | null;
}

export interface PublicTrackingResult {
  referenceCode: string;
  serviceCategory: string;
  serviceCategoryLabel: string;
  serviceDetail: string | null;
  status: TrackingInquiryStatus;
  statusPresentation: PublicStatusPresentation;
  updatedAt: string;
  payment: PublicTrackingPayment;
}

export interface TrackingLookupSuccessResponse {
  ok: true;
  tracking: PublicTrackingResult;
}

export interface TrackingErrorResponse {
  ok: false;
  message: string;
}

export function normalizeTrackingReferenceCode(value: unknown): string {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

export function isTrackingReferenceCode(value: string): boolean {
  return (
    value.length <= TRACKING_REFERENCE_CODE_MAX_LENGTH &&
    TRACKING_REFERENCE_CODE_PATTERN.test(value)
  );
}

export function isTrackingInquiryStatus(
  value: unknown,
): value is TrackingInquiryStatus {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(PUBLIC_TRACKING_STATUSES, value)
  );
}

export function isPublicPaymentStatus(
  value: unknown,
): value is PublicPaymentStatus {
  return (
    value === "belum-diperlukan" ||
    value === "menunggu-pembayaran" ||
    value === "menunggu-verifikasi" ||
    value === "sudah-dibayar"
  );
}

export function isPublicPaymentTiming(
  value: unknown,
): value is PublicPaymentTiming {
  return value === "sebelum-proses" || value === "setelah-selesai";
}

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

export function isServiceCategoryId(
  value: unknown,
): value is ServiceCategoryId {
  return (
    typeof value === "string" &&
    SERVICE_CATEGORIES.some((category) => category.id === value)
  );
}

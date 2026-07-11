import { COMPANY } from "@/lib/constants";
import { SERVICE_CATEGORY_LABELS } from "@/lib/inquiries/constants";
import type { InquiryPublicInput } from "@/lib/inquiries/types";

export function buildInquiryWhatsAppMessage(
  inquiry: InquiryPublicInput,
): string {
  const lines = [
    "Halo Biro Jasa Tiga Saudara, saya baru mengisi formulir inquiry di website.",
    "",
    `Nama: ${inquiry.full_name}`,
    `Nomor telepon: ${inquiry.phone}`,
    `Kategori: ${SERVICE_CATEGORY_LABELS[inquiry.service_category]}`,
  ];

  if (inquiry.service_detail) {
    lines.push(`Detail layanan: ${inquiry.service_detail}`);
  }
  if (inquiry.region) {
    lines.push(`Wilayah: ${inquiry.region}`);
  }
  if (inquiry.notes) {
    lines.push(`Catatan: ${inquiry.notes}`);
  }

  lines.push("", "Mohon bantu periksa kebutuhan awal saya.");
  return lines.join("\n");
}

export function buildInquiryWhatsAppUrl(inquiry: InquiryPublicInput): string {
  return COMPANY.whatsappUrl(buildInquiryWhatsAppMessage(inquiry));
}

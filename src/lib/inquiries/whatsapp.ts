import { COMPANY } from "@/lib/constants";
import { SERVICE_CATEGORY_LABELS } from "@/lib/inquiries/constants";
import type { InquiryPublicInput } from "@/lib/inquiries/types";

export function buildInquiryWhatsAppMessage(
  inquiry: InquiryPublicInput,
  options: { recorded?: boolean } = {},
): string {
  const lines = [
    "Halo Biro Jasa Tiga Saudara, saya ingin berkonsultasi. Berikut ringkasan kebutuhan yang saya isi melalui situs web:",
    "",
    `Nama: ${inquiry.full_name}`,
    `Nomor telepon: ${inquiry.phone}`,
    `Kategori: ${SERVICE_CATEGORY_LABELS[inquiry.service_category]}`,
  ];

  if (inquiry.service_detail) {
    lines.push(`Sub-layanan: ${inquiry.service_detail}`);
  }
  if (inquiry.region) {
    lines.push(`Wilayah: ${inquiry.region}`);
  }
  if (inquiry.notes) {
    lines.push(`Catatan: ${inquiry.notes}`);
  }

  if (options.recorded === false) {
    lines.push(
      "",
      "Catatan untuk admin: data formulir belum tersimpan di dashboard. Mohon catat percakapan ini secara manual.",
    );
  }

  lines.push("", "Mohon informasikan langkah awal dan dokumen yang perlu saya siapkan.");
  return lines.join("\n");
}

export function buildInquiryWhatsAppUrl(
  inquiry: InquiryPublicInput,
  options: { recorded?: boolean } = {},
): string {
  return COMPANY.whatsappUrl(buildInquiryWhatsAppMessage(inquiry, options));
}

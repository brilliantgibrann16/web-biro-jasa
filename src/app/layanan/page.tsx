import PageHero from "@/components/page/PageHero";
import CTASection from "@/components/sections/CTASection";
import ServiceCategories from "@/components/sections/ServiceCategories";
import { COMPANY, WHATSAPP_MESSAGES } from "@/lib/constants";
import { createRouteMetadata } from "@/lib/metadata";

export const metadata = createRouteMetadata("layanan");

export default function LayananPage() {
  return (
    <>
      <PageHero
        variant="index"
        title="Layanan pengurusan sesuai jenis dokumen Anda."
        intro="Jenis layanan ditentukan oleh dokumen, wilayah, kondisi data, dan tujuan pengurusan. Gunakan tiga kategori berikut untuk melihat cakupan dan persyaratan awalnya."
        asideTitle="Daftar layanan"
        asideBody="Pilih kategori yang paling sesuai. Jika masih ragu, sampaikan kondisi dokumen melalui konsultasi awal."
        points={[
          "Dokumen kendaraan untuk STNK, BPKB, balik nama, dan mutasi.",
          "Perizinan bangunan untuk PBG, SLF, PKKPR, dan fungsi bangunan.",
          "Legalitas teknis untuk ANDALALIN, dokumen damkar, rekomendasi teknis, dan kekayaan intelektual.",
        ]}
        primaryAction={{
          label: "Konsultasi via WhatsApp",
          href: COMPANY.whatsappUrl(WHATSAPP_MESSAGES.layanan),
          external: true,
          icon: "message",
        }}
        secondaryAction={{ label: "Lihat proses", href: "/proses" }}
      />
      <ServiceCategories />
      <CTASection message={WHATSAPP_MESSAGES.layanan} />
    </>
  );
}

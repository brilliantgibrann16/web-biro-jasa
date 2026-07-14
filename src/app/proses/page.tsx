import PageHero from "@/components/page/PageHero";
import CTASection from "@/components/sections/CTASection";
import ProcessSection from "@/components/sections/ProcessSection";
import StatsSection from "@/components/sections/StatsSection";
import { COMPANY, WHATSAPP_MESSAGES } from "@/lib/constants";
import { createRouteMetadata } from "@/lib/metadata";

export const metadata = createRouteMetadata("proses");

export default function ProsesPage() {
  return (
    <>
      <PageHero
        variant="process"
        title="Tahapan pengurusan dari pemeriksaan awal hingga serah terima."
        intro="Sebelum memulai, kami memeriksa kondisi dokumen, wilayah, dan tujuan pengurusan agar persyaratan serta tahapan dapat dijelaskan dengan jelas."
        asideTitle="Cara kami bekerja"
        asideBody="Halaman ini menjelaskan urutan kerja kami dari konsultasi awal hingga dokumen diserahkan kembali kepada Anda."
        points={[
          "Kebutuhan dan kondisi dokumen diperiksa lebih dahulu.",
          "Syarat yang kurang disampaikan sebelum proses dilanjutkan.",
          "Hasil akhir diperiksa sebelum serah terima.",
        ]}
        primaryAction={{
          label: "Konsultasi via WhatsApp",
          href: COMPANY.whatsappUrl(WHATSAPP_MESSAGES.proses),
          external: true,
          icon: "message",
        }}
        secondaryAction={{ label: "Lihat layanan", href: "/layanan" }}
      />
      <ProcessSection variant="detail" />
      <StatsSection />
      <CTASection message={WHATSAPP_MESSAGES.proses} />
    </>
  );
}

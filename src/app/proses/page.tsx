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
        title="Proses yang rapi dimulai sebelum berkas berjalan."
        intro="Kami tidak memulai pekerjaan dari perkiraan. Kondisi dokumen, wilayah, dan tujuan pengurusan perlu dibaca dulu agar klien tahu langkah yang sedang ditempuh."
        asideTitle="Cara kami bekerja"
        asideBody="Halaman ini menjelaskan urutan kerja kami dari konsultasi awal sampai dokumen kembali ke tangan klien."
        points={[
          "Kebutuhan dan kondisi dokumen dibaca lebih dulu.",
          "Syarat yang kurang disampaikan sebelum proses dilanjutkan.",
          "Hasil akhir diperiksa sebelum serah terima.",
        ]}
        primaryAction={{
          label: "Bicarakan Berkas",
          href: COMPANY.whatsappUrl(WHATSAPP_MESSAGES.proses),
          external: true,
          icon: "message",
        }}
        secondaryAction={{ label: "Lihat Layanan", href: "/layanan" }}
      />
      <ProcessSection variant="detail" />
      <StatsSection />
      <CTASection message={WHATSAPP_MESSAGES.proses} />
    </>
  );
}

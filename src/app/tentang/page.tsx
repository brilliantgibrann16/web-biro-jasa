import PageHero from "@/components/page/PageHero";
import CTASection from "@/components/sections/CTASection";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import {
  COMPANY,
  CORPORATE_PRINCIPLES,
  WHATSAPP_MESSAGES,
} from "@/lib/constants";
import { createRouteMetadata } from "@/lib/metadata";

export const metadata = createRouteMetadata("tentang");

export default function TentangPage() {
  return (
    <>
      <PageHero
        variant="manifesto"
        title="Kami membantu Anda mengurus dokumen dengan langkah yang jelas."
        intro="Biro Jasa Tiga Saudara mendampingi pengurusan dokumen kendaraan, perizinan bangunan, dan legalitas teknis. Kami memulai setiap kebutuhan dengan pemeriksaan informasi dan dokumen awal."
        asideTitle="Prinsip kami"
        asideBody="Kami menjelaskan persyaratan, tahapan, dan batas layanan sebelum pengurusan dimulai."
        points={CORPORATE_PRINCIPLES}
        primaryAction={{
          label: "Konsultasi via WhatsApp",
          href: COMPANY.whatsappUrl(WHATSAPP_MESSAGES.tentang),
          external: true,
          icon: "message",
        }}
        secondaryAction={{ label: "Lihat proses", href: "/proses" }}
      />
      <WhyChooseUs />
      <CTASection message={WHATSAPP_MESSAGES.tentang} />
    </>
  );
}

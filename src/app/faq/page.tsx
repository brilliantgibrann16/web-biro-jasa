import PageHero from "@/components/page/PageHero";
import CTASection from "@/components/sections/CTASection";
import FAQSection from "@/components/sections/FAQSection";
import { COMPANY, WHATSAPP_MESSAGES } from "@/lib/constants";
import { createRouteMetadata } from "@/lib/metadata";

export const metadata = createRouteMetadata("faq");

export default function FAQPage() {
  return (
    <>
      <PageHero
        variant="questions"
        title="Informasi yang perlu diketahui sebelum memulai pengurusan."
        intro="Jawaban berikut memberi gambaran umum mengenai persyaratan, biaya, dan waktu penyelesaian. Ketentuan akhir tetap bergantung pada kondisi dokumen dan instansi yang menangani."
        asideTitle="Siapkan informasi ini"
        asideBody="Informasi awal yang lengkap membantu kami menentukan dokumen dan tahapan yang perlu diperiksa."
        points={[
          "Jenis dokumen yang ingin diurus.",
          "Wilayah atau instansi yang berkaitan.",
          "Kondisi terakhir dan kendala yang sudah diketahui.",
        ]}
        primaryAction={{
          label: "Konsultasi via WhatsApp",
          href: COMPANY.whatsappUrl(WHATSAPP_MESSAGES.faq),
          external: true,
          icon: "message",
        }}
        secondaryAction={{ label: "Lihat layanan", href: "/layanan" }}
      />
      <FAQSection />
      <CTASection message={WHATSAPP_MESSAGES.faq} />
    </>
  );
}

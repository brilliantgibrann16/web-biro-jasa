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
        title="Pertanyaan awal yang sebaiknya dijawab sebelum proses dimulai."
        intro="Beberapa hal bisa dijelaskan secara umum, tetapi keputusan proses tetap bergantung pada kondisi berkas. FAQ ini membantu Anda menyiapkan pertanyaan yang lebih tepat saat konsultasi."
        asideTitle="Sebelum konsultasi"
        asideBody="Semakin jelas informasi awal yang Anda sampaikan, semakin mudah kami membaca kemungkinan alurnya."
        points={[
          "Jenis dokumen yang ingin diurus.",
          "Wilayah atau instansi yang berkaitan.",
          "Kondisi terakhir dan kendala yang sudah diketahui.",
        ]}
        primaryAction={{
          label: "Bicarakan Berkas",
          href: COMPANY.whatsappUrl(WHATSAPP_MESSAGES.faq),
          external: true,
          icon: "message",
        }}
        secondaryAction={{ label: "Lihat Layanan", href: "/layanan" }}
      />
      <FAQSection />
      <CTASection message={WHATSAPP_MESSAGES.faq} />
    </>
  );
}

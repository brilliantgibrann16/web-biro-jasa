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
        title="Kami bekerja di bagian yang sering ingin diselesaikan tanpa salah langkah."
        intro="Biro Jasa Tiga Saudara mendampingi klien yang ingin mengurus dokumen penting dengan cara yang lebih tertib. Kami menjaga agar keputusan diambil setelah kondisi berkas dibaca, bukan hanya dari cerita singkat."
        asideTitle="Prinsip kami"
        asideBody="Setiap dokumen punya pemilik, riwayat, dan akibat hukum. Cara menanganinya harus tenang dan bisa dipertanggungjawabkan."
        points={CORPORATE_PRINCIPLES}
        primaryAction={{
          label: "Bicarakan Berkas",
          href: COMPANY.whatsappUrl(WHATSAPP_MESSAGES.tentang),
          external: true,
          icon: "message",
        }}
        secondaryAction={{ label: "Lihat Proses", href: "/proses" }}
      />
      <WhyChooseUs />
      <CTASection message={WHATSAPP_MESSAGES.tentang} />
    </>
  );
}

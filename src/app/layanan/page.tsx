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
        title="Layanan dipisahkan berdasarkan kebutuhan dokumen."
        intro="Klien sering datang dengan nama layanan yang berbeda, tetapi akar persoalannya biasanya ada pada jenis dokumen, wilayah, dan tujuan pengurusan. Karena itu, kami membagi layanan ke dalam beberapa halaman yang lebih jelas."
        asideTitle="Indeks layanan"
        asideBody="Mulai dari kategori yang paling dekat dengan kebutuhan Anda. Jika masih belum tepat, konsultasi awal akan membantu memetakannya."
        points={[
          "Dokumen kendaraan untuk STNK, BPKB, mutasi, dan balik nama.",
          "Perizinan bangunan untuk PBG, SLF, PKKPR, dan fungsi bangunan.",
          "Legalitas teknis untuk rekomendasi, ANDALALIN, damkar, dan hak paten.",
        ]}
        primaryAction={{
          label: "Bicarakan Berkas",
          href: COMPANY.whatsappUrl(WHATSAPP_MESSAGES.layanan),
          external: true,
          icon: "message",
        }}
        secondaryAction={{ label: "Lihat Proses", href: "/proses" }}
      />
      <ServiceCategories />
      <CTASection message={WHATSAPP_MESSAGES.layanan} />
    </>
  );
}

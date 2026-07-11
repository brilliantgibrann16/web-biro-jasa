import { Clock3, MessageCircle, Phone } from "lucide-react";
import InquiryForm from "@/components/contact/InquiryForm";
import PageHero from "@/components/page/PageHero";
import {
  COMPANY,
  SERVICE_CATEGORIES,
  WHATSAPP_MESSAGES,
} from "@/lib/constants";
import { createRouteMetadata } from "@/lib/metadata";

export const metadata = createRouteMetadata("kontak");

const inquiryCategories = SERVICE_CATEGORIES.map((category) => ({
  id: category.id,
  title: category.title,
  services: category.services.map((service) => service.name),
}));

export default function KontakPage() {
  return (
    <>
      <PageHero
        variant="contact"
        title="Hubungi kami setelah Anda tahu dokumen apa yang ingin dibicarakan."
        intro="Tidak perlu menyiapkan semua jawaban sejak awal. Cukup sampaikan jenis dokumen, wilayah, dan kendala yang sedang terjadi. Kami bantu membaca langkah berikutnya."
        asideTitle="Kanal konsultasi"
        asideBody="WhatsApp menjadi kanal utama agar informasi awal, foto dokumen, dan catatan proses mudah ditelusuri kembali."
        points={[
          "Sampaikan jenis dokumen dan wilayah pengurusan.",
          "Kirim informasi awal yang diminta setelah konsultasi dibuka.",
          "Tunggu pemeriksaan berkas sebelum biaya diputuskan.",
        ]}
        primaryAction={{
          label: "Bicarakan Berkas",
          href: COMPANY.whatsappUrl(WHATSAPP_MESSAGES.kontak),
          external: true,
          icon: "message",
        }}
        secondaryAction={{ label: "Lihat FAQ", href: "/faq" }}
      />

      <section className="relative overflow-hidden bg-paper py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] lg:items-start">
          <div>
            <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-primary-dark">
              Kontak utama
            </p>
            <h2 className="mt-5 max-w-xl text-4xl font-semibold leading-[1.04] text-accent sm:text-5xl">
              Konsultasi awal lebih baik dimulai dengan cerita yang lengkap.
            </h2>
            <p className="mt-7 max-w-xl text-base leading-8 text-neutral-500">
              Tuliskan kebutuhan dalam satu pesan singkat. Jangan kirim nomor
              identitas atau foto dokumen sensitif sebelum informasi itu
              diminta untuk pemeriksaan yang relevan.
            </p>
          </div>

          <div className="border-y border-neutral-200">
            <a
              href={COMPANY.whatsappUrl(WHATSAPP_MESSAGES.kontak)}
              target="_blank"
              rel="noopener noreferrer"
              className="group grid gap-4 border-b border-neutral-200 py-6 last:border-b-0 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:items-center"
            >
              <MessageCircle className="h-5 w-5 text-primary-dark" aria-hidden="true" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-dark">
                  WhatsApp
                </p>
                <p className="mt-2 text-lg font-extrabold text-accent">
                  {COMPANY.phone}
                </p>
              </div>
              <span className="text-sm font-extrabold text-primary-dark transition-colors group-hover:text-accent">
                Kirim pesan
              </span>
            </a>

            <a
              href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
              className="group grid gap-4 border-b border-neutral-200 py-6 last:border-b-0 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:items-center"
            >
              <Phone className="h-5 w-5 text-primary-dark" aria-hidden="true" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-dark">
                  Telepon
                </p>
                <p className="mt-2 text-lg font-extrabold text-accent">
                  {COMPANY.phone}
                </p>
              </div>
              <span className="text-sm font-extrabold text-primary-dark transition-colors group-hover:text-accent">
                Hubungi
              </span>
            </a>

            <div className="grid gap-4 py-6 sm:grid-cols-[2rem_minmax(0,1fr)] sm:items-center">
              <Clock3 className="h-5 w-5 text-primary-dark" aria-hidden="true" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-dark">
                  Jam layanan
                </p>
                <p className="mt-2 text-lg font-extrabold text-accent">
                  {COMPANY.hours}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <InquiryForm categories={inquiryCategories} />

      <section className="relative overflow-hidden bg-warm-50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-end">
            <div>
              <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
                Topik konsultasi
              </p>
              <h2 className="mt-5 max-w-2xl font-display text-4xl font-semibold leading-[1.03] text-accent sm:text-5xl">
                Buka percakapan dari ruang dokumen yang paling dekat.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-neutral-600 lg:justify-self-end">
              Tautan berikut sudah membawa konteks kategori ke WhatsApp. Detail kasus tetap dibaca setelah percakapan dimulai.
            </p>
          </div>

          <div className="mt-12 border-y border-neutral-200">
            {SERVICE_CATEGORIES.map((category) => (
              <a
                key={category.id}
                href={COMPANY.whatsappUrl(category.whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid gap-4 border-b border-neutral-200 py-7 last:border-b-0 md:grid-cols-[minmax(0,0.58fr)_minmax(0,1fr)_auto] md:items-center"
              >
                <div>
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-primary-dark">
                    {category.navLabel}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-accent">
                    {category.title}
                  </h3>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-neutral-600">
                  {category.summary}
                </p>
                <span className="inline-flex items-center gap-2 border-b border-primary-dark pb-2 text-sm font-extrabold text-primary-dark transition-colors group-hover:text-accent">
                  Buka chat
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

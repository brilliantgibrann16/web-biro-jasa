import { ArrowRight, MessageCircle } from "lucide-react";
import { COMPANY } from "@/lib/constants";

interface CTASectionProps {
  message?: string;
}

export default function CTASection({
  message = COMPANY.defaultWhatsappMessage,
}: CTASectionProps) {
  return (
    <section
      className="relative overflow-hidden bg-page py-20 md:py-28"
      aria-labelledby="cta-title"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid border-y border-neutral-200 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.52fr)]">
          <div className="py-10 lg:pr-14">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
              Konsultasi awal
            </p>
            <h2
              id="cta-title"
              className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.02] text-accent sm:text-6xl"
            >
              Sampaikan jenis dokumen dan kendalanya. Kami bantu menentukan langkah awal.
            </h2>
            <p className="mt-7 max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
              Sampaikan jenis dokumen, wilayah pengurusan, dan kendala yang sedang terjadi. Kami akan menjelaskan informasi awal yang perlu disiapkan.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href={COMPANY.whatsappUrl(message)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-sm bg-primary-dark px-8 py-4 text-base font-extrabold text-white transition-colors hover:bg-navy"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                Konsultasi via WhatsApp
              </a>
              <a
                href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
                className="inline-flex min-h-12 items-center gap-2 border-b border-primary-dark text-base font-extrabold text-primary-dark transition-colors hover:text-accent"
              >
                Telepon kami
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <aside className="bg-inset px-6 py-10 sm:px-8 lg:border-l lg:border-neutral-200">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-primary-dark">
              Informasi kontak
            </p>
            <dl className="mt-7 divide-y divide-neutral-200 border-y border-neutral-200">
              <div className="py-5">
                <dt className="text-[0.62rem] font-black uppercase tracking-[0.17em] text-neutral-600">
                  Jam layanan
                </dt>
                <dd className="mt-2 text-base font-semibold leading-7 text-accent">
                  {COMPANY.hours}
                </dd>
              </div>
              <div className="py-5">
                <dt className="text-[0.62rem] font-black uppercase tracking-[0.17em] text-neutral-600">
                  Kontak langsung
                </dt>
                <dd className="mt-2 text-base font-semibold text-accent">
                  {COMPANY.phone}
                </dd>
              </div>
            </dl>
            <p className="mt-6 text-sm leading-7 text-neutral-600">
              WhatsApp menjadi kanal utama agar informasi awal dan catatan dokumen mudah ditelusuri kembali.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

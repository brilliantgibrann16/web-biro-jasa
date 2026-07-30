import { ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import InquiryFormCard from "@/components/contact/InquiryFormCard";
import { COMPANY, SERVICE_CATEGORIES } from "@/lib/constants";

const proofPoints = [
  "Pemeriksaan awal",
  "Tahapan dijelaskan",
  "Hasil diverifikasi",
];

const inquiryCategories = SERVICE_CATEGORIES.map((category) => ({
  id: category.id,
  title: category.title,
  services: category.services.map((service) => service.name),
}));

function HeroInquiryPanel({
  headingId,
  idPrefix,
}: {
  headingId: string;
  idPrefix: string;
}) {
  return (
    <div
      aria-labelledby={headingId}
      className="rounded-sm border border-neutral-200 bg-panel p-5 text-accent shadow-elevated sm:p-6"
    >
      <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-primary-dark">
        Mulai konsultasi
      </p>
      <h2
        id={headingId}
        className="mt-2 font-display text-2xl font-bold leading-snug text-accent"
      >
        Isi ringkasan kebutuhan Anda.
      </h2>
      <p className="mt-2 text-sm leading-6 text-neutral-600">
        Setelah dikirim, WhatsApp terbuka dengan ringkasan yang sama sehingga
        percakapan dapat langsung dilanjutkan.
      </p>
      <div className="mt-5">
        <InquiryFormCard
          categories={inquiryCategories}
          idPrefix={idPrefix}
          compact
          frameless
        />
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section
      className="relative isolate overflow-hidden bg-editorial-base text-editorial-text"
      aria-label="Biro Jasa Tiga Saudara"
    >
      <div className="editorial-gradient-hero absolute inset-0" />
      <div className="noise absolute inset-0 opacity-45" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-28 sm:px-8 lg:hidden">
        <p className="text-[0.64rem] font-black uppercase tracking-[0.2em] text-primary">
          Pengurusan dokumen dan perizinan
        </p>
        <h1 className="mt-4 font-display text-[3.15rem] font-semibold leading-[0.93] text-editorial-text">
          Biro Jasa
          <span className="block text-primary">Tiga Saudara</span>
        </h1>
        <p className="mt-5 max-w-md text-lg font-semibold leading-7 text-editorial-text">
          Pengurusan dokumen kendaraan, perizinan bangunan, dan legalitas teknis dengan pemeriksaan awal yang jelas.
        </p>

        <div className="mt-7">
          <HeroInquiryPanel
            headingId="hero-inquiry-title-mobile"
            idPrefix="hero-m-"
          />
        </div>

        <div className="mt-7 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <a
            href={COMPANY.whatsappUrl(COMPANY.defaultWhatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-primary-dark px-5 py-3.5 text-sm font-extrabold text-white transition-colors hover:bg-editorial-action-hover"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            Konsultasi via WhatsApp
          </a>
          <Link
            href="/layanan"
            className="inline-flex min-h-12 items-center gap-2 border-b border-editorial-line text-sm font-extrabold text-editorial-text transition-colors hover:text-primary"
          >
            Layanan
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 border-t border-editorial-line pt-5">
          {proofPoints.map((item) => (
            <p key={item} className="text-xs font-bold text-editorial-muted">
              {item}
            </p>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto hidden w-full max-w-7xl grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] items-center gap-14 px-8 pb-20 pt-32 lg:grid">
        <div className="max-w-3xl">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-primary">
            Pengurusan dokumen dan perizinan
          </p>
          <div
            aria-level={1}
            className="mt-5 font-display text-[5.2rem] font-semibold leading-[0.94] text-editorial-text"
            role="heading"
          >
            Biro Jasa
            <span className="block text-primary">Tiga Saudara</span>
          </div>

          <p className="mt-6 max-w-xl text-xl font-medium leading-9 text-editorial-text">
            Pengurusan dokumen kendaraan, perizinan bangunan, dan legalitas teknis dengan pemeriksaan awal yang jelas.
          </p>
          <p className="mt-5 max-w-xl text-base leading-8 text-editorial-muted">
            {COMPANY.subtitle}
          </p>

          <div className="mt-9 flex gap-3">
            <a
              href={COMPANY.whatsappUrl(COMPANY.defaultWhatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-3 rounded-sm bg-primary-dark px-7 py-4 text-base font-extrabold text-white transition-colors hover:bg-editorial-action-hover"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Konsultasi via WhatsApp
            </a>
            <Link
              href="/layanan"
              className="group inline-flex items-center justify-center gap-3 rounded-sm border border-editorial-line px-7 py-4 text-base font-extrabold text-editorial-text transition-colors hover:border-primary hover:text-primary"
            >
              Lihat layanan
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3 border-t border-editorial-line pt-6">
            {proofPoints.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-bold text-editorial-muted">
                <span className="h-px w-6 bg-primary/70" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <HeroInquiryPanel
          headingId="hero-inquiry-title-desktop"
          idPrefix="hero-d-"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-page to-transparent" />
    </section>
  );
}

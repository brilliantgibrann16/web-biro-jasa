import { ArrowRight, MessageCircle, Stamp } from "lucide-react";
import Link from "next/link";
import { COMPANY } from "@/lib/constants";

const proofPoints = [
  "Pemeriksaan awal",
  "Tahapan dijelaskan",
  "Hasil diverifikasi",
];

const serviceLedger = [
  "STNK / BPKB",
  "PBG / SLF",
  "ANDALALIN",
  "Legalitas teknis",
];

function DesktopDossier() {
  return (
    <div
      className="relative mx-auto min-h-[640px] w-full max-w-[540px]"
      aria-hidden="true"
    >
      <div className="editorial-frame absolute bottom-6 right-0 top-16 w-[72%] rotate-2 rounded-sm border bg-editorial-faint" />
      <div className="dossier-grid absolute right-16 top-0 h-[580px] w-[400px] -rotate-2 overflow-hidden rounded-sm border border-dossier-border bg-dossier-surface p-8 text-dossier-text shadow-[0_38px_90px_-56px_rgba(0,0,0,0.92)]">
        <div className="flex items-start justify-between gap-6 border-b border-dossier-line pb-7">
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-dossier-accent">
              Pemeriksaan awal
            </p>
            <p className="mt-3 font-display text-2xl font-bold leading-tight text-dossier-text">
              Ringkasan dokumen sebelum pengurusan
            </p>
          </div>
          <div className="grid h-14 w-14 shrink-0 place-items-center border border-dossier-accent-line text-dossier-accent">
            <Stamp className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-8">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-dossier-muted">
            Kategori layanan
          </p>
          <div className="mt-4 divide-y divide-dossier-line border-y border-dossier-line">
            {serviceLedger.map((item, index) => (
              <div
                key={item}
                className="grid grid-cols-[2.4rem_minmax(0,1fr)_4rem] items-center gap-3 py-3.5"
              >
                <span
                  className="font-display text-2xl font-black leading-none text-dossier-ghost"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-bold text-dossier-strong">{item}</span>
                <span className="h-px bg-dossier-accent-line" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-5 border-t border-dossier-line pt-5">
          <div>
            <p className="text-[0.6rem] font-black uppercase tracking-[0.17em] text-dossier-muted">
              Hasil pemeriksaan
            </p>
            <p className="mt-2 text-sm font-bold text-dossier-text">
              Persyaratan diperiksa sebelum perkiraan biaya diberikan
            </p>
          </div>
          <p className="text-[0.6rem] font-black uppercase tracking-[0.17em] text-dossier-accent">
            TS / 01
          </p>
        </div>
      </div>

      <div className="absolute left-0 top-56 h-px w-56 bg-gradient-to-r from-transparent via-primary-light/55 to-transparent" />
      <p className="absolute bottom-2 right-14 text-[0.62rem] font-black uppercase tracking-[0.22em] text-editorial-muted">
        Periksa / Proses / Verifikasi
      </p>
    </div>
  );
}

function MobileCaseFile() {
  return (
    <div className="relative h-[198px] w-full" aria-hidden="true">
      <div className="editorial-frame absolute inset-x-5 bottom-0 top-5 rotate-2 rounded-sm border bg-editorial-faint" />
      <div className="absolute inset-x-0 top-0 -rotate-1 rounded-sm border border-dossier-border bg-dossier-surface p-5 text-dossier-text shadow-[0_26px_58px_-38px_rgba(0,0,0,0.92)]">
        <div className="flex items-center justify-between border-b border-dossier-line pb-4">
          <div>
            <p className="text-[0.58rem] font-black uppercase tracking-[0.2em] text-dossier-accent">
              Ringkasan pemeriksaan
            </p>
            <p className="mt-2 font-display text-lg font-bold text-dossier-text">
              Berkas diperiksa sebelum proses dimulai.
            </p>
          </div>
          <Stamp className="h-6 w-6 shrink-0 text-dossier-accent" />
        </div>
        <div className="mt-4 grid grid-cols-3 divide-x divide-dossier-line border-y border-dossier-line py-3 text-center">
          {[
            ["Dokumen", "diperiksa"],
            ["Wilayah", "dipastikan"],
            ["Tujuan", "dicatat"],
          ].map(([label, value]) => (
            <div key={label} className="px-2">
              <p className="text-[0.55rem] font-black uppercase tracking-[0.14em] text-dossier-muted">
                {label}
              </p>
              <p className="mt-1 text-xs font-extrabold text-dossier-text">{value}</p>
            </div>
          ))}
        </div>
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

        <div className="mt-6">
          <MobileCaseFile />
        </div>

        <p className="mt-5 border-l border-editorial-line pl-4 text-sm font-semibold leading-6 text-editorial-muted">
          {COMPANY.tagline}
        </p>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
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

      <div className="relative z-10 mx-auto hidden min-h-[92vh] w-full max-w-7xl grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] items-center gap-10 px-8 pb-24 pt-36 lg:grid">
        <div className="max-w-3xl">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-primary">
            Pengurusan dokumen dan perizinan
          </p>
          <div
            aria-level={1}
            className="mt-5 font-display text-[6.7rem] font-semibold leading-[0.94] text-editorial-text"
            role="heading"
          >
            Biro Jasa
            <span className="block text-primary">Tiga Saudara</span>
          </div>

          <p className="mt-7 max-w-2xl text-2xl font-medium leading-10 text-editorial-text">
            Pengurusan dokumen kendaraan, perizinan bangunan, dan legalitas teknis dengan pemeriksaan awal yang jelas.
          </p>
          <p className="mt-6 max-w-xl text-base leading-8 text-editorial-muted">
            {COMPANY.subtitle}
          </p>

          <div className="mt-10 flex gap-3">
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

        <DesktopDossier />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-page to-transparent" />
    </section>
  );
}

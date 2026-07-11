import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PROCESS_STEPS } from "@/lib/constants";

interface ProcessSectionProps {
  variant?: "preview" | "detail";
}

const previewChapters = [
  { label: "Baca kondisi", step: PROCESS_STEPS[0] },
  { label: "Tentukan jalur", step: PROCESS_STEPS[2] },
  { label: "Periksa hasil", step: PROCESS_STEPS[4] },
];

export default function ProcessSection({ variant = "preview" }: ProcessSectionProps) {
  if (variant === "detail") {
    return (
      <section
        id="proses"
        className="relative overflow-hidden bg-editorial-base py-24 text-editorial-text md:py-36"
        aria-labelledby="process-detail-title"
      >
        <div className="editorial-gradient-process absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-8 border-b border-editorial-line pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.5fr)] lg:items-end">
            <div>
              <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary">
                Lima tahap kerja
              </p>
              <h2
                id="process-detail-title"
                className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.02] text-editorial-text sm:text-6xl"
              >
                Posisi berkas harus tetap bisa dibaca dari awal sampai serah terima.
              </h2>
            </div>
            <p className="border-l border-editorial-line pl-5 text-base leading-8 text-editorial-muted">
              Setiap tahap punya pertanyaan yang berbeda. Urutannya membantu kami menjelaskan apa yang sudah diketahui, apa yang masih kurang, dan apa yang sedang ditunggu.
            </p>
          </div>

          <ol className="relative mt-8 border-l border-editorial-line lg:ml-20">
            {PROCESS_STEPS.map((step, index) => (
              <li
                key={step.step}
                className="relative border-b border-editorial-line py-9 pl-7 last:border-b-0 sm:pl-10 lg:py-12 lg:pl-16"
              >
                <span className="absolute -left-[0.44rem] top-12 h-3 w-3 border-2 border-primary bg-editorial-base" />
                <article className="grid gap-7 lg:grid-cols-[9rem_minmax(0,0.75fr)_minmax(0,1fr)] lg:items-start">
                  <div>
                    <p className="text-[0.64rem] font-black uppercase tracking-[0.18em] text-primary">
                      Tahap {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-3 font-display text-5xl font-black leading-none text-editorial-ghost">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-semibold leading-tight text-editorial-text sm:text-3xl">
                      {step.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-editorial-subtle">
                      {step.description}
                    </p>
                  </div>
                  <div className="border-l border-editorial-line pl-5">
                    <p className="text-[0.62rem] font-black uppercase tracking-[0.17em] text-editorial-ghost">
                      Yang dijelaskan pada tahap ini
                    </p>
                    <p className="mt-3 text-sm font-medium leading-7 text-editorial-muted sm:text-base sm:leading-8">
                      {step.detail}
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section
      id="proses"
      className="relative overflow-hidden bg-editorial-base py-24 text-editorial-text md:py-36"
      aria-labelledby="process-preview-title"
    >
      <div className="editorial-gradient-process absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.42fr)] lg:items-end">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary">
              Tiga bab ringkas
            </p>
            <h2
              id="process-preview-title"
              className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.02] text-editorial-text sm:text-6xl"
            >
              Berkas dibaca, jalur ditentukan, hasil diperiksa.
            </h2>
          </div>
          <div>
            <p className="text-base leading-8 text-editorial-muted">
              Ringkasan ini menunjukkan arah kerja. Halaman proses menjelaskan lima tahapnya secara utuh.
            </p>
            <Link
              href="/proses"
              className="mt-6 inline-flex items-center gap-2 border-b border-primary pb-2 text-sm font-extrabold text-primary"
            >
              Baca proses lengkap
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-14 grid gap-9 lg:grid-cols-3 lg:gap-10">
          {previewChapters.map(({ label, step }, index) => (
            <article
              key={label}
              className={`relative border-t-2 border-primary/60 pt-6 ${
                index === 1 ? "lg:mt-10" : index === 2 ? "lg:mt-20" : ""
              }`}
            >
              <p className="font-display text-5xl font-black leading-none text-editorial-ghost">
                {label}
              </p>
              <h3 className="mt-6 font-display text-2xl font-semibold leading-tight text-editorial-text">
                {step.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-editorial-subtle">{step.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

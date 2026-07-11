import { INDUSTRIES } from "@/lib/constants";

export default function IndustriesSection() {
  const [leadIndustry, ...supportingIndustries] = INDUSTRIES;

  return (
    <section
      className="relative overflow-hidden bg-paper py-20 md:py-28"
      aria-labelledby="industries-title"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-end">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
              Profil kebutuhan
            </p>
            <h2
              id="industries-title"
              className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.03] text-accent sm:text-5xl"
            >
              Kebutuhan pribadi, usaha, dan proyek dibaca dengan konteks yang berbeda.
            </h2>
          </div>
          <p className="max-w-2xl border-l border-primary-dark/35 pl-5 text-base leading-8 text-neutral-600 lg:justify-self-end">
            Dokumen yang sama dapat memiliki alur berbeda ketika pemilik, fungsi aset, wilayah, atau tujuan pengurusannya berubah.
          </p>
        </div>

        <article className="mt-14 grid gap-6 border-y border-neutral-200 py-8 md:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] md:items-center">
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-primary-dark">
              Titik mulai yang sering ditemui
            </p>
            <h3 className="mt-3 font-display text-3xl font-semibold leading-tight text-accent sm:text-4xl">
              {leadIndustry.title}
            </h3>
          </div>
          <p className="max-w-3xl text-base leading-8 text-neutral-600">
            {leadIndustry.description}
          </p>
        </article>

        <div className="mt-8 grid gap-x-12 sm:grid-cols-2">
          {supportingIndustries.map((industry, index) => (
            <article
              key={industry.title}
              className={`border-t border-neutral-200 py-7 ${
                index === supportingIndustries.length - 1 ? "sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-12" : ""
              }`}
            >
              <h3 className="font-display text-xl font-semibold leading-snug text-accent sm:text-2xl">
                {industry.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-neutral-600 sm:mt-4">
                {industry.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

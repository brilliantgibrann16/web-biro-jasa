import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SERVICE_CATEGORIES } from "@/lib/constants";

export default function ServiceCategories() {
  return (
    <section
      id="kategori"
      className="relative overflow-hidden bg-page py-24 md:py-32"
      aria-labelledby="service-index-title"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-end">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
              Kategori layanan
            </p>
            <h2
              id="service-index-title"
              className="mt-5 max-w-2xl font-display text-4xl font-semibold leading-[1.03] text-accent sm:text-5xl"
            >
              Pilih layanan sesuai jenis dokumen yang ingin diurus.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-neutral-600 lg:justify-self-end">
            Setiap kategori menjelaskan cakupan layanan, dokumen awal, dan tahapan yang perlu diperhatikan.
          </p>
        </div>

        <div className="mt-14 border-y border-neutral-200">
          {SERVICE_CATEGORIES.map((category, index) => (
            <article
              key={category.id}
              className={`border-b border-neutral-200 py-9 last:border-b-0 ${
                index === 1 ? "lg:ml-16" : index === 2 ? "lg:ml-6" : ""
              }`}
            >
              <div className="grid gap-7 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1fr)_auto] lg:items-start">
                <div>
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-primary-dark">
                    {category.navLabel}
                  </p>
                  <h3 className="mt-3 font-display text-3xl font-semibold leading-tight text-accent sm:text-4xl">
                    {category.title}
                  </h3>
                  <p className="mt-4 text-sm font-semibold leading-7 text-primary-dark">
                    {category.summary}
                  </p>
                </div>

                <div>
                  <p className="max-w-3xl text-sm leading-7 text-neutral-600 md:text-base md:leading-8">
                    {category.heroIntro}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2" aria-label={`Layanan ${category.title}`}>
                    {category.services.map((service) => (
                      <li key={service.name} className="flex items-center gap-2 text-xs font-bold text-neutral-600">
                        <span className="h-1 w-1 bg-primary-dark" />
                        {service.name}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/layanan/${category.slug}`}
                  className="inline-flex items-center gap-2 self-start border-b border-primary-dark pb-2 text-sm font-extrabold text-primary-dark transition-colors hover:text-accent"
                >
                  Lihat detail
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

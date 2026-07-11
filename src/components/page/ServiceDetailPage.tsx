import CTASection from "@/components/sections/CTASection";
import { COMPANY, type ServiceCategory } from "@/lib/constants";
import PageHero from "./PageHero";

interface ServiceDetailPageProps {
  category: ServiceCategory;
}

export default function ServiceDetailPage({ category }: ServiceDetailPageProps) {
  const Icon = category.icon;

  return (
    <>
      <PageHero
        variant="service"
        title={category.heroTitle}
        intro={category.heroIntro}
        asideTitle={category.title}
        asideBody={category.summary}
        points={category.processFocus.slice(0, 3)}
        primaryAction={{
          label: "Bicarakan Berkas",
          href: COMPANY.whatsappUrl(category.whatsappMessage),
          external: true,
          icon: "message",
        }}
        secondaryAction={{ label: "Lihat Semua Layanan", href: "/layanan" }}
      />

      <section className="relative overflow-hidden bg-paper py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(310px,0.52fr)] lg:gap-20">
          <div>
            <div className="mb-8 flex items-center gap-3 text-primary-dark">
              <Icon className="h-6 w-6" aria-hidden="true" />
              <p className="text-[0.68rem] font-black uppercase tracking-[0.2em]">
                Ruang lingkup
              </p>
            </div>
            <div className="space-y-7">
              {category.narrative.map((paragraph) => (
                <p
                  key={paragraph}
                  className="max-w-3xl font-display text-2xl font-medium leading-10 text-accent sm:text-3xl sm:leading-[1.5]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <aside className="border-t-2 border-accent pt-6">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-primary-dark">
              Biasanya cocok untuk
            </p>
            <div className="mt-5 space-y-5">
              {category.suitableFor.map((item) => (
                <p
                  key={item}
                  className="border-l border-primary-dark/35 pl-4 text-sm font-medium leading-7 text-neutral-600"
                >
                  {item}
                </p>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="relative overflow-hidden bg-warm-50 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:items-end">
            <div>
              <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
                Katalog kategori
              </p>
              <h2 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.03] text-accent sm:text-5xl">
                Nama layanan boleh berbeda. Kondisi berkas tetap menjadi titik awalnya.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-neutral-600 lg:justify-self-end">
              Jika istilah yang Anda cari tidak persis sama, sampaikan kebutuhan sebenarnya. Kami akan membantu menempatkannya pada alur yang sesuai.
            </p>
          </div>

          <div className="mt-14 border-y border-neutral-200">
            {category.services.map((service, index) => (
              <article
                key={service.name}
                className="grid gap-5 border-b border-neutral-200 py-7 last:border-b-0 md:grid-cols-[4rem_minmax(0,0.52fr)_minmax(0,1fr)] md:items-start"
              >
                <span className="font-display text-3xl font-black leading-none text-neutral-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-xl font-semibold leading-snug text-accent sm:text-2xl">
                  {service.name}
                </h3>
                <p className="max-w-3xl text-sm leading-7 text-neutral-600 md:text-base md:leading-8">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-paper py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.64fr)_minmax(0,1.36fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
              Pemeriksaan berkas
            </p>
            <h2 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.03] text-accent sm:text-5xl">
              Bagian yang dibaca sebelum langkah disarankan.
            </h2>
            <p className="mt-7 max-w-lg text-base leading-8 text-neutral-600">
              Daftar ini bukan syarat final untuk semua kasus. Ia menunjukkan arah pemeriksaan awal sebelum dokumen diproses lebih jauh.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <article className="bg-navy px-6 py-8 text-white sm:px-8">
              <p className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-primary-light">
                Dokumen yang biasanya dicek
              </p>
              <div className="mt-6 divide-y divide-white/12 border-y border-white/12">
                {category.documents.map((item) => (
                  <p key={item} className="py-4 text-sm leading-7 text-neutral-300">
                    {item}
                  </p>
                ))}
              </div>
            </article>

            <article className="border-y border-neutral-200 py-8 lg:px-6">
              <p className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-primary-dark">
                Fokus proses
              </p>
              <div className="mt-6 space-y-6">
                {category.processFocus.map((item) => (
                  <p
                    key={item}
                    className="border-l-2 border-primary-dark/45 pl-5 text-sm font-medium leading-7 text-neutral-600"
                  >
                    {item}
                  </p>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <CTASection message={category.whatsappMessage} />
    </>
  );
}

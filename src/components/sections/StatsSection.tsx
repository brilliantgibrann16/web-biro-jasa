import { VALUE_PROPS } from "@/lib/constants";

export default function StatsSection() {
  return (
    <section
      className="relative overflow-hidden bg-page py-24 md:py-32"
      aria-labelledby="service-charter-title"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.68fr)_minmax(0,1.32fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
            Piagam layanan
          </p>
          <h2
            id="service-charter-title"
            className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.03] text-accent sm:text-5xl"
          >
            Ukuran kami bukan angka besar, tetapi informasi yang tetap bisa dijelaskan.
          </h2>
          <p className="mt-7 max-w-lg border-l border-primary-dark/35 pl-5 text-base leading-8 text-neutral-600">
            Empat catatan ini menjadi cara kami menilai apakah sebuah proses benar-benar membantu klien.
          </p>
        </div>

        <div className="grid border-y border-neutral-200 md:grid-cols-2">
          {VALUE_PROPS.map((item, index) => (
            <article
              key={item.title}
              className={`py-7 md:px-7 ${
                index < 2 ? "border-b border-neutral-200" : index === 2 ? "border-b border-neutral-200 md:border-b-0" : ""
              } ${index % 2 === 0 ? "md:border-r md:border-neutral-200" : ""}`}
            >
              <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-primary-dark">
                Catatan kerja
              </p>
              <h3 className="mt-4 font-display text-2xl font-semibold leading-tight text-accent">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

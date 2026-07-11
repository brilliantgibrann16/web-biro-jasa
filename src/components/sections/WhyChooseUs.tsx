import { WHY_CHOOSE_US } from "@/lib/constants";

export default function WhyChooseUs() {
  const [leadItem, counterItem, ...workingNotes] = WHY_CHOOSE_US;

  return (
    <section
      id="keunggulan"
      className="relative overflow-hidden bg-paper py-24 md:py-36"
      aria-labelledby="why-us-title"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-end">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
              Sikap kerja
            </p>
            <h2
              id="why-us-title"
              className="mt-5 max-w-2xl font-display text-4xl font-semibold leading-[1.03] text-accent sm:text-5xl"
            >
              Kepercayaan dibangun dari keputusan yang dapat dijelaskan ulang.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-neutral-600 lg:justify-self-end">
            Dokumen klien menyangkut kendaraan, bangunan, atau usaha. Cara kerjanya harus cukup jelas untuk dibaca kembali ketika proses sudah selesai.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:items-stretch">
          <article className="relative overflow-hidden bg-navy p-7 text-white sm:p-10 lg:col-span-7 lg:min-h-[430px]">
            <div className="absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(135deg,transparent,rgba(215,154,85,0.12))]" />
            <div className="relative flex h-full flex-col">
              <p className="text-[0.66rem] font-black uppercase tracking-[0.19em] text-primary-light">
                {leadItem.proof}
              </p>
              <h3 className="mt-auto max-w-2xl pt-20 font-display text-4xl font-semibold leading-[1.03] sm:text-5xl">
                {leadItem.title}
              </h3>
              <p className="mt-6 max-w-xl text-base leading-8 text-neutral-300">
                {leadItem.description}
              </p>
            </div>
          </article>

          <article className="flex flex-col border-y border-neutral-200 py-8 lg:col-span-5 lg:px-8">
            <p className="text-[0.66rem] font-black uppercase tracking-[0.19em] text-primary-dark">
              {counterItem.proof}
            </p>
            <h3 className="mt-auto pt-16 font-display text-3xl font-semibold leading-tight text-accent sm:text-4xl">
              {counterItem.title}
            </h3>
            <p className="mt-6 text-base leading-8 text-neutral-600">
              {counterItem.description}
            </p>
          </article>
        </div>

        <div className="mt-10 grid gap-x-12 sm:grid-cols-2">
          {workingNotes.map((item) => (
            <article key={item.title} className="border-t border-neutral-200 py-7">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-primary-dark">
                {item.proof}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-accent sm:text-2xl">
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

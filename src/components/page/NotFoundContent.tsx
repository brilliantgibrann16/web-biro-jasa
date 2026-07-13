import { ArrowRight, SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFoundContent() {
  return (
    <section className="relative flex min-h-[72vh] items-center overflow-hidden bg-paper pb-20 pt-36 text-accent md:pb-28 md:pt-44">
      <div className="absolute inset-y-0 right-0 hidden w-[30%] bg-warm-50 lg:block" />
      <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.42fr)] lg:items-end">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
            404 / Halaman tidak ditemukan
          </p>
          <h1 className="mt-6 max-w-4xl font-display text-[3rem] font-semibold leading-[0.98] sm:text-6xl lg:text-[5.6rem]">
            Alamat ini tidak membawa ke halaman yang tersedia.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-neutral-600">
            Tautannya mungkin sudah berubah atau ada bagian alamat yang tidak
            lengkap. Tidak ada data yang perlu Anda kirim untuk kembali ke jalur
            utama.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-primary-dark px-7 py-4 text-base font-extrabold text-white transition-colors hover:bg-navy"
            >
              Kembali ke beranda
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/layanan"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-neutral-300 px-7 py-4 text-base font-extrabold text-accent transition-colors hover:border-primary-dark hover:text-primary-dark"
            >
              Lihat layanan
            </Link>
          </div>
        </div>

        <aside className="border-l border-primary-dark/35 pl-6 lg:pl-8">
          <SearchX className="h-7 w-7 text-primary-dark" aria-hidden="true" />
          <p className="mt-5 text-base font-semibold leading-8 text-accent">
            Jika Anda sedang mencari jalur konsultasi, formulir ringkas tersedia
            di halaman kontak.
          </p>
          <Link
            href="/kontak#inquiry-form"
            className="mt-6 inline-flex items-center gap-2 border-b border-primary-dark pb-2 text-sm font-extrabold text-primary-dark"
          >
            Buka halaman kontak
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </section>
  );
}

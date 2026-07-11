"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function ErrorPage({ unstable_retry }: ErrorPageProps) {
  return (
    <section className="relative flex min-h-[72vh] items-center overflow-hidden bg-paper pb-20 pt-36 text-accent md:pb-28 md:pt-44">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.42fr)] lg:items-end">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
            Halaman belum dapat dimuat
          </p>
          <h1 className="mt-6 max-w-4xl font-display text-[3rem] font-semibold leading-[0.98] sm:text-6xl lg:text-[5.4rem]">
            Ada gangguan sementara saat menyiapkan halaman ini.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-neutral-600">
            Detail teknis tidak ditampilkan di halaman publik. Anda dapat mencoba
            memuat ulang bagian ini atau kembali ke beranda.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => unstable_retry()}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-primary-dark px-7 py-4 text-base font-extrabold text-white transition-colors hover:bg-navy"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Coba lagi
            </button>
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-neutral-300 px-7 py-4 text-base font-extrabold text-accent transition-colors hover:border-primary-dark hover:text-primary-dark"
            >
              Kembali ke beranda
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <aside className="border-l border-primary-dark/35 pl-6 lg:pl-8">
          <p className="text-sm leading-7 text-neutral-600">
            Bila halaman tetap tidak dapat dibuka, jalur konsultasi utama masih
            tersedia dari halaman kontak.
          </p>
          <Link
            href="/kontak"
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

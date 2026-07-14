import { KeyRound, LockKeyhole, MessageCircle } from "lucide-react";
import TrackingLookup from "@/components/tracking/TrackingLookup";
import { COMPANY } from "@/lib/constants";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(
  {
    title: "Lacak Status Pengurusan",
    description:
      "Periksa status pengurusan dan informasi pembayaran menggunakan kode referensi Biro Jasa Tiga Saudara.",
    path: "/lacak",
  },
  { noIndex: true },
);

export default function TrackingPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-page pb-14 pt-36 text-accent md:pb-20 md:pt-44">
        <div className="absolute inset-y-0 left-[9%] hidden w-px bg-neutral-200 lg:block" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
            Status pengurusan
          </p>
          <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.45fr)] lg:items-end">
            <div>
              <h1 className="max-w-5xl font-display text-[3rem] font-semibold leading-[0.98] sm:text-6xl lg:text-[5.6rem]">
                Periksa perkembangan berkas Anda.
              </h1>
              <p className="mt-7 max-w-3xl text-lg font-medium leading-8 text-neutral-600 sm:text-xl sm:leading-9">
                Gunakan kode referensi yang tercantum pada pesan WhatsApp untuk
                melihat status dan informasi pembayaran yang relevan.
              </p>
            </div>
            <aside className="border-l border-primary-dark/40 pl-6 lg:pl-8">
              <KeyRound className="h-7 w-7 text-primary-dark" aria-hidden="true" />
              <p className="mt-5 text-base font-semibold leading-8 text-accent">
                Halaman ini tidak meminta akun, kata sandi, nomor telepon, atau
                nomor identitas.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <TrackingLookup />

      <section className="border-t border-neutral-200 bg-page py-16 text-accent md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 md:grid-cols-2">
          <div className="flex gap-4">
            <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-primary-dark" aria-hidden="true" />
            <div>
              <h2 className="font-display text-2xl font-semibold">
                Jaga kerahasiaan kode referensi.
              </h2>
              <p className="mt-3 text-sm leading-7 text-neutral-600">
                Siapa pun yang memiliki kode dapat melihat status yang aman untuk
                pelanggan. Jangan membagikannya di kanal publik.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-primary-dark" aria-hidden="true" />
            <div>
              <h2 className="font-display text-2xl font-semibold">
                Perlu penjelasan dari admin?
              </h2>
              <p className="mt-3 text-sm leading-7 text-neutral-600">
                Status di halaman ini adalah ringkasan. Detail dokumen dan langkah
                berikutnya tetap disampaikan melalui WhatsApp.
              </p>
              <a
                href={COMPANY.whatsappUrl(
                  "Halo Biro Jasa Tiga Saudara, saya ingin menanyakan status pengurusan berdasarkan kode referensi saya.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-11 items-center gap-2 border-b border-primary-dark pb-2 text-sm font-extrabold text-primary-dark transition-colors hover:text-accent"
              >
                Hubungi admin melalui WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

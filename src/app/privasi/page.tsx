import { ArrowRight, Database, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { COMPANY } from "@/lib/constants";
import { createRouteMetadata } from "@/lib/metadata";

export const metadata = createRouteMetadata("privasi");

const privacyRequestMessage =
  "Halo Biro Jasa Tiga Saudara, saya ingin meminta pemeriksaan, koreksi, atau penghapusan data permintaan yang pernah saya kirim melalui situs web.";

export default function PrivacyPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-page pb-20 pt-36 text-accent md:pb-28 md:pt-44">
        <div className="absolute inset-y-0 left-[9%] hidden w-px bg-neutral-200 lg:block" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
            Pemberitahuan privasi
          </p>
          <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1.12fr)_minmax(300px,0.48fr)] lg:items-end">
            <div>
              <h1 className="max-w-5xl font-display text-[3rem] font-semibold leading-[0.98] sm:text-6xl lg:text-[5.6rem]">
                Informasi Anda dipakai untuk membaca dan menindaklanjuti kebutuhan awal.
              </h1>
              <p className="mt-7 max-w-3xl text-lg font-medium leading-8 text-neutral-600 sm:text-xl sm:leading-9">
                Halaman ini menjelaskan data yang diproses ketika Anda mengisi
                formulir kebutuhan, siapa yang dapat mengaksesnya, dan bagaimana
                meminta koreksi atau penghapusan.
              </p>
            </div>

            <aside className="border-l border-primary-dark/40 pl-6 lg:pl-8">
              <ShieldCheck
                className="h-7 w-7 text-primary-dark"
                aria-hidden="true"
              />
              <p className="mt-5 text-base font-semibold leading-8 text-accent">
                Formulir tidak menyediakan unggahan file. Jangan masukkan nomor
                identitas atau isi dokumen sensitif ke kolom catatan.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-page py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.56fr)_minmax(0,1fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
              Ringkasan yang dapat dibaca
            </p>
            <h2 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.03] text-accent sm:text-5xl">
              Kami menjelaskan aliran data tanpa menyembunyikannya di balik istilah teknis.
            </h2>
            <p className="mt-7 max-w-lg text-base leading-8 text-neutral-600">
              Pengelola situs web dan data permintaan ini adalah Biro Jasa Tiga
              Saudara. Kontak yang tersedia untuk urusan data sama dengan kanal
              bisnis yang tercantum di situs web.
            </p>
          </div>

          <div className="border-y border-neutral-200">
            <article className="grid gap-6 border-b border-neutral-200 py-9 md:grid-cols-[3rem_minmax(0,1fr)]">
              <Database
                className="h-6 w-6 text-primary-dark"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-display text-2xl font-semibold text-accent">
                  Data yang diproses
                </h3>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">
                  <li>
                    Nama, nomor telepon, kategori dan sub-layanan, wilayah, serta
                    catatan yang Anda isi.
                  </li>
                  <li>
                    Status tindak lanjut dan catatan internal yang dibuat admin
                    ketika kebutuhan Anda ditangani.
                  </li>
                  <li>
                    Alamat jaringan dan informasi browser diproses menjadi
                    penanda teknis sementara untuk membatasi spam. Penanda ini
                    tidak ditampilkan sebagai isi permintaan di dashboard.
                  </li>
                </ul>
              </div>
            </article>

            <article className="grid gap-6 border-b border-neutral-200 py-9 md:grid-cols-[3rem_minmax(0,1fr)]">
              <ShieldCheck
                className="h-6 w-6 text-primary-dark"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-display text-2xl font-semibold text-accent">
                  Tujuan dan akses
                </h3>
                <p className="mt-5 text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">
                  Data dipakai untuk mencatat permintaan, menyiapkan ringkasan
                  percakapan WhatsApp, membantu tindak lanjut, dan melindungi
                  jalur formulir publik dari pengiriman berulang. Data permintaan dapat
                  dibaca dan diperbarui oleh admin yang berhasil masuk ke ruang
                  internal; pengunjung publik tidak diberi akses membaca daftar
                  permintaan.
                </p>
              </div>
            </article>

            <article className="grid gap-6 border-b border-neutral-200 py-9 md:grid-cols-[3rem_minmax(0,1fr)]">
              <MessageCircle
                className="h-6 w-6 text-primary-dark"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-display text-2xl font-semibold text-accent">
                  Layanan pihak ketiga
                </h3>
                <p className="mt-5 text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">
                  Supabase digunakan sebagai infrastruktur database dan login
                  admin. Ketika Anda memilih melanjutkan, ringkasan yang sama
                  diteruskan ke WhatsApp untuk membuka percakapan. Pemrosesan di
                  WhatsApp berada pada layanan WhatsApp/Meta dan tidak
                  dikendalikan oleh aplikasi situs web ini.
                </p>
              </div>
            </article>

            <article className="py-9">
              <p className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-primary-dark">
                Retensi, koreksi, dan penghapusan
              </p>
              <h3 className="mt-4 font-display text-2xl font-semibold text-accent">
                Permintaan disimpan selama dua belas bulan.
              </h3>
              <p className="mt-5 text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">
                Data permintaan dihapus permanen ketika telah melewati dua belas
                bulan sejak tanggal pengiriman. Pemeriksaan ini dijalankan
                otomatis setiap hari. Sebelum batas tersebut, Anda tetap dapat
                meminta data diperiksa, dikoreksi, atau dihapus melalui
                WhatsApp bisnis. Sebutkan nama dan nomor telepon yang dipakai
                saat mengisi formulir; jangan mengirim foto identitas untuk membuka
                permintaan.
              </p>
              <a
                href={COMPANY.whatsappUrl(privacyRequestMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex min-h-12 items-center justify-center gap-3 rounded-sm bg-primary-dark px-6 py-4 text-sm font-extrabold text-white transition-colors hover:bg-navy"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                Ajukan permintaan data
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-page py-16 md:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-600">
              Terakhir diperbarui 12 Juli 2026.
            </p>
            <p className="mt-2 text-sm leading-7 text-neutral-500">
              Pemberitahuan ini akan disesuaikan bila cara pengumpulan atau
              penggunaan data berubah.
            </p>
          </div>
          <Link
            href="/kontak#inquiry-form"
            className="inline-flex items-center gap-2 border-b border-primary-dark pb-2 text-sm font-extrabold text-primary-dark transition-colors hover:text-accent"
          >
            Kembali ke formulir
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}

import { LockKeyhole } from "lucide-react";
import InquiryFormCard from "@/components/contact/InquiryFormCard";
import type { InquiryFormCategory } from "@/lib/inquiries/types";

interface InquiryFormProps {
  categories: InquiryFormCategory[];
}

export default function InquiryForm({ categories }: InquiryFormProps) {
  return (
    <section
      id="inquiry-form"
      className="relative scroll-mt-24 overflow-hidden bg-page py-20 text-accent md:py-28"
      aria-labelledby="inquiry-form-title"
    >
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
            Mulai konsultasi
          </p>
          <h2
            id="inquiry-form-title"
            className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.03] sm:text-5xl"
          >
            Isi ringkasan kebutuhan untuk memulai konsultasi.
          </h2>
          <p className="mt-7 max-w-xl text-base leading-8 text-neutral-600">
            Setelah formulir dikirim, WhatsApp akan terbuka dengan ringkasan
            yang sama sehingga Anda dapat langsung melanjutkan percakapan.
          </p>

          <div className="mt-9 flex max-w-xl gap-4 border-t border-neutral-200 pt-6 text-sm leading-7 text-neutral-600">
            <LockKeyhole
              className="mt-1 h-5 w-5 shrink-0 text-primary-dark"
              aria-hidden="true"
            />
            <p>
              Jangan tulis nomor identitas dan jangan kirim foto KTP, STNK,
              BPKB, atau dokumen sensitif melalui formulir ini.
            </p>
          </div>
        </div>

        <InquiryFormCard categories={categories} idPrefix="kontak-" />
      </div>
    </section>
  );
}

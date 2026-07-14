"use client";

import { type FormEvent, useMemo, useState } from "react";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { buildInquiryWhatsAppUrl } from "@/lib/inquiries/whatsapp";
import type {
  InquiryFormCategory,
  InquiryPublicInput,
} from "@/lib/inquiries/types";

interface InquiryFormProps {
  categories: InquiryFormCategory[];
}

const fieldClassName =
  "mt-2 min-h-12 w-full rounded-sm border border-control-border bg-paper px-4 py-3 text-base text-accent outline-none transition-colors placeholder:text-form-placeholder focus:border-primary-dark focus:ring-2 focus:ring-primary/20";

export default function InquiryForm({ categories }: InquiryFormProps) {
  const [categoryId, setCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId),
    [categories, categoryId],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const selectedId = formData.get("service_category");
    const category = categories.find(({ id }) => id === selectedId);

    if (!category) {
      form.querySelector<HTMLSelectElement>("#service_category")?.focus();
      return;
    }

    const optionalValue = (name: string) => {
      const value = String(formData.get(name) ?? "").trim();
      return value.length > 0 ? value : null;
    };

    const inquiry: InquiryPublicInput = {
      full_name: String(formData.get("full_name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      service_category: category.id,
      service_detail: optionalValue("service_detail"),
      region: optionalValue("region"),
      notes: optionalValue("notes"),
    };
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8_000);
    let recorded = false;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...inquiry,
          website: optionalValue("website") ?? "",
        }),
        signal: controller.signal,
      });
      recorded = response.ok;
    } catch {
      // Database and network failures must never block the established
      // WhatsApp consultation path.
    } finally {
      window.clearTimeout(timeoutId);
      window.location.assign(
        buildInquiryWhatsAppUrl(inquiry, { recorded }),
      );
    }
  }

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
            Ceritakan kebutuhan pokok sebelum percakapan dilanjutkan.
          </h2>
          <p className="mt-7 max-w-xl text-base leading-8 text-neutral-600">
            Kami akan mencoba mencatat ringkasan awal yang Anda tulis. Setelah
            itu, WhatsApp terbuka dengan informasi yang sama agar Anda tidak
            perlu mengulang cerita dari awal.
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

        <form
          onSubmit={handleSubmit}
          action="/api/inquiries"
          method="post"
          className="rounded-sm border border-neutral-200 bg-panel p-5 text-accent shadow-medium sm:p-8"
        >
          <div
            className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
            aria-hidden="true"
          >
            <label htmlFor="website">Alamat website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-extrabold" htmlFor="full_name">
              Nama lengkap
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                className={fieldClassName}
              />
            </label>

            <label className="text-sm font-extrabold" htmlFor="phone">
              Nomor telepon / WhatsApp
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                minLength={8}
                maxLength={30}
                pattern="[+0-9][0-9 .\(\)\-]+"
                title="Gunakan angka, spasi, tanda plus, kurung, titik, atau tanda hubung."
                inputMode="tel"
                autoComplete="tel"
                placeholder="Contoh: 0812 3456 7890"
                className={fieldClassName}
              />
            </label>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label
              className="text-sm font-extrabold"
              htmlFor="service_category"
            >
              Kategori layanan
              <select
                id="service_category"
                name="service_category"
                required
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className={fieldClassName}
              >
                <option value="">Pilih kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </label>

            <label
              className="text-sm font-extrabold"
              htmlFor="service_detail"
            >
              Sub-layanan <span className="font-normal">(opsional)</span>
              <select
                key={categoryId || "no-category"}
                id="service_detail"
                name="service_detail"
                disabled={!selectedCategory}
                defaultValue=""
                className={`${fieldClassName} disabled:cursor-not-allowed disabled:bg-inset disabled:text-neutral-400`}
              >
                <option value="">
                  {selectedCategory
                    ? "Pilih sub-layanan"
                    : "Pilih kategori lebih dulu"}
                </option>
                {selectedCategory?.services.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label
            className="mt-5 block text-sm font-extrabold"
            htmlFor="region"
          >
            Wilayah pengurusan <span className="font-normal">(opsional)</span>
            <input
              id="region"
              name="region"
              type="text"
              maxLength={120}
              placeholder="Kota/kabupaten tempat dokumen diproses"
              className={fieldClassName}
            />
          </label>

          <label
            className="mt-5 block text-sm font-extrabold"
            htmlFor="notes"
          >
            Catatan kebutuhan <span className="font-normal">(opsional)</span>
            <textarea
              id="notes"
              name="notes"
              rows={5}
              maxLength={2000}
              placeholder="Ceritakan kondisi berkas atau kendala secara singkat, tanpa data identitas sensitif."
              className={`${fieldClassName} resize-y`}
            />
          </label>

          <div className="mt-7 border-t border-neutral-200 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-sm bg-primary-dark px-6 py-4 text-base font-extrabold text-white transition-colors hover:bg-navy disabled:cursor-wait disabled:opacity-70 sm:w-auto"
            >
              {isSubmitting
                ? "Menyiapkan percakapan..."
                : "Kirim ringkasan & buka WhatsApp"}
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <p
              className="mt-4 max-w-2xl text-xs leading-6 text-neutral-500"
              aria-live="polite"
            >
              {isSubmitting
                ? "WhatsApp tetap akan dibuka meskipun pencatatan sedang tidak tersedia."
                : "Kami mencoba mencatat informasi kontak dan kebutuhan dasar untuk tindak lanjut. Jika pencatatan gagal, pesan WhatsApp akan menandainya untuk admin."}
            </p>
            <p className="mt-2 text-xs leading-6 text-neutral-500">
              Cara kami memakai dan menghapus data dijelaskan dalam{" "}
              <Link
                href="/privasi"
                className="font-bold text-primary-dark underline decoration-primary-dark/35 underline-offset-4"
              >
                pemberitahuan privasi
              </Link>
              .
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

"use client";

import { type FormEvent, useMemo, useState } from "react";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { buildInquiryWhatsAppUrl } from "@/lib/inquiries/whatsapp";
import type {
  InquiryFormCategory,
  InquiryPublicInput,
} from "@/lib/inquiries/types";

interface InquiryFormProps {
  categories: InquiryFormCategory[];
}

const fieldClassName =
  "mt-2 min-h-12 w-full rounded-sm border border-neutral-300 bg-paper px-4 py-3 text-base text-accent outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-dark focus:ring-2 focus:ring-primary/20";

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
    const whatsappUrl = buildInquiryWhatsAppUrl(inquiry);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8_000);

    setIsSubmitting(true);

    try {
      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...inquiry,
          website: optionalValue("website") ?? "",
        }),
        signal: controller.signal,
      });
    } catch {
      // Database and network failures must never block the established
      // WhatsApp consultation path.
    } finally {
      window.clearTimeout(timeoutId);
      window.location.assign(whatsappUrl);
    }
  }

  return (
    <section
      className="relative overflow-hidden bg-navy py-20 text-white md:py-28"
      aria-labelledby="inquiry-form-title"
    >
      <div className="absolute inset-y-0 right-0 hidden w-[28%] bg-primary-dark/15 lg:block" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
        <div>
          <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-light">
            Catat inquiry
          </p>
          <h2
            id="inquiry-form-title"
            className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.03] sm:text-5xl"
          >
            Ringkas kebutuhan, lalu lanjutkan percakapan di WhatsApp.
          </h2>
          <p className="mt-7 max-w-xl text-base leading-8 text-white/78">
            Informasi dasar ini membantu kebutuhan Anda tidak hilang di antara
            percakapan. Setelah dicatat, WhatsApp akan terbuka dengan ringkasan
            yang sama agar konsultasi bisa langsung dilanjutkan.
          </p>

          <div className="mt-9 flex max-w-xl gap-4 border-t border-white/16 pt-6 text-sm leading-7 text-white/72">
            <LockKeyhole
              className="mt-1 h-5 w-5 shrink-0 text-primary-light"
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
          className="rounded-sm bg-paper p-5 text-accent shadow-elevated sm:p-8"
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
                className={`${fieldClassName} disabled:cursor-not-allowed disabled:bg-warm-50 disabled:text-neutral-400`}
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
              {isSubmitting ? "Mencatat kebutuhan..." : "Catat & buka WhatsApp"}
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <p
              className="mt-4 max-w-2xl text-xs leading-6 text-neutral-500"
              aria-live="polite"
            >
              {isSubmitting
                ? "WhatsApp tetap akan dibuka meskipun pencatatan sedang tidak tersedia."
                : "Dengan melanjutkan, informasi kontak dan kebutuhan dasar Anda dicatat untuk tindak lanjut."}
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

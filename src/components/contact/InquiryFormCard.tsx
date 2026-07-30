"use client";

import { type FormEvent, useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { buildInquiryWhatsAppUrl } from "@/lib/inquiries/whatsapp";
import { isInquiryReferenceCode } from "@/lib/inquiries/constants";
import type {
  InquiryFormCategory,
  InquiryPublicInput,
} from "@/lib/inquiries/types";

interface InquiryFormCardProps {
  categories: InquiryFormCategory[];
  /**
   * Prefix applied to every field id so multiple instances (e.g. the
   * CSS-switched mobile and desktop hero panels) never emit duplicate
   * DOM ids on one page.
   */
  idPrefix?: string;
  /** Tighter spacing for embedded placements such as the homepage hero. */
  compact?: boolean;
  /** Drop the card chrome when the parent supplies its own panel. */
  frameless?: boolean;
}

const fieldClassName =
  "mt-2 min-h-12 w-full rounded-sm border border-control-border bg-paper px-4 py-3 text-base text-accent outline-none transition-colors placeholder:text-form-placeholder focus:border-primary-dark focus:ring-2 focus:ring-primary/20";

export default function InquiryFormCard({
  categories,
  idPrefix = "",
  compact = false,
  frameless = false,
}: InquiryFormCardProps) {
  const [categoryId, setCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fieldId = (name: string) => `${idPrefix}${name}`;

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
      form
        .querySelector<HTMLSelectElement>('select[name="service_category"]')
        ?.focus();
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
    let referenceCode: string | undefined;

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
      if (response.ok) {
        const result = (await response.json()) as { referenceCode?: unknown };
        if (isInquiryReferenceCode(result.referenceCode)) {
          referenceCode = result.referenceCode;
        }
      }
    } catch {
      // Database and network failures must never block the established
      // WhatsApp consultation path.
    } finally {
      window.clearTimeout(timeoutId);
      window.location.assign(
        buildInquiryWhatsAppUrl(inquiry, {
          recorded: Boolean(referenceCode),
          referenceCode,
        }),
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      action="/api/inquiries"
      method="post"
      className={
        frameless
          ? "text-accent"
          : "rounded-sm border border-neutral-200 bg-panel p-5 text-accent shadow-medium sm:p-8"
      }
    >
      <div
        className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <label htmlFor={fieldId("website")}>Alamat website</label>
        <input
          id={fieldId("website")}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-extrabold" htmlFor={fieldId("full_name")}>
          Nama lengkap
          <input
            id={fieldId("full_name")}
            name="full_name"
            type="text"
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            className={fieldClassName}
          />
        </label>

        <label className="text-sm font-extrabold" htmlFor={fieldId("phone")}>
          Nomor telepon / WhatsApp
          <input
            id={fieldId("phone")}
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
          htmlFor={fieldId("service_category")}
        >
          Kategori layanan
          <select
            id={fieldId("service_category")}
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
          htmlFor={fieldId("service_detail")}
        >
          Sub-layanan <span className="font-normal">(opsional)</span>
          <select
            key={categoryId || "no-category"}
            id={fieldId("service_detail")}
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
        htmlFor={fieldId("region")}
      >
        Wilayah pengurusan <span className="font-normal">(opsional)</span>
        <input
          id={fieldId("region")}
          name="region"
          type="text"
          maxLength={120}
          placeholder="Kota/kabupaten tempat dokumen diproses"
          className={fieldClassName}
        />
      </label>

      <label
        className="mt-5 block text-sm font-extrabold"
        htmlFor={fieldId("notes")}
      >
        Kondisi atau kendala <span className="font-normal">(opsional)</span>
        <textarea
          id={fieldId("notes")}
          name="notes"
          rows={compact ? 3 : 5}
          maxLength={2000}
          placeholder="Jelaskan kondisi dokumen atau kendala secara singkat, tanpa data identitas sensitif."
          className={`${fieldClassName} resize-y`}
        />
      </label>

      <div
        className={
          compact
            ? "mt-6 border-t border-neutral-200 pt-5"
            : "mt-7 border-t border-neutral-200 pt-6"
        }
      >
        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-sm bg-primary-dark px-6 py-4 text-base font-extrabold text-white transition-colors hover:bg-navy disabled:cursor-wait disabled:opacity-70 ${
            compact ? "" : "sm:w-auto"
          }`}
        >
          {isSubmitting ? "Membuka WhatsApp..." : "Lanjutkan ke WhatsApp"}
          <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
        </button>
        <p
          className="mt-4 max-w-2xl text-xs leading-6 text-neutral-500"
          aria-live="polite"
        >
          {isSubmitting
            ? "Ringkasan sedang disiapkan. Anda akan diarahkan ke WhatsApp."
            : "Setelah dikirim, Anda dapat memeriksa kembali ringkasan sebelum mengirimkannya melalui WhatsApp."}
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
  );
}

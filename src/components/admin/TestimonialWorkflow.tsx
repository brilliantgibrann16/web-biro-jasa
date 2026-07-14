"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Save, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AdminTestimonialRecord } from "@/lib/admin-tracking/types";

interface TestimonialWorkflowProps {
  inquiryId: string;
  initialEligibleAt: string | null;
  initialInquiryUpdatedAt: string;
  initialTestimonial: AdminTestimonialRecord | null;
}

interface TestimonialMutationResponse {
  error?: string;
  errors?: Record<string, string>;
  inquiry?: {
    testimonial_eligible_at: string | null;
    updated_at: string;
  };
  testimonial?: AdminTestimonialRecord;
}

export default function TestimonialWorkflow({
  inquiryId,
  initialEligibleAt,
  initialInquiryUpdatedAt,
  initialTestimonial,
}: TestimonialWorkflowProps) {
  const router = useRouter();
  const [eligibleAt, setEligibleAt] = useState(initialEligibleAt);
  const [inquiryUpdatedAt, setInquiryUpdatedAt] = useState(initialInquiryUpdatedAt);
  const [testimonial, setTestimonial] = useState(initialTestimonial);
  const [rating, setRating] = useState(initialTestimonial?.rating ?? 0);
  const [displayName, setDisplayName] = useState(initialTestimonial?.display_name ?? "");
  const [testimonialText, setTestimonialText] = useState(initialTestimonial?.testimonial_text ?? "");
  const [pendingAction, setPendingAction] = useState<"eligibility" | "draft" | "publication" | null>(null);
  const [conflict, setConflict] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function readError(payload: TestimonialMutationResponse | null, fallback: string): string {
    const fieldError = payload?.errors ? Object.values(payload.errors)[0] : undefined;
    return fieldError || payload?.error || fallback;
  }

  async function markEligible() {
    setPendingAction("eligibility");
    setMessage(null);

    try {
      const response = await fetch(
        `/api/admin/inquiries/${inquiryId}/testimonial-eligibility`,
        {
          method: "PATCH",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ eligible: true, updated_at: inquiryUpdatedAt }),
        },
      );
      const payload = (await response.json().catch(() => null)) as TestimonialMutationResponse | null;

      if (response.status === 401) {
        window.location.assign(`/admin/login?next=${encodeURIComponent(`/admin/inquiries/${inquiryId}`)}`);
        return;
      }
      if (response.status === 409) setConflict(true);
      if (!response.ok || !payload?.inquiry) {
        throw new Error(readError(payload, "Kelayakan testimoni belum dapat disimpan."));
      }

      setEligibleAt(payload.inquiry.testimonial_eligible_at);
      setInquiryUpdatedAt(payload.inquiry.updated_at);
      setConflict(false);
      setMessage({ type: "success", text: "Inquiry ditandai layak untuk testimoni. Isi draft secara eksplisit sebelum publikasi." });
      router.refresh();
    } catch (reason) {
      setMessage({ type: "error", text: reason instanceof Error ? reason.message : "Kelayakan belum dapat disimpan." });
    } finally {
      setPendingAction(null);
    }
  }

  async function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction("draft");
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}/testimonial`, {
        method: "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          display_name: displayName,
          testimonial_text: testimonialText,
          updated_at: inquiryUpdatedAt,
          testimonial_updated_at: testimonial?.updated_at,
        }),
      });
      const payload = (await response.json().catch(() => null)) as TestimonialMutationResponse | null;

      if (response.status === 401) {
        window.location.assign(`/admin/login?next=${encodeURIComponent(`/admin/inquiries/${inquiryId}`)}`);
        return;
      }
      if (response.status === 409) setConflict(true);
      if (!response.ok || !payload?.testimonial) {
        throw new Error(readError(payload, "Draft testimoni belum dapat disimpan."));
      }

      setTestimonial(payload.testimonial);
      setRating(payload.testimonial.rating);
      setDisplayName(payload.testimonial.display_name);
      setTestimonialText(payload.testimonial.testimonial_text);
      setConflict(false);
      setMessage({ type: "success", text: "Draft tersimpan dan belum tampil di situs publik." });
      router.refresh();
    } catch (reason) {
      setMessage({ type: "error", text: reason instanceof Error ? reason.message : "Draft belum dapat disimpan." });
    } finally {
      setPendingAction(null);
    }
  }

  async function changePublication(nextPublished: boolean) {
    if (!testimonial) return;
    if (draftIsDirty) {
      setMessage({
        type: "error",
        text: "Simpan perubahan draft terlebih dahulu sebelum mengubah status publikasi.",
      });
      return;
    }
    const confirmation = nextPublished
      ? "Publikasikan testimoni ini ke halaman publik? Pastikan isi dan nama tampilan telah disetujui pelanggan."
      : "Tarik testimoni ini dari halaman publik?";
    if (!window.confirm(confirmation)) return;

    setPendingAction("publication");
    setMessage(null);

    try {
      const response = await fetch(
        `/api/admin/testimonials/${testimonial.id}/publication`,
        {
          method: "PATCH",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({
            published: nextPublished,
            updated_at: testimonial.updated_at,
          }),
        },
      );
      const payload = (await response.json().catch(() => null)) as TestimonialMutationResponse | null;

      if (response.status === 401) {
        window.location.assign(`/admin/login?next=${encodeURIComponent(`/admin/inquiries/${inquiryId}`)}`);
        return;
      }
      if (response.status === 409) setConflict(true);
      if (!response.ok || !payload?.testimonial) {
        throw new Error(readError(payload, "Status publikasi belum dapat diperbarui."));
      }

      setTestimonial(payload.testimonial);
      setConflict(false);
      setMessage({
        type: "success",
        text: nextPublished
          ? "Testimoni telah dipublikasikan."
          : "Testimoni ditarik dari halaman publik dan kembali menjadi draft.",
      });
      router.refresh();
    } catch (reason) {
      setMessage({ type: "error", text: reason instanceof Error ? reason.message : "Publikasi belum dapat diperbarui." });
    } finally {
      setPendingAction(null);
    }
  }

  const pending = pendingAction !== null;
  const published = testimonial?.published ?? false;
  const draftIsDirty = testimonial
    ? rating !== testimonial.rating ||
      displayName !== testimonial.display_name ||
      testimonialText !== testimonial.testimonial_text
    : false;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-[0.1em]">
        <span className={`rounded-full border px-3 py-1.5 ${eligibleAt ? "border-state-success-border bg-state-success-surface text-state-success-text" : "border-neutral-300 bg-surface text-neutral-500"}`}>
          1. {eligibleAt ? "Layak" : "Belum ditandai"}
        </span>
        <span className={`rounded-full border px-3 py-1.5 ${testimonial ? "border-state-success-border bg-state-success-surface text-state-success-text" : "border-neutral-300 bg-surface text-neutral-500"}`}>
          2. {testimonial ? "Draft tersimpan" : "Belum ada draft"}
        </span>
        <span className={`rounded-full border px-3 py-1.5 ${published ? "border-state-success-border bg-state-success-surface text-state-success-text" : "border-neutral-300 bg-surface text-neutral-500"}`}>
          3. {published ? "Tayang" : "Belum tayang"}
        </span>
      </div>

      {!eligibleAt ? (
        <div className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-warm-50 p-5">
          <h3 className="font-extrabold text-accent">Keputusan pertama: tandai kelayakan</h3>
          <p className="mt-2 text-sm leading-7 text-neutral-600">
            Gunakan hanya setelah pelanggan menyampaikan pengalaman yang dapat ditulis sebagai testimoni. Menandai tahap ini tidak membuat atau mempublikasikan konten apa pun.
          </p>
          <button type="button" onClick={markEligible} disabled={pending || conflict} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-extrabold text-white hover:bg-primary-dark disabled:opacity-60">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {pendingAction === "eligibility" ? "Menyimpan..." : "Tandai layak untuk testimoni"}
          </button>
        </div>
      ) : (
        <form className="mt-6 space-y-5" onSubmit={saveDraft} aria-busy={pendingAction === "draft"}>
          <fieldset disabled={pending || published}>
            <legend className="text-sm font-bold text-accent">Rating pelanggan</legend>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Rating testimoni">
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value} className={`relative inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-sm font-bold ${rating === value ? "border-primary bg-primary/10 text-primary-dark" : "border-neutral-300 bg-surface text-neutral-600"}`}>
                  <input type="radio" name="testimonial-rating" value={value} checked={rating === value} onChange={() => setRating(value)} className="peer sr-only" />
                  <span className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-primary ring-offset-2 opacity-0 peer-focus-visible:opacity-100" aria-hidden="true" />
                  <Star className="h-4 w-4" fill={rating >= value ? "currentColor" : "none"} aria-hidden="true" />
                  {value}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block text-sm font-bold text-accent">
            Nama yang ditampilkan
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} minLength={2} maxLength={120} required disabled={pending || published} className="mt-2 min-h-12 w-full rounded-lg border border-control-border bg-surface px-4 text-base" placeholder="Contoh: R. Pratama atau Pelanggan dari Jakarta Selatan" />
            <span className="mt-1 block text-xs font-normal leading-6 text-neutral-500">
              Pilih secara eksplisit: nama asli, inisial, atau penyamaran yang telah disepakati. Sistem tidak mengisinya otomatis.
            </span>
          </label>

          <label className="block text-sm font-bold text-accent">
            Isi testimoni
            <textarea value={testimonialText} onChange={(event) => setTestimonialText(event.target.value)} minLength={10} maxLength={1500} rows={6} required disabled={pending || published} className="mt-2 w-full resize-y rounded-lg border border-control-border bg-surface px-4 py-3 text-base leading-7" placeholder="Tulis sesuai pernyataan pelanggan, tanpa menambahkan klaim yang tidak disampaikan." />
          </label>
          <p className="-mt-4 text-right text-xs text-neutral-500">{testimonialText.length}/1.500</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <button type="submit" disabled={pending || conflict || published || rating === 0} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-extrabold text-white hover:bg-primary-dark disabled:cursor-wait disabled:opacity-50">
              <Save className="h-4 w-4" aria-hidden="true" />
              {pendingAction === "draft" ? "Menyimpan..." : testimonial ? "Perbarui draft" : "Simpan sebagai draft"}
            </button>

            {testimonial ? (
              <button type="button" onClick={() => changePublication(!published)} disabled={pending || conflict || draftIsDirty} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-extrabold disabled:cursor-wait disabled:opacity-50 ${published ? "border-state-danger-border bg-surface text-state-danger-text" : "border-state-success-border bg-state-success-surface text-state-success-text"}`}>
                {published ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                {pendingAction === "publication" ? "Memproses..." : draftIsDirty ? "Simpan draft lebih dulu" : published ? "Tarik dari publik" : "Publikasikan terpisah"}
              </button>
            ) : null}
          </div>

          {draftIsDirty ? (
            <p className="rounded-lg border border-state-warning-border bg-state-warning-surface px-4 py-3 text-sm leading-6 text-state-warning-text" role="status">
              Ada perubahan yang belum disimpan. Perbarui draft sebelum mempublikasikan testimoni.
            </p>
          ) : null}

          {published ? (
            <p className="rounded-lg border border-state-success-border bg-state-success-surface px-4 py-3 text-sm leading-6 text-state-success-text">
              Testimoni sedang tampil di halaman publik. Tarik publikasi terlebih dahulu bila isi perlu diubah.
            </p>
          ) : (
            <p className="text-xs leading-6 text-neutral-500">
              Menyimpan draft tidak mempublikasikan testimoni. Publikasi selalu membutuhkan tombol dan konfirmasi terpisah.
            </p>
          )}
        </form>
      )}

      {message ? (
        <div role={message.type === "error" ? "alert" : "status"} className={`mt-5 rounded-lg border px-4 py-3 text-sm leading-6 ${message.type === "success" ? "border-state-success-border bg-state-success-surface text-state-success-text" : "border-state-danger-border bg-state-danger-surface text-state-danger-text"}`}>
          <p>{message.text}</p>
          {conflict ? <button type="button" onClick={() => window.location.reload()} className="mt-3 min-h-10 rounded-lg border border-current px-3 font-bold">Muat data terbaru</button> : null}
        </div>
      ) : null}
    </div>
  );
}

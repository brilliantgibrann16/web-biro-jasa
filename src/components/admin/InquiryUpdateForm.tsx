"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import {
  INQUIRY_STATUSES,
  INQUIRY_STATUS_LABELS,
  type InquiryStatus,
} from "@/lib/inquiries/constants";

interface InquiryUpdateFormProps {
  inquiryId: string;
  initialStatus: InquiryStatus;
  initialHandledNote: string | null;
}

export default function InquiryUpdateForm({
  inquiryId,
  initialStatus,
  initialHandledNote,
}: InquiryUpdateFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<InquiryStatus>(initialStatus);
  const [handledNote, setHandledNote] = useState(initialHandledNote ?? "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          handled_note: handledNote,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; errors?: Record<string, string> }
        | null;

      if (response.status === 401) {
        window.location.assign(
          `/admin/login?next=${encodeURIComponent(`/admin/inquiries/${inquiryId}`)}`,
        );
        return;
      }

      if (!response.ok) {
        const firstFieldError = payload?.errors
          ? Object.values(payload.errors)[0]
          : undefined;
        throw new Error(
          firstFieldError || payload?.error || "Pembaruan belum dapat disimpan.",
        );
      }

      setMessage({ type: "success", text: "Perubahan berhasil disimpan." });
      router.refresh();
    } catch (reason) {
      setMessage({
        type: "error",
        text:
          reason instanceof Error
            ? reason.message
            : "Pembaruan belum dapat disimpan.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="inquiry-status" className="text-sm font-bold text-accent">
          Status penanganan
        </label>
        <select
          id="inquiry-status"
          value={status}
          onChange={(event) => setStatus(event.target.value as InquiryStatus)}
          disabled={pending}
          className="mt-2 min-h-12 w-full rounded-lg border border-neutral-300 bg-surface px-4 text-base text-accent disabled:cursor-wait disabled:opacity-60"
        >
          {INQUIRY_STATUSES.map((value) => (
            <option key={value} value={value}>
              {INQUIRY_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="handled-note"
          className="text-sm font-bold text-accent"
        >
          Catatan internal
        </label>
        <p id="handled-note-help" className="mt-1 text-sm text-neutral-500">
          Hanya terlihat oleh admin. Maksimal 4.000 karakter.
        </p>
        <textarea
          id="handled-note"
          value={handledNote}
          onChange={(event) => setHandledNote(event.target.value)}
          maxLength={4000}
          rows={8}
          disabled={pending}
          aria-describedby="handled-note-help"
          className="mt-2 w-full resize-y rounded-lg border border-neutral-300 bg-surface px-4 py-3 text-base leading-7 text-accent placeholder:text-neutral-400 disabled:cursor-wait disabled:opacity-60"
          placeholder="Contoh: sudah dihubungi, menunggu foto STNK..."
        />
        <p className="mt-1 text-right text-xs text-neutral-500">
          {handledNote.length}/4.000
        </p>
      </div>

      <div aria-live="polite">
        {message ? (
          <p
            role={message.type === "error" ? "alert" : "status"}
            className={`rounded-lg border px-4 py-3 text-sm leading-6 ${
              message.type === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100"
                : "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-100"
            }`}
          >
            {message.text}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-extrabold text-white transition-colors hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60"
      >
        <Save className="h-4 w-4" aria-hidden="true" />
        {pending ? "Menyimpan..." : "Simpan perubahan"}
      </button>
    </form>
  );
}

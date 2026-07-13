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
  initialUpdatedAt: string;
}

export default function InquiryUpdateForm({
  inquiryId,
  initialStatus,
  initialHandledNote,
  initialUpdatedAt,
}: InquiryUpdateFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<InquiryStatus>(initialStatus);
  const [handledNote, setHandledNote] = useState(initialHandledNote ?? "");
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [pending, setPending] = useState(false);
  const [conflict, setConflict] = useState(false);
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
          updated_at: updatedAt,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            error?: string;
            errors?: Record<string, string>;
            inquiry?: { updated_at?: string };
          }
        | null;

      if (response.status === 401) {
        window.location.assign(
          `/admin/login?next=${encodeURIComponent(`/admin/inquiries/${inquiryId}`)}`,
        );
        return;
      }

      if (response.status === 409) {
        setConflict(true);
        setMessage({
          type: "error",
          text:
            payload?.error ||
            "Inquiry berubah di sesi lain. Muat data terbaru sebelum menyimpan lagi.",
        });
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

      const nextVersion = payload?.inquiry?.updated_at;
      if (!nextVersion) {
        throw new Error("Versi pembaruan tidak diterima. Muat ulang halaman.");
      }

      setUpdatedAt(nextVersion);
      setConflict(false);
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
    <form className="space-y-5" onSubmit={handleSubmit} aria-busy={pending}>
      <div>
        <label htmlFor="inquiry-status" className="text-sm font-bold text-accent">
          Status penanganan
        </label>
        <select
          id="inquiry-status"
          value={status}
          onChange={(event) => setStatus(event.target.value as InquiryStatus)}
          disabled={pending}
          className="mt-2 min-h-12 w-full rounded-lg border border-control-border bg-surface px-4 text-base text-accent disabled:cursor-wait disabled:opacity-60"
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
          className="mt-2 w-full resize-y rounded-lg border border-control-border bg-surface px-4 py-3 text-base leading-7 text-accent placeholder:text-form-placeholder disabled:cursor-wait disabled:opacity-60"
          placeholder="Contoh: sudah dihubungi, menunggu foto STNK..."
        />
        <p className="mt-1 text-right text-xs text-neutral-500">
          {handledNote.length}/4.000
        </p>
      </div>

      <div>
        {message ? (
          <div
            role={message.type === "error" ? "alert" : "status"}
            className={`rounded-lg border px-4 py-3 text-sm leading-6 ${
              message.type === "success"
                ? "border-state-success-border bg-state-success-surface text-state-success-text"
                : "border-state-danger-border bg-state-danger-surface text-state-danger-text"
            }`}
          >
            <p>{message.text}</p>
            {conflict ? (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 min-h-10 rounded-lg border border-current px-3 font-bold"
              >
                Muat data terbaru
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending || conflict}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-extrabold text-white transition-colors hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60"
      >
        <Save className="h-4 w-4" aria-hidden="true" />
        {pending ? "Menyimpan..." : "Simpan perubahan"}
      </button>
    </form>
  );
}

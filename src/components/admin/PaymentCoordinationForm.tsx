"use client";

import { FormEvent, useState } from "react";
import { AlertTriangle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TIMINGS,
  PAYMENT_TIMING_LABELS,
  formatRupiah,
  type PaymentStatus,
  type PaymentTiming,
} from "@/lib/admin-tracking/constants";

interface PaymentCoordinationFormProps {
  inquiryId: string;
  initialPaymentRequired: boolean;
  initialPaymentAmount: number | null;
  initialPaymentTiming: PaymentTiming | null;
  initialPaymentStatus: PaymentStatus;
  initialConfirmationRequestedAt: string | null;
  initialVerifiedAt: string | null;
  initialUpdatedAt: string;
}

interface PaymentMutationResponse {
  error?: string;
  errors?: Record<string, string>;
  inquiry?: {
    updated_at: string;
    payment_required: boolean;
    payment_amount: number | null;
    payment_timing: PaymentTiming | null;
    payment_status: PaymentStatus;
    payment_confirmation_requested_at: string | null;
    payment_verified_at: string | null;
  };
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Waktu tidak tersedia" : `${dateFormatter.format(date)} WIB`;
}

export default function PaymentCoordinationForm({
  inquiryId,
  initialPaymentRequired,
  initialPaymentAmount,
  initialPaymentTiming,
  initialPaymentStatus,
  initialConfirmationRequestedAt,
  initialVerifiedAt,
  initialUpdatedAt,
}: PaymentCoordinationFormProps) {
  const router = useRouter();
  const [required, setRequired] = useState(initialPaymentRequired);
  const [amount, setAmount] = useState(initialPaymentAmount?.toString() ?? "");
  const [timing, setTiming] = useState<PaymentTiming | "">(initialPaymentTiming ?? "");
  const [status, setStatus] = useState<PaymentStatus>(initialPaymentStatus);
  const [confirmationRequestedAt, setConfirmationRequestedAt] = useState(initialConfirmationRequestedAt);
  const [verifiedAt, setVerifiedAt] = useState(initialVerifiedAt);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [pending, setPending] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleRequiredChange(nextRequired: boolean) {
    setRequired(nextRequired);
    if (!nextRequired) setStatus("belum-diperlukan");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}/payment`, {
        method: "PATCH",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_required: required,
          payment_amount: required ? amount : null,
          payment_timing: required ? timing : null,
          payment_status: required ? status : "belum-diperlukan",
          updated_at: updatedAt,
        }),
      });
      const payload = (await response.json().catch(() => null)) as PaymentMutationResponse | null;

      if (response.status === 401) {
        window.location.assign(
          `/admin/login?next=${encodeURIComponent(`/admin/inquiries/${inquiryId}`)}`,
        );
        return;
      }
      if (response.status === 409 && payload?.error?.includes("berubah")) {
        setConflict(true);
      }
      if (!response.ok || !payload?.inquiry) {
        const fieldError = payload?.errors ? Object.values(payload.errors)[0] : undefined;
        throw new Error(fieldError || payload?.error || "Pembayaran belum dapat disimpan.");
      }

      const inquiry = payload.inquiry;
      setRequired(inquiry.payment_required);
      setAmount(inquiry.payment_amount?.toString() ?? "");
      setTiming(inquiry.payment_timing ?? "");
      setStatus(inquiry.payment_status);
      setConfirmationRequestedAt(inquiry.payment_confirmation_requested_at);
      setVerifiedAt(inquiry.payment_verified_at);
      setUpdatedAt(inquiry.updated_at);
      setConflict(false);
      setMessage({ type: "success", text: "Koordinasi pembayaran berhasil disimpan." });
      router.refresh();
    } catch (reason) {
      setMessage({
        type: "error",
        text: reason instanceof Error ? reason.message : "Pembayaran belum dapat disimpan.",
      });
    } finally {
      setPending(false);
    }
  }

  const verificationPending =
    status === "menunggu-verifikasi" && Boolean(confirmationRequestedAt);

  return (
    <form className="space-y-5" onSubmit={handleSubmit} aria-busy={pending}>
      {verificationPending ? (
        <div className="rounded-lg border border-status-waiting-border bg-status-waiting-surface p-4 text-status-waiting-text" role="status">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-extrabold">Pelanggan melaporkan sudah transfer</p>
              <p className="mt-1 text-sm leading-6">
                {confirmationRequestedAt ? formatDate(confirmationRequestedAt) : "Waktu belum tersedia"}. Cocokkan mutasi rekening atau QRIS sebelum memilih pembayaran terverifikasi.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <label className="flex min-h-12 items-start gap-3 rounded-lg border border-neutral-200 bg-surface p-4 text-sm font-bold text-accent">
        <input
          type="checkbox"
          checked={required}
          onChange={(event) => handleRequiredChange(event.target.checked)}
          disabled={pending}
          className="mt-0.5 h-5 w-5 accent-primary"
        />
        <span>
          Order ini memiliki pembayaran
          <span className="mt-1 block font-normal leading-6 text-neutral-500">
            Aktifkan setelah harga disepakati melalui konsultasi.
          </span>
        </span>
      </label>

      {required ? (
        <>
          <div>
            <label htmlFor="payment-amount" className="text-sm font-bold text-accent">
              Jumlah pembayaran
            </label>
            <div className="mt-2 flex min-h-12 overflow-hidden rounded-lg border border-control-border bg-surface focus-within:border-primary-dark focus-within:ring-2 focus-within:ring-primary/20">
              <span className="grid place-items-center border-r border-neutral-200 px-4 text-sm font-bold text-neutral-500">Rp</span>
              <input
                id="payment-amount"
                value={amount}
                onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                pattern="[0-9]+"
                required
                disabled={pending}
                className="min-w-0 flex-1 bg-transparent px-4 text-base text-accent outline-none"
                placeholder="Contoh: 1500000"
              />
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              {amount ? formatRupiah(Number(amount)) : "Masukkan angka tanpa titik atau koma."}
            </p>
          </div>

          <div>
            <label htmlFor="payment-timing" className="text-sm font-bold text-accent">
              Waktu pembayaran
            </label>
            <select
              id="payment-timing"
              value={timing}
              onChange={(event) => setTiming(event.target.value as PaymentTiming)}
              required
              disabled={pending}
              className="mt-2 min-h-12 w-full rounded-lg border border-control-border bg-surface px-4 text-base text-accent"
            >
              <option value="">Pilih waktu pembayaran</option>
              {PAYMENT_TIMINGS.map((value) => (
                <option key={value} value={value}>{PAYMENT_TIMING_LABELS[value]}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="payment-status" className="text-sm font-bold text-accent">
              Status pembayaran
            </label>
            <select
              id="payment-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as PaymentStatus)}
              disabled={pending}
              className="mt-2 min-h-12 w-full rounded-lg border border-control-border bg-surface px-4 text-base text-accent"
            >
              {PAYMENT_STATUSES.map((value) => (
                <option
                  key={value}
                  value={value}
                  disabled={value === "menunggu-verifikasi" && status !== "menunggu-verifikasi"}
                >
                  {PAYMENT_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-6 text-neutral-500">
              Memilih “Menunggu pembayaran” akan mereset laporan transfer sebelumnya. Sistem tidak memproses uang dan tidak mengonfirmasi pembayaran otomatis.
            </p>
          </div>
        </>
      ) : null}

      {verifiedAt ? (
        <p className="rounded-lg border border-state-success-border bg-state-success-surface px-4 py-3 text-sm text-state-success-text">
          Diverifikasi manual pada {formatDate(verifiedAt)}.
        </p>
      ) : null}

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
            <button type="button" onClick={() => window.location.reload()} className="mt-3 min-h-10 rounded-lg border border-current px-3 font-bold">
              Muat data terbaru
            </button>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending || conflict}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-extrabold text-white hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60"
      >
        <Save className="h-4 w-4" aria-hidden="true" />
        {pending ? "Menyimpan..." : "Simpan pembayaran"}
      </button>
    </form>
  );
}

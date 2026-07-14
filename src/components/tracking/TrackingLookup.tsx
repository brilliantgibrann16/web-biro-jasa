"use client";

import Image from "next/image";
import {
  Check,
  Clipboard,
  Clock3,
  Copy,
  CreditCard,
  FileSearch,
  Landmark,
  LoaderCircle,
  MessageCircle,
  QrCode,
} from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { COMPANY } from "@/lib/constants";
import {
  normalizeTrackingReferenceCode,
  TRACKING_REFERENCE_CODE_MAX_LENGTH,
  type PublicPaymentStatus,
  type PublicTrackingResult,
  type TrackingErrorResponse,
  type TrackingLookupSuccessResponse,
  type TrackingStatusTone,
} from "@/lib/tracking/public";

const statusToneClasses: Record<TrackingStatusTone, string> = {
  new: "border-status-new-border bg-status-new-surface text-status-new-text",
  progress:
    "border-status-progress-border bg-status-progress-surface text-status-progress-text",
  waiting:
    "border-status-waiting-border bg-status-waiting-surface text-status-waiting-text",
  success:
    "border-status-success-border bg-status-success-surface text-status-success-text",
  cancelled:
    "border-status-cancelled-border bg-status-cancelled-surface text-status-cancelled-text",
};

const paymentStatusLabels: Record<PublicPaymentStatus, string> = {
  "belum-diperlukan": "Belum ada pembayaran",
  "menunggu-pembayaran": "Menunggu pembayaran",
  "menunggu-verifikasi": "Menunggu pemeriksaan pembayaran",
  "sudah-dibayar": "Pembayaran sudah dikonfirmasi",
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

const moneyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Waktu pembaruan tidak tersedia"
    : `${dateFormatter.format(date)} WIB`;
}

function formatRupiah(value: string | null): string {
  if (!value) return "Belum ditentukan";
  const amount = Number(value);
  return Number.isSafeInteger(amount) && amount >= 0
    ? moneyFormatter.format(amount)
    : "Belum ditentukan";
}

function isLookupSuccess(value: unknown): value is TrackingLookupSuccessResponse {
  return Boolean(
    value &&
      typeof value === "object" &&
      (value as { ok?: unknown }).ok === true &&
      (value as { tracking?: unknown }).tracking,
  );
}

function readErrorMessage(value: unknown, fallback: string): string {
  if (
    value &&
    typeof value === "object" &&
    (value as TrackingErrorResponse).ok === false &&
    typeof (value as TrackingErrorResponse).message === "string"
  ) {
    return (value as TrackingErrorResponse).message;
  }
  return fallback;
}

function PaymentPanel({
  tracking,
  onVerificationRequested,
}: {
  tracking: PublicTrackingResult;
  onVerificationRequested: () => void;
}) {
  const { payment } = tracking;
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationError, setConfirmationError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const instructions = payment.instructions;
  const hasBankDetails = Boolean(
    instructions?.bankName ||
      instructions?.accountNumber ||
      instructions?.accountHolder,
  );
  const hasPaymentMethod = Boolean(
    hasBankDetails || instructions?.qrisImageUrl,
  );

  async function copyAccountNumber() {
    if (!instructions?.accountNumber) return;

    try {
      await navigator.clipboard.writeText(instructions.accountNumber);
      setCopyMessage("Nomor rekening disalin.");
    } catch {
      setCopyMessage("Nomor belum dapat disalin. Pilih dan salin secara manual.");
    }
  }

  async function requestVerification() {
    if (isConfirming) return;
    setIsConfirming(true);
    setConfirmationError(null);

    try {
      const response = await fetch("/api/tracking/transfer", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference_code: tracking.referenceCode }),
      });
      const payload = (await response.json().catch(() => null)) as unknown;

      if (!response.ok) {
        throw new Error(
          readErrorMessage(
            payload,
            "Konfirmasi belum dapat dikirim. Coba lagi atau hubungi admin melalui WhatsApp.",
          ),
        );
      }

      onVerificationRequested();
    } catch (reason) {
      setConfirmationError(
        reason instanceof Error
          ? reason.message
          : "Konfirmasi belum dapat dikirim. Coba lagi atau hubungi admin melalui WhatsApp.",
      );
    } finally {
      setIsConfirming(false);
    }
  }

  if (!payment.required || payment.status === "belum-diperlukan") {
    return (
      <section className="border-t border-neutral-200 pt-7" aria-labelledby="payment-title">
        <div className="flex gap-4">
          <CreditCard className="mt-1 h-5 w-5 shrink-0 text-primary-dark" aria-hidden="true" />
          <div>
            <h3 id="payment-title" className="text-lg font-semibold text-accent">
              Belum ada pembayaran yang perlu dilakukan
            </h3>
            <p className="mt-2 text-sm leading-7 text-neutral-600">
              Admin akan menyampaikan rincian pembayaran setelah kebutuhan dan
              biaya pengurusan disepakati.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const awaitingPayment = payment.status === "menunggu-pembayaran";
  const awaitingVerification =
    payment.status === "menunggu-verifikasi" || payment.verificationRequested;
  const confirmed = payment.status === "sudah-dibayar";

  return (
    <section className="border-t border-neutral-200 pt-7" aria-labelledby="payment-title">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-primary-dark">
            Informasi pembayaran
          </p>
          <h3 id="payment-title" className="mt-2 text-2xl font-semibold text-accent">
            {paymentStatusLabels[payment.status]}
          </h3>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-extrabold ${
            confirmed
              ? "border-status-success-border bg-status-success-surface text-status-success-text"
              : awaitingVerification
                ? "border-status-waiting-border bg-status-waiting-surface text-status-waiting-text"
                : "border-status-progress-border bg-status-progress-surface text-status-progress-text"
          }`}
        >
          {confirmed ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />}
          {paymentStatusLabels[payment.status]}
        </span>
      </div>

      <dl className="mt-6 grid gap-5 border-y border-neutral-200 py-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">
            Jumlah pembayaran
          </dt>
          <dd className="mt-2 font-display text-3xl font-semibold text-accent">
            {formatRupiah(payment.amountRupiah)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">
            Waktu pembayaran
          </dt>
          <dd className="mt-2 text-sm font-semibold leading-7 text-accent">
            {payment.timing === "sebelum-proses"
              ? "Sebelum pengurusan dimulai"
              : payment.timing === "setelah-selesai"
                ? "Setelah pengurusan selesai"
                : "Sesuai konfirmasi admin"}
          </dd>
        </div>
      </dl>

      {!confirmed && hasPaymentMethod ? (
        <div className="mt-7 grid gap-6 lg:grid-cols-2">
          {hasBankDetails ? (
            <article className="border border-neutral-200 bg-inset p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <Landmark className="h-5 w-5 text-primary-dark" aria-hidden="true" />
                <h4 className="font-semibold text-accent">Transfer bank</h4>
              </div>
              <dl className="mt-5 space-y-4 text-sm">
                {instructions?.bankName ? (
                  <div>
                    <dt className="text-neutral-500">Bank</dt>
                    <dd className="mt-1 font-bold text-accent">{instructions.bankName}</dd>
                  </div>
                ) : null}
                {instructions?.accountHolder ? (
                  <div>
                    <dt className="text-neutral-500">Nama pemilik rekening</dt>
                    <dd className="mt-1 font-bold text-accent">{instructions.accountHolder}</dd>
                  </div>
                ) : null}
                {instructions?.accountNumber ? (
                  <div>
                    <dt className="text-neutral-500">Nomor rekening</dt>
                    <dd className="mt-1 flex flex-wrap items-center gap-3">
                      <span className="break-all font-mono text-base font-bold text-accent">
                        {instructions.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={copyAccountNumber}
                        className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-neutral-300 px-3 text-xs font-extrabold text-accent transition-colors hover:border-primary-dark hover:text-primary-dark"
                      >
                        <Copy className="h-4 w-4" aria-hidden="true" />
                        Salin nomor
                      </button>
                    </dd>
                  </div>
                ) : null}
              </dl>
              <p className="mt-3 text-xs leading-6 text-neutral-500" role="status" aria-live="polite">
                {copyMessage}
              </p>
            </article>
          ) : null}

          {instructions?.qrisImageUrl ? (
            <article className="border border-neutral-200 bg-inset p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <QrCode className="h-5 w-5 text-primary-dark" aria-hidden="true" />
                <h4 className="font-semibold text-accent">Pembayaran melalui QRIS</h4>
              </div>
              <div className="mt-5 w-full max-w-xs bg-white p-3">
                <Image
                  src={instructions.qrisImageUrl}
                  alt="Kode QRIS pembayaran Biro Jasa Tiga Saudara"
                  width={480}
                  height={480}
                  sizes="(max-width: 640px) 75vw, 320px"
                  className="h-auto w-full"
                />
              </div>
              <p className="mt-4 text-xs leading-6 text-neutral-600">
                Jika Anda tidak dapat menggunakan QRIS, hubungi admin untuk
                meminta instruksi transfer.
              </p>
            </article>
          ) : null}
        </div>
      ) : null}

      {!confirmed && instructions?.note ? (
        <div className="mt-6 border-l-2 border-primary-dark pl-5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-primary-dark">
            Catatan pembayaran
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-neutral-600">
            {instructions.note}
          </p>
        </div>
      ) : null}

      {!confirmed && !hasPaymentMethod ? (
        <p className="mt-6 text-sm leading-7 text-neutral-600">
          Detail rekening belum tersedia di halaman ini. Hubungi admin sebelum
          melakukan pembayaran.
        </p>
      ) : null}

      {awaitingPayment ? (
        <div className="mt-7 border-t border-neutral-200 pt-6">
          <p className="max-w-3xl text-sm leading-7 text-neutral-600">
            Pembayaran diperiksa manual oleh admin. Menekan tombol berikut tidak
            membuat pembayaran otomatis dinyatakan berhasil.
          </p>
          <button
            type="button"
            onClick={requestVerification}
            disabled={isConfirming}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-sm bg-primary-dark px-6 py-4 text-sm font-extrabold text-white transition-colors hover:bg-navy disabled:cursor-wait disabled:opacity-70 sm:w-auto"
          >
            {isConfirming ? (
              <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <Clipboard className="h-5 w-5" aria-hidden="true" />
            )}
            {isConfirming ? "Mengirim konfirmasi..." : "Saya sudah transfer"}
          </button>
          {confirmationError ? (
            <p className="mt-4 text-sm leading-7 text-state-danger-text" role="alert">
              {confirmationError}
            </p>
          ) : null}
        </div>
      ) : null}

      {awaitingVerification ? (
        <div className="mt-7 border border-status-waiting-border bg-status-waiting-surface p-5 text-status-waiting-text" role="status">
          <p className="font-bold">Konfirmasi transfer sudah diterima.</p>
          <p className="mt-2 text-sm leading-7">
            Admin akan mencocokkan pembayaran secara manual. Status akan berubah
            setelah pemeriksaan selesai.
          </p>
        </div>
      ) : null}

      {confirmed ? (
        <div className="mt-7 border border-status-success-border bg-status-success-surface p-5 text-status-success-text" role="status">
          <p className="font-bold">Pembayaran telah dikonfirmasi admin.</p>
          <p className="mt-2 text-sm leading-7">
            Tidak ada tindakan pembayaran lain yang perlu dilakukan untuk kode ini.
          </p>
        </div>
      ) : null}
    </section>
  );
}

export default function TrackingLookup() {
  const [referenceCode, setReferenceCode] = useState("");
  const [tracking, setTracking] = useState<PublicTrackingResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  function focusResult() {
    window.requestAnimationFrame(() => resultRef.current?.focus());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    const normalizedCode = normalizeTrackingReferenceCode(referenceCode);
    setReferenceCode(normalizedCode);
    setTracking(null);
    setMessage(null);
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch("/api/tracking", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference_code: normalizedCode }),
        cache: "no-store",
        signal: controller.signal,
      });
      const payload = (await response.json().catch(() => null)) as unknown;

      if (!response.ok || !isLookupSuccess(payload)) {
        throw new Error(
          readErrorMessage(
            payload,
            "Status belum dapat diperiksa. Coba lagi beberapa saat.",
          ),
        );
      }

      setTracking(payload.tracking);
    } catch (reason) {
      setMessage(
        reason instanceof DOMException && reason.name === "AbortError"
          ? "Pemeriksaan memerlukan waktu terlalu lama. Coba lagi atau hubungi admin melalui WhatsApp."
          : reason instanceof Error
            ? reason.message
            : "Status belum dapat diperiksa. Coba lagi beberapa saat.",
      );
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
      focusResult();
    }
  }

  function handleCodeChange(value: string) {
    const normalized = value.toUpperCase();
    setReferenceCode(normalized);
    setMessage(null);
    if (tracking && normalized.trim() !== tracking.referenceCode) {
      setTracking(null);
    }
  }

  function markVerificationRequested() {
    setTracking((current) =>
      current
        ? {
            ...current,
            payment: {
              ...current.payment,
              status: "menunggu-verifikasi",
              verificationRequested: true,
            },
          }
        : current,
    );
  }

  return (
    <section className="bg-page pb-24 text-accent md:pb-32" aria-labelledby="tracking-form-title">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.64fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
              Kode dari WhatsApp
            </p>
            <h2 id="tracking-form-title" className="mt-5 max-w-xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
              Masukkan kode referensi pengurusan.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">
              Kode tercantum pada ringkasan WhatsApp setelah formulir berhasil
              dicatat. Kode ini berbeda dari nomor telepon atau ID internal.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border border-neutral-200 bg-panel p-5 shadow-medium sm:p-8"
            aria-busy={isLoading}
          >
            <label htmlFor="reference-code" className="text-sm font-extrabold text-accent">
              Kode referensi
            </label>
            <p id="reference-code-help" className="mt-2 text-sm leading-7 text-neutral-500">
              Contoh struktur: TS-YYMM-A3F9C71B2D
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                id="reference-code"
                name="reference_code"
                type="text"
                required
                maxLength={TRACKING_REFERENCE_CODE_MAX_LENGTH}
                value={referenceCode}
                onChange={(event) => handleCodeChange(event.target.value)}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                aria-describedby="reference-code-help"
                placeholder="TS-YYMM-XXXXXXXXXX"
                className="min-h-12 min-w-0 flex-1 rounded-sm border border-control-border bg-paper px-4 py-3 font-mono text-base font-bold uppercase tracking-[0.08em] text-accent outline-none transition-colors placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-form-placeholder focus:border-primary-dark focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-sm bg-primary-dark px-6 py-3 text-sm font-extrabold text-white transition-colors hover:bg-navy disabled:cursor-wait disabled:opacity-70"
              >
                {isLoading ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <FileSearch className="h-5 w-5" aria-hidden="true" />
                )}
                {isLoading ? "Memeriksa..." : "Periksa status"}
              </button>
            </div>
            <p className="mt-4 text-xs leading-6 text-neutral-500">
              Kode tidak disimpan di alamat halaman atau riwayat URL browser.
            </p>
          </form>
        </div>

        <div ref={resultRef} tabIndex={-1} className="scroll-mt-28 outline-none" aria-live="polite">
          {message ? (
            <div className="mt-10 border border-state-danger-border bg-state-danger-surface p-5 text-state-danger-text sm:p-6" role="alert">
              <p className="font-bold">Status belum dapat diperiksa</p>
              <p className="mt-2 max-w-3xl text-sm leading-7">{message}</p>
              <a
                href={COMPANY.whatsappUrl(
                  "Halo Biro Jasa Tiga Saudara, saya memerlukan bantuan untuk memeriksa kode referensi pengurusan.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-sm border border-current px-4 text-sm font-extrabold"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Hubungi admin
              </a>
            </div>
          ) : null}

          {tracking ? (
            <article className="mt-10 border border-neutral-200 bg-panel p-5 shadow-medium sm:p-8 lg:p-10">
              <header className="grid gap-7 border-b border-neutral-200 pb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                <div>
                  <p className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-primary-dark">
                    Status saat ini
                  </p>
                  <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight text-accent sm:text-4xl">
                    {tracking.statusPresentation.label}
                  </h2>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">
                    {tracking.statusPresentation.description}
                  </p>
                </div>
                <span className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-extrabold ${statusToneClasses[tracking.statusPresentation.tone]}`}>
                  {tracking.statusPresentation.label}
                </span>
              </header>

              <dl className="grid gap-6 border-b border-neutral-200 py-7 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">Kode referensi</dt>
                  <dd className="mt-2 break-all font-mono text-sm font-bold text-accent">{tracking.referenceCode}</dd>
                </div>
                <div>
                  <dt className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">Kategori layanan</dt>
                  <dd className="mt-2 text-sm font-semibold leading-7 text-accent">{tracking.serviceCategoryLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">Detail layanan</dt>
                  <dd className="mt-2 text-sm font-semibold leading-7 text-accent">{tracking.serviceDetail || "Belum dirinci"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">Terakhir diperbarui</dt>
                  <dd className="mt-2 text-sm font-semibold leading-7 text-accent">{formatDate(tracking.updatedAt)}</dd>
                </div>
              </dl>

              <PaymentPanel
                tracking={tracking}
                onVerificationRequested={markVerificationRequested}
              />
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}

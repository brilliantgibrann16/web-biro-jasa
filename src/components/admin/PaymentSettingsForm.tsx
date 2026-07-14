"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { ImageUp, Save, Trash2 } from "lucide-react";

interface PaymentSettingsFormProps {
  initialBankName: string | null;
  initialBankAccountNumber: string | null;
  initialBankAccountHolder: string | null;
  initialInstructions: string | null;
  initialQrisStoragePath: string | null;
  initialQrisPublicUrl: string | null;
  initialUpdatedAt: string;
}

interface SettingsMutationResponse {
  error?: string;
  errors?: Record<string, string>;
  settings?: {
    bank_name: string | null;
    bank_account_number: string | null;
    bank_account_holder: string | null;
    instructions: string | null;
    qris_storage_path: string | null;
    updated_at: string;
  };
  qris_storage_path?: string | null;
  qris_public_url?: string | null;
  updated_at?: string;
}

const MAX_QRIS_BYTES = 1_572_864;

export default function PaymentSettingsForm({
  initialBankName,
  initialBankAccountNumber,
  initialBankAccountHolder,
  initialInstructions,
  initialQrisStoragePath,
  initialQrisPublicUrl,
  initialUpdatedAt,
}: PaymentSettingsFormProps) {
  const qrisInputRef = useRef<HTMLInputElement>(null);
  const [bankName, setBankName] = useState(initialBankName ?? "");
  const [accountNumber, setAccountNumber] = useState(initialBankAccountNumber ?? "");
  const [accountHolder, setAccountHolder] = useState(initialBankAccountHolder ?? "");
  const [instructions, setInstructions] = useState(initialInstructions ?? "");
  const [qrisStoragePath, setQrisStoragePath] = useState(initialQrisStoragePath);
  const [qrisPublicUrl, setQrisPublicUrl] = useState(initialQrisPublicUrl);
  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [pendingAction, setPendingAction] = useState<"settings" | "upload" | "delete" | null>(null);
  const [conflict, setConflict] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function readError(payload: SettingsMutationResponse | null, fallback: string): string {
    const firstFieldError = payload?.errors ? Object.values(payload.errors)[0] : undefined;
    return firstFieldError || payload?.error || fallback;
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setMessage(null);

    if (
      file &&
      (!(["image/png", "image/jpeg", "image/webp"] as string[]).includes(file.type) ||
        file.size > MAX_QRIS_BYTES)
    ) {
      event.target.value = "";
      setQrisFile(null);
      setMessage({ type: "error", text: "Gunakan PNG, JPEG, atau WebP dengan ukuran maksimal 1,5 MB." });
      return;
    }

    setQrisFile(file);
  }

  async function handleSettingsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction("settings");
    setMessage(null);

    try {
      const response = await fetch("/api/admin/payment-settings", {
        method: "PATCH",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          bank_name: bankName,
          bank_account_number: accountNumber,
          bank_account_holder: accountHolder,
          instructions,
          updated_at: updatedAt,
        }),
      });
      const payload = (await response.json().catch(() => null)) as SettingsMutationResponse | null;

      if (response.status === 401) {
        window.location.assign("/admin/login?next=%2Fadmin%2Fpengaturan-pembayaran");
        return;
      }
      if (response.status === 409) setConflict(true);
      if (!response.ok || !payload?.settings) {
        throw new Error(readError(payload, "Pengaturan pembayaran belum dapat disimpan."));
      }

      setBankName(payload.settings.bank_name ?? "");
      setAccountNumber(payload.settings.bank_account_number ?? "");
      setAccountHolder(payload.settings.bank_account_holder ?? "");
      setInstructions(payload.settings.instructions ?? "");
      setQrisStoragePath(payload.settings.qris_storage_path);
      setUpdatedAt(payload.settings.updated_at);
      setConflict(false);
      setMessage({ type: "success", text: "Pengaturan pembayaran berhasil disimpan." });
    } catch (reason) {
      setMessage({ type: "error", text: reason instanceof Error ? reason.message : "Pengaturan belum dapat disimpan." });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleQrisUpload() {
    if (!qrisFile) {
      setMessage({ type: "error", text: "Pilih gambar QRIS terlebih dahulu." });
      return;
    }

    setPendingAction("upload");
    setMessage(null);
    const formData = new FormData();
    formData.set("qris", qrisFile);
    formData.set("updated_at", updatedAt);

    try {
      const response = await fetch("/api/admin/payment-settings/qris", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as SettingsMutationResponse | null;

      if (response.status === 401) {
        window.location.assign("/admin/login?next=%2Fadmin%2Fpengaturan-pembayaran");
        return;
      }
      if (response.status === 409) setConflict(true);
      if (!response.ok || !payload?.updated_at || !payload.qris_storage_path || !payload.qris_public_url) {
        throw new Error(readError(payload, "QRIS belum dapat diunggah."));
      }

      setQrisStoragePath(payload.qris_storage_path);
      setQrisPublicUrl(payload.qris_public_url);
      setUpdatedAt(payload.updated_at);
      setQrisFile(null);
      if (qrisInputRef.current) qrisInputRef.current.value = "";
      setConflict(false);
      setMessage({ type: "success", text: "Gambar QRIS berhasil diperbarui." });
    } catch (reason) {
      setMessage({ type: "error", text: reason instanceof Error ? reason.message : "QRIS belum dapat diunggah." });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleQrisDelete() {
    if (!qrisStoragePath || !window.confirm("Hapus QRIS dari instruksi pembayaran?")) return;
    setPendingAction("delete");
    setMessage(null);

    try {
      const response = await fetch("/api/admin/payment-settings/qris", {
        method: "DELETE",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ updated_at: updatedAt }),
      });
      const payload = (await response.json().catch(() => null)) as SettingsMutationResponse | null;

      if (response.status === 401) {
        window.location.assign("/admin/login?next=%2Fadmin%2Fpengaturan-pembayaran");
        return;
      }
      if (response.status === 409) setConflict(true);
      if (!response.ok || !payload?.updated_at) {
        throw new Error(readError(payload, "QRIS belum dapat dihapus."));
      }

      setQrisStoragePath(null);
      setQrisPublicUrl(null);
      setUpdatedAt(payload.updated_at);
      setConflict(false);
      setMessage({ type: "success", text: "Gambar QRIS berhasil dihapus." });
    } catch (reason) {
      setMessage({ type: "error", text: reason instanceof Error ? reason.message : "QRIS belum dapat dihapus." });
    } finally {
      setPendingAction(null);
    }
  }

  const pending = pendingAction !== null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)] lg:items-start">
      <form onSubmit={handleSettingsSubmit} className="rounded-xl border border-neutral-200 bg-paper p-5 shadow-soft sm:p-7" aria-busy={pendingAction === "settings"}>
        <h2 className="text-2xl font-semibold text-accent">Rekening dan instruksi</h2>
        <p className="mt-2 text-sm leading-7 text-neutral-600">
          Data ini dipakai ulang untuk order yang sedang menunggu pembayaran. Nomor rekening disimpan sebagai teks agar angka nol di depan tidak hilang.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-accent">
            Nama bank
            <input value={bankName} onChange={(event) => setBankName(event.target.value)} maxLength={80} disabled={pending} className="mt-2 min-h-12 w-full rounded-lg border border-control-border bg-surface px-4 text-base" placeholder="Contoh: BCA" />
          </label>
          <label className="text-sm font-bold text-accent">
            Nomor rekening
            <input value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} maxLength={50} inputMode="numeric" autoComplete="off" disabled={pending} className="mt-2 min-h-12 w-full rounded-lg border border-control-border bg-surface px-4 text-base" placeholder="Masukkan sebagai teks" />
          </label>
          <label className="text-sm font-bold text-accent sm:col-span-2">
            Nama pemilik rekening
            <input value={accountHolder} onChange={(event) => setAccountHolder(event.target.value)} maxLength={120} autoComplete="off" disabled={pending} className="mt-2 min-h-12 w-full rounded-lg border border-control-border bg-surface px-4 text-base" />
          </label>
        </div>

        <label className="mt-5 block text-sm font-bold text-accent">
          Instruksi tambahan <span className="font-normal">(opsional)</span>
          <textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} maxLength={1000} rows={5} disabled={pending} className="mt-2 w-full resize-y rounded-lg border border-control-border bg-surface px-4 py-3 text-base leading-7" placeholder="Contoh: sertakan kode referensi pada berita transfer." />
        </label>
        <p className="mt-1 text-right text-xs text-neutral-500">{instructions.length}/1.000</p>

        <button type="submit" disabled={pending || conflict} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-extrabold text-white hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60 sm:w-auto">
          <Save className="h-4 w-4" aria-hidden="true" />
          {pendingAction === "settings" ? "Menyimpan..." : "Simpan pengaturan"}
        </button>
      </form>

      <section className="rounded-xl border border-neutral-200 bg-paper p-5 shadow-soft sm:p-7" aria-labelledby="qris-settings-heading">
        <h2 id="qris-settings-heading" className="text-2xl font-semibold text-accent">QRIS statis</h2>
        <p className="mt-2 text-sm leading-7 text-neutral-600">
          Gunakan QRIS milik bisnis. File yang diterima: PNG, JPEG, atau WebP, maksimal 1,5 MB.
        </p>

        {qrisPublicUrl ? (
          <div className="mt-5 overflow-hidden rounded-lg border border-neutral-200 bg-white p-3">
            <Image src={qrisPublicUrl} alt="QRIS pembayaran yang tersimpan" width={720} height={720} unoptimized className="mx-auto h-auto max-h-72 w-auto object-contain" />
          </div>
        ) : (
          <div className="mt-5 grid min-h-48 place-items-center rounded-lg border border-dashed border-neutral-300 bg-warm-50 px-5 text-center text-sm text-neutral-500">
            Belum ada QRIS yang tersimpan.
          </div>
        )}

        <label className="mt-5 block text-sm font-bold text-accent" htmlFor="qris-file">
          Pilih gambar QRIS
        </label>
        <input ref={qrisInputRef} id="qris-file" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} disabled={pending} className="mt-2 block w-full text-sm text-neutral-600 file:mr-3 file:min-h-10 file:rounded-lg file:border-0 file:bg-warm-100 file:px-4 file:font-bold file:text-accent" />

        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <button type="button" onClick={handleQrisUpload} disabled={pending || conflict || !qrisFile} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-extrabold text-white hover:bg-primary-dark disabled:cursor-wait disabled:opacity-50">
            <ImageUp className="h-4 w-4" aria-hidden="true" />
            {pendingAction === "upload" ? "Mengunggah..." : "Unggah QRIS"}
          </button>
          <button type="button" onClick={handleQrisDelete} disabled={pending || conflict || !qrisStoragePath} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-state-danger-border bg-surface px-4 text-sm font-bold text-state-danger-text disabled:cursor-wait disabled:opacity-50">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {pendingAction === "delete" ? "Menghapus..." : "Hapus QRIS"}
          </button>
        </div>
      </section>

      {message ? (
        <div role={message.type === "error" ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-sm leading-6 lg:col-span-2 ${message.type === "success" ? "border-state-success-border bg-state-success-surface text-state-success-text" : "border-state-danger-border bg-state-danger-surface text-state-danger-text"}`}>
          <p>{message.text}</p>
          {conflict ? <button type="button" onClick={() => window.location.reload()} className="mt-3 min-h-10 rounded-lg border border-current px-3 font-bold">Muat data terbaru</button> : null}
        </div>
      ) : null}

      <div className="rounded-lg border border-status-waiting-border bg-status-waiting-surface px-4 py-3 text-sm leading-6 text-status-waiting-text lg:col-span-2">
        Mengubah rekening atau QRIS akan mengubah instruksi yang terlihat pada semua order yang masih menunggu pembayaran. Pastikan data sudah benar sebelum menyimpan.
      </div>
    </div>
  );
}

import { RefreshCw } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import PaymentSettingsForm from "@/components/admin/PaymentSettingsForm";
import { requireAdminAuth } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function PaymentSettingsPage() {
  const { supabase, claims } = await requireAdminAuth();
  const { data: settings, error } = await supabase
    .from("payment_settings")
    .select(
      "id, bank_name, bank_account_number, bank_account_holder, qris_storage_path, instructions, updated_at",
    )
    .eq("id", true)
    .maybeSingle();
  const userEmail = typeof claims.email === "string" ? claims.email : undefined;

  let qrisPublicUrl: string | null = null;
  if (settings?.qris_storage_path) {
    qrisPublicUrl = supabase.storage
      .from("payment-assets")
      .getPublicUrl(settings.qris_storage_path).data.publicUrl;
  }

  return (
    <>
      <AdminHeader userEmail={userEmail} />
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="border-b border-neutral-200 pb-7">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-primary-dark">
            Koordinasi pembayaran
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-accent sm:text-4xl">
            Pengaturan pembayaran
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-600">
            Simpan satu sumber rekening dan QRIS yang dipakai ulang pada halaman tracking. Sistem ini hanya menyampaikan instruksi dan tetap membutuhkan verifikasi manual oleh admin.
          </p>
        </div>

        {error || !settings ? (
          <div className="mt-8 rounded-xl border border-state-danger-border bg-state-danger-surface p-6 text-state-danger-text" role="alert">
            <h2 className="text-xl font-semibold">Pengaturan belum dapat dimuat</h2>
            <p className="mt-2 text-sm leading-7">
              Pastikan migrasi Supabase terbaru sudah diterapkan, lalu muat ulang halaman.
            </p>
            <a href="/admin/pengaturan-pembayaran" className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-current px-4 text-sm font-bold">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Coba lagi
            </a>
          </div>
        ) : (
          <div className="mt-8">
            <PaymentSettingsForm
              initialBankName={settings.bank_name}
              initialBankAccountNumber={settings.bank_account_number}
              initialBankAccountHolder={settings.bank_account_holder}
              initialInstructions={settings.instructions}
              initialQrisStoragePath={settings.qris_storage_path}
              initialQrisPublicUrl={qrisPublicUrl}
              initialUpdatedAt={settings.updated_at}
            />
          </div>
        )}
      </div>
    </>
  );
}

import { getAdminAuthContext } from "@/lib/auth/admin";
import { validatePaymentUpdate, readExpectedUpdatedAt } from "@/lib/admin-tracking/validation";
import { UUID_PATTERN } from "@/lib/server/patterns";
import { isSameOriginMutation, jsonNoStore } from "../../../_utils";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginMutation(request)) {
    return jsonNoStore({ error: "Permintaan pembaruan tidak diizinkan." }, { status: 403 });
  }

  const auth = await getAdminAuthContext();
  if (!auth) {
    return jsonNoStore({ error: "Sesi admin tidak valid." }, { status: 401 });
  }

  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) {
    return jsonNoStore({ error: "ID inquiry tidak valid." }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonNoStore({ error: "Data pembayaran tidak valid." }, { status: 400 });
  }

  const validation = validatePaymentUpdate(payload);
  const expectedUpdatedAt = readExpectedUpdatedAt(payload);
  if (!validation.ok || !expectedUpdatedAt) {
    return jsonNoStore(
      {
        error: "Periksa kembali data pembayaran.",
        errors: {
          ...(validation.ok ? {} : validation.errors),
          ...(expectedUpdatedAt ? {} : { updated_at: "Versi inquiry tidak valid. Muat ulang halaman." }),
        },
      },
      { status: 400 },
    );
  }

  const { data: current, error: currentError } = await auth.supabase
    .from("inquiries")
    .select(
      "id, updated_at, payment_status, payment_confirmation_requested_at, payment_verified_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (currentError) {
    return jsonNoStore({ error: "Data pembayaran belum dapat diperiksa." }, { status: 500 });
  }
  if (!current) {
    return jsonNoStore({ error: "Inquiry tidak ditemukan." }, { status: 404 });
  }
  if (current.updated_at !== expectedUpdatedAt) {
    return jsonNoStore(
      {
        error: "Inquiry telah berubah di sesi lain. Muat data terbaru sebelum menyimpan lagi.",
        current_updated_at: current.updated_at,
      },
      { status: 409 },
    );
  }

  const next = validation.data;
  if (
    next.payment_status === "menunggu-pembayaran" ||
    next.payment_status === "menunggu-verifikasi"
  ) {
    const { data: settings, error: settingsError } = await auth.supabase
      .from("payment_settings")
      .select(
        "bank_name, bank_account_number, bank_account_holder, qris_storage_path",
      )
      .eq("id", true)
      .maybeSingle();

    if (settingsError) {
      return jsonNoStore({ error: "Pengaturan pembayaran belum dapat diperiksa." }, { status: 500 });
    }

    const hasBank = Boolean(
      settings?.bank_name &&
        settings.bank_account_number &&
        settings.bank_account_holder,
    );
    if (!hasBank && !settings?.qris_storage_path) {
      return jsonNoStore(
        {
          error:
            "Lengkapi rekening bank atau QRIS di pengaturan pembayaran sebelum meminta pelanggan melakukan transfer.",
        },
        { status: 409 },
      );
    }
  }

  if (
    next.payment_status === "menunggu-verifikasi" &&
    (current.payment_status !== "menunggu-verifikasi" ||
      !current.payment_confirmation_requested_at)
  ) {
    return jsonNoStore(
      { error: "Status verifikasi hanya dapat berasal dari laporan transfer pelanggan." },
      { status: 400 },
    );
  }

  let confirmationRequestedAt = current.payment_confirmation_requested_at;
  let verifiedAt = current.payment_verified_at;

  if (
    !next.payment_required ||
    next.payment_status === "belum-diperlukan" ||
    next.payment_status === "menunggu-pembayaran"
  ) {
    confirmationRequestedAt = null;
    verifiedAt = null;
  } else if (next.payment_status === "menunggu-verifikasi") {
    verifiedAt = null;
  } else if (next.payment_status === "sudah-dibayar") {
    verifiedAt =
      current.payment_status === "sudah-dibayar" && current.payment_verified_at
        ? current.payment_verified_at
        : new Date().toISOString();
  }

  const { data, error } = await auth.supabase
    .from("inquiries")
    .update({
      ...next,
      payment_confirmation_requested_at: confirmationRequestedAt,
      payment_verified_at: verifiedAt,
    })
    .eq("id", id)
    .eq("updated_at", expectedUpdatedAt)
    .select(
      "id, updated_at, payment_required, payment_amount, payment_timing, payment_status, payment_confirmation_requested_at, payment_verified_at",
    )
    .maybeSingle();

  if (error) {
    return jsonNoStore({ error: "Pembayaran belum dapat diperbarui. Coba lagi." }, { status: 500 });
  }
  if (!data) {
    return jsonNoStore(
      { error: "Inquiry telah berubah. Muat data terbaru sebelum menyimpan lagi." },
      { status: 409 },
    );
  }

  return jsonNoStore({ ok: true, inquiry: data });
}

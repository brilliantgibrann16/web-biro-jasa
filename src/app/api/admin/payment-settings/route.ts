import { getAdminAuthContext } from "@/lib/auth/admin";
import { readExpectedUpdatedAt, validatePaymentSettings } from "@/lib/admin-tracking/validation";
import { isSameOriginMutation, jsonNoStore } from "../_utils";

export async function PATCH(request: Request) {
  if (!isSameOriginMutation(request)) {
    return jsonNoStore({ error: "Permintaan pembaruan tidak diizinkan." }, { status: 403 });
  }

  const auth = await getAdminAuthContext();
  if (!auth) {
    return jsonNoStore({ error: "Sesi admin tidak valid." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonNoStore({ error: "Data pengaturan tidak valid." }, { status: 400 });
  }

  const validation = validatePaymentSettings(payload);
  const expectedUpdatedAt = readExpectedUpdatedAt(payload);
  if (!validation.ok || !expectedUpdatedAt) {
    return jsonNoStore(
      {
        error: "Periksa kembali pengaturan pembayaran.",
        errors: {
          ...(validation.ok ? {} : validation.errors),
          ...(expectedUpdatedAt ? {} : { updated_at: "Versi pengaturan tidak valid. Muat ulang halaman." }),
        },
      },
      { status: 400 },
    );
  }

  const { data, error } = await auth.supabase
    .from("payment_settings")
    .update(validation.data)
    .eq("id", true)
    .eq("updated_at", expectedUpdatedAt)
    .select(
      "id, bank_name, bank_account_number, bank_account_holder, qris_storage_path, instructions, updated_at",
    )
    .maybeSingle();

  if (error) {
    return jsonNoStore({ error: "Pengaturan pembayaran belum dapat disimpan." }, { status: 500 });
  }
  if (!data) {
    const { data: current } = await auth.supabase
      .from("payment_settings")
      .select("updated_at")
      .eq("id", true)
      .maybeSingle();

    return jsonNoStore(
      current
        ? {
            error: "Pengaturan telah berubah di sesi lain. Muat data terbaru sebelum menyimpan lagi.",
            current_updated_at: current.updated_at,
          }
        : { error: "Pengaturan pembayaran belum tersedia." },
      { status: current ? 409 : 404 },
    );
  }

  return jsonNoStore({ ok: true, settings: data });
}

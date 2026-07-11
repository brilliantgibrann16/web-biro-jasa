import { getAdminAuthContext } from "@/lib/auth/admin";
import { validateInquiryUpdate } from "@/lib/inquiries/validation";
import { isSameOriginMutation, jsonNoStore } from "../../_utils";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/admin/inquiries/[id]">,
) {
  if (!isSameOriginMutation(request)) {
    return jsonNoStore(
      { error: "Permintaan pembaruan tidak diizinkan." },
      { status: 403 },
    );
  }

  const auth = await getAdminAuthContext();
  if (!auth) {
    return jsonNoStore(
      { error: "Sesi admin tidak valid." },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) {
    return jsonNoStore(
      { error: "ID inquiry tidak valid." },
      { status: 400 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonNoStore(
      { error: "Data pembaruan tidak valid." },
      { status: 400 },
    );
  }

  const validation = validateInquiryUpdate(payload);
  if (!validation.ok) {
    return jsonNoStore(
      {
        error: "Periksa kembali data pembaruan.",
        errors: validation.errors,
      },
      { status: 400 },
    );
  }

  const { data, error } = await auth.supabase
    .from("inquiries")
    .update(validation.data)
    .eq("id", id)
    .select("id, status, handled_note, updated_at")
    .maybeSingle();

  if (error) {
    return jsonNoStore(
      { error: "Inquiry belum dapat diperbarui. Coba lagi." },
      { status: 500 },
    );
  }

  if (!data) {
    return jsonNoStore(
      { error: "Inquiry tidak ditemukan." },
      { status: 404 },
    );
  }

  return jsonNoStore({ ok: true, inquiry: data });
}

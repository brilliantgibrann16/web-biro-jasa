import { getAdminAuthContext } from "@/lib/auth/admin";
import { readExpectedUpdatedAt } from "@/lib/admin-tracking/validation";
import { isSameOriginMutation, jsonNoStore } from "../../../_utils";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
    return jsonNoStore({ error: "ID testimoni tidak valid." }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonNoStore({ error: "Data publikasi tidak valid." }, { status: 400 });
  }

  const expectedUpdatedAt = readExpectedUpdatedAt(payload);
  const published =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>).published
      : undefined;
  if (typeof published !== "boolean" || !expectedUpdatedAt) {
    return jsonNoStore({ error: "Periksa pilihan publikasi dan muat ulang halaman." }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("testimonials")
    .update({
      published,
      published_at: published ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("updated_at", expectedUpdatedAt)
    .select(
      "id, inquiry_id, service_category, rating, testimonial_text, display_name, published, published_at, created_at, updated_at",
    )
    .maybeSingle();

  if (error) {
    return jsonNoStore({ error: "Status publikasi belum dapat diperbarui." }, { status: 500 });
  }
  if (!data) {
    return jsonNoStore({ error: "Testimoni telah berubah atau tidak ditemukan. Muat ulang halaman." }, { status: 409 });
  }

  return jsonNoStore({ ok: true, testimonial: data });
}

import { getAdminAuthContext } from "@/lib/auth/admin";
import { readExpectedUpdatedAt } from "@/lib/admin-tracking/validation";
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
    return jsonNoStore({ error: "Data kelayakan tidak valid." }, { status: 400 });
  }

  const expectedUpdatedAt = readExpectedUpdatedAt(payload);
  const eligible =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>).eligible
      : undefined;
  if (typeof eligible !== "boolean" || !expectedUpdatedAt) {
    return jsonNoStore({ error: "Periksa pilihan kelayakan dan muat ulang halaman." }, { status: 400 });
  }

  if (!eligible) {
    const { data: existing, error: existingError } = await auth.supabase
      .from("testimonials")
      .select("id")
      .eq("inquiry_id", id)
      .maybeSingle();

    if (existingError) {
      return jsonNoStore({ error: "Draft testimoni belum dapat diperiksa." }, { status: 500 });
    }
    if (existing) {
      return jsonNoStore(
        { error: "Hapus draft testimoni terlebih dahulu sebelum membatalkan kelayakan." },
        { status: 409 },
      );
    }
  }

  const { data, error } = await auth.supabase
    .from("inquiries")
    .update({ testimonial_eligible_at: eligible ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("updated_at", expectedUpdatedAt)
    .select("id, testimonial_eligible_at, updated_at")
    .maybeSingle();

  if (error) {
    return jsonNoStore({ error: "Kelayakan testimoni belum dapat diperbarui." }, { status: 500 });
  }
  if (!data) {
    return jsonNoStore(
      { error: "Inquiry telah berubah. Muat data terbaru sebelum menyimpan lagi." },
      { status: 409 },
    );
  }

  return jsonNoStore({ ok: true, inquiry: data });
}

import { getAdminAuthContext } from "@/lib/auth/admin";
import { validateInquiryUpdate } from "@/lib/inquiries/validation";
import { UUID_PATTERN } from "@/lib/server/patterns";
import { isSameOriginMutation, jsonNoStore } from "../../_utils";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const TIMESTAMPTZ_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;

function readExpectedUpdatedAt(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const value = (payload as Record<string, unknown>).updated_at;
  if (typeof value !== "string") return null;

  const timestamp = value.trim();
  return TIMESTAMPTZ_PATTERN.test(timestamp) ? timestamp : null;
}

export async function PATCH(
  request: Request,
  context: RouteContext,
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
  const expectedUpdatedAt = readExpectedUpdatedAt(payload);
  if (!validation.ok || !expectedUpdatedAt) {
    return jsonNoStore(
      {
        error: "Periksa kembali data pembaruan.",
        errors: {
          ...(validation.ok ? {} : validation.errors),
          ...(expectedUpdatedAt
            ? {}
            : { updated_at: "Versi inquiry tidak valid. Muat ulang halaman." }),
        },
      },
      { status: 400 },
    );
  }

  const { data, error } = await auth.supabase
    .from("inquiries")
    .update(validation.data)
    .eq("id", id)
    .eq("updated_at", expectedUpdatedAt)
    .select("id, status, handled_note, updated_at")
    .maybeSingle();

  if (error) {
    return jsonNoStore(
      { error: "Inquiry belum dapat diperbarui. Coba lagi." },
      { status: 500 },
    );
  }

  if (!data) {
    const { data: current, error: currentError } = await auth.supabase
      .from("inquiries")
      .select("id, updated_at")
      .eq("id", id)
      .maybeSingle();

    if (currentError) {
      return jsonNoStore(
        { error: "Inquiry belum dapat diperiksa ulang. Coba lagi." },
        { status: 500 },
      );
    }

    if (current) {
      return jsonNoStore(
        {
          error:
            "Inquiry telah berubah di sesi lain. Muat data terbaru sebelum menyimpan lagi.",
          current_updated_at: current.updated_at,
        },
        { status: 409 },
      );
    }

    return jsonNoStore(
      { error: "Inquiry tidak ditemukan." },
      { status: 404 },
    );
  }

  return jsonNoStore({ ok: true, inquiry: data });
}

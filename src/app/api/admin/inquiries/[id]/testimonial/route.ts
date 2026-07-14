import { getAdminAuthContext } from "@/lib/auth/admin";
import {
  readExpectedUpdatedAt,
  validateTestimonialDraft,
} from "@/lib/admin-tracking/validation";
import { isSameOriginMutation, jsonNoStore } from "../../../_utils";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readTestimonialUpdatedAt(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  return readExpectedUpdatedAt({
    updated_at: (payload as Record<string, unknown>).testimonial_updated_at,
  });
}

export async function PUT(
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
    return jsonNoStore({ error: "Data testimoni tidak valid." }, { status: 400 });
  }

  const validation = validateTestimonialDraft(payload);
  const inquiryUpdatedAt = readExpectedUpdatedAt(payload);
  if (!validation.ok || !inquiryUpdatedAt) {
    return jsonNoStore(
      {
        error: "Periksa kembali draft testimoni.",
        errors: {
          ...(validation.ok ? {} : validation.errors),
          ...(inquiryUpdatedAt ? {} : { updated_at: "Versi inquiry tidak valid. Muat ulang halaman." }),
        },
      },
      { status: 400 },
    );
  }

  const { data: inquiry, error: inquiryError } = await auth.supabase
    .from("inquiries")
    .select("id, service_category, testimonial_eligible_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (inquiryError) {
    return jsonNoStore({ error: "Inquiry belum dapat diperiksa." }, { status: 500 });
  }
  if (!inquiry) {
    return jsonNoStore({ error: "Inquiry tidak ditemukan." }, { status: 404 });
  }
  if (!inquiry.testimonial_eligible_at) {
    return jsonNoStore({ error: "Tandai inquiry sebagai layak testimoni terlebih dahulu." }, { status: 409 });
  }
  if (inquiry.updated_at !== inquiryUpdatedAt) {
    return jsonNoStore(
      { error: "Inquiry telah berubah. Muat data terbaru sebelum menyimpan draft." },
      { status: 409 },
    );
  }

  const { data: existing, error: existingError } = await auth.supabase
    .from("testimonials")
    .select("id, published, updated_at")
    .eq("inquiry_id", id)
    .maybeSingle();

  if (existingError) {
    return jsonNoStore({ error: "Draft testimoni belum dapat diperiksa." }, { status: 500 });
  }
  if (existing?.published) {
    return jsonNoStore(
      { error: "Batalkan publikasi terlebih dahulu sebelum menyunting testimoni." },
      { status: 409 },
    );
  }

  if (existing) {
    const testimonialUpdatedAt = readTestimonialUpdatedAt(payload);
    if (!testimonialUpdatedAt) {
      return jsonNoStore({ error: "Versi draft tidak valid. Muat ulang halaman." }, { status: 400 });
    }
    if (existing.updated_at !== testimonialUpdatedAt) {
      return jsonNoStore({ error: "Draft telah berubah di sesi lain. Muat ulang halaman." }, { status: 409 });
    }

    const { data, error } = await auth.supabase
      .from("testimonials")
      .update(validation.data)
      .eq("id", existing.id)
      .eq("updated_at", testimonialUpdatedAt)
      .select(
        "id, inquiry_id, service_category, rating, testimonial_text, display_name, published, published_at, created_at, updated_at",
      )
      .maybeSingle();

    if (error) {
      return jsonNoStore({ error: "Draft testimoni belum dapat disimpan." }, { status: 500 });
    }
    if (!data) {
      return jsonNoStore({ error: "Draft telah berubah. Muat ulang halaman." }, { status: 409 });
    }
    return jsonNoStore({ ok: true, testimonial: data });
  }

  const { data, error } = await auth.supabase
    .from("testimonials")
    .insert({
      inquiry_id: id,
      service_category: inquiry.service_category,
      ...validation.data,
    })
    .select(
      "id, inquiry_id, service_category, rating, testimonial_text, display_name, published, published_at, created_at, updated_at",
    )
    .single();

  if (error) {
    return jsonNoStore(
      {
        error:
          error.code === "23505"
            ? "Draft testimoni sudah dibuat di sesi lain. Muat ulang halaman."
            : "Draft testimoni belum dapat dibuat.",
      },
      { status: error.code === "23505" ? 409 : 500 },
    );
  }

  return jsonNoStore({ ok: true, testimonial: data }, { status: 201 });
}

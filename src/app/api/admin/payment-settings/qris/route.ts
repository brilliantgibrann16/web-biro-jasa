import { randomUUID } from "node:crypto";
import { getAdminAuthContext } from "@/lib/auth/admin";
import { readExpectedUpdatedAt } from "@/lib/admin-tracking/validation";
import {
  readBodyBytesWithLimit,
  RequestBodyTooLargeError,
} from "@/lib/server/request-body";
import { isSameOriginMutation, jsonNoStore } from "../../_utils";

export const runtime = "nodejs";

const MAX_QRIS_BYTES = 1_572_864;
const MAX_REQUEST_BYTES = 1_700_000;
const QRIS_BUCKET = "payment-assets";
const SUPPORTED_TYPES = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
]);

function matchesImageSignature(bytes: Uint8Array, mime: string): boolean {
  if (mime === "image/png") {
    return bytes.length >= 8 &&
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
      bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  }
  if (mime === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mime === "image/webp") {
    return bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  }
  return false;
}

async function loadCurrentSettings(
  auth: NonNullable<Awaited<ReturnType<typeof getAdminAuthContext>>>,
) {
  return auth.supabase
    .from("payment_settings")
    .select("qris_storage_path, updated_at")
    .eq("id", true)
    .maybeSingle();
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return jsonNoStore({ error: "Permintaan unggah tidak diizinkan." }, { status: 403 });
  }

  const auth = await getAdminAuthContext();
  if (!auth) {
    return jsonNoStore({ error: "Sesi admin tidak valid." }, { status: 401 });
  }

  let formData: FormData;
  try {
    const body = await readBodyBytesWithLimit(request, MAX_REQUEST_BYTES);
    const contentType = request.headers.get("content-type");
    if (!contentType?.toLowerCase().startsWith("multipart/form-data")) {
      return jsonNoStore({ error: "Berkas unggahan tidak valid." }, { status: 400 });
    }
    const bodyBuffer = new ArrayBuffer(body.byteLength);
    new Uint8Array(bodyBuffer).set(body);
    formData = await new Response(bodyBuffer, {
      headers: { "Content-Type": contentType },
    }).formData();
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return jsonNoStore({ error: "Ukuran QRIS maksimal 1,5 MB." }, { status: 413 });
    }
    return jsonNoStore({ error: "Berkas unggahan tidak valid." }, { status: 400 });
  }

  const file = formData.get("qris");
  const expectedUpdatedAt = readExpectedUpdatedAt({ updated_at: formData.get("updated_at") });
  if (!(file instanceof File) || !expectedUpdatedAt) {
    return jsonNoStore({ error: "Pilih gambar QRIS dan muat ulang halaman bila versi data tidak valid." }, { status: 400 });
  }

  const extension = SUPPORTED_TYPES.get(file.type);
  if (!extension || file.size < 1 || file.size > MAX_QRIS_BYTES) {
    return jsonNoStore({ error: "Gunakan PNG, JPEG, atau WebP dengan ukuran maksimal 1,5 MB." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!matchesImageSignature(bytes, file.type)) {
    return jsonNoStore({ error: "Isi berkas tidak sesuai dengan format gambar yang dipilih." }, { status: 400 });
  }

  const { data: current, error: currentError } = await loadCurrentSettings(auth);
  if (currentError) {
    return jsonNoStore({ error: "Pengaturan pembayaran belum dapat diperiksa." }, { status: 500 });
  }
  if (!current) {
    return jsonNoStore({ error: "Pengaturan pembayaran belum tersedia." }, { status: 404 });
  }
  if (current.updated_at !== expectedUpdatedAt) {
    return jsonNoStore(
      { error: "Pengaturan telah berubah. Muat data terbaru sebelum mengunggah QRIS." },
      { status: 409 },
    );
  }

  const nextPath = `qris/${randomUUID()}.${extension}`;
  const { error: uploadError } = await auth.supabase.storage
    .from(QRIS_BUCKET)
    .upload(nextPath, bytes, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return jsonNoStore({ error: "Gambar QRIS belum dapat diunggah." }, { status: 500 });
  }

  const { data: settings, error: updateError } = await auth.supabase
    .from("payment_settings")
    .update({ qris_storage_path: nextPath })
    .eq("id", true)
    .eq("updated_at", expectedUpdatedAt)
    .select("qris_storage_path, updated_at")
    .maybeSingle();

  if (updateError || !settings) {
    await auth.supabase.storage.from(QRIS_BUCKET).remove([nextPath]);
    return jsonNoStore(
      { error: updateError ? "QRIS belum dapat disimpan." : "Pengaturan telah berubah. Muat ulang lalu coba lagi." },
      { status: updateError ? 500 : 409 },
    );
  }

  if (current.qris_storage_path) {
    const { error: removeError } = await auth.supabase.storage
      .from(QRIS_BUCKET)
      .remove([current.qris_storage_path]);
    if (removeError) console.error("Previous QRIS cleanup failed", { message: removeError.message });
  }

  const publicUrl = auth.supabase.storage
    .from(QRIS_BUCKET)
    .getPublicUrl(nextPath).data.publicUrl;

  return jsonNoStore({
    ok: true,
    qris_storage_path: settings.qris_storage_path,
    qris_public_url: publicUrl,
    updated_at: settings.updated_at,
  });
}

export async function DELETE(request: Request) {
  if (!isSameOriginMutation(request)) {
    return jsonNoStore({ error: "Permintaan penghapusan tidak diizinkan." }, { status: 403 });
  }

  const auth = await getAdminAuthContext();
  if (!auth) {
    return jsonNoStore({ error: "Sesi admin tidak valid." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonNoStore({ error: "Data penghapusan tidak valid." }, { status: 400 });
  }

  const expectedUpdatedAt = readExpectedUpdatedAt(payload);
  if (!expectedUpdatedAt) {
    return jsonNoStore({ error: "Versi pengaturan tidak valid. Muat ulang halaman." }, { status: 400 });
  }

  const { data: current, error: currentError } = await loadCurrentSettings(auth);
  if (currentError) {
    return jsonNoStore({ error: "Pengaturan pembayaran belum dapat diperiksa." }, { status: 500 });
  }
  if (!current) {
    return jsonNoStore({ error: "Pengaturan pembayaran belum tersedia." }, { status: 404 });
  }
  if (current.updated_at !== expectedUpdatedAt) {
    return jsonNoStore({ error: "Pengaturan telah berubah. Muat ulang lalu coba lagi." }, { status: 409 });
  }

  const { data: settings, error } = await auth.supabase
    .from("payment_settings")
    .update({ qris_storage_path: null })
    .eq("id", true)
    .eq("updated_at", expectedUpdatedAt)
    .select("updated_at")
    .maybeSingle();

  if (error || !settings) {
    return jsonNoStore(
      { error: error ? "QRIS belum dapat dihapus." : "Pengaturan telah berubah. Muat ulang lalu coba lagi." },
      { status: error ? 500 : 409 },
    );
  }

  if (current.qris_storage_path) {
    const { error: removeError } = await auth.supabase.storage
      .from(QRIS_BUCKET)
      .remove([current.qris_storage_path]);
    if (removeError) console.error("QRIS storage cleanup failed", { message: removeError.message });
  }

  return jsonNoStore({ ok: true, qris_storage_path: null, qris_public_url: null, updated_at: settings.updated_at });
}

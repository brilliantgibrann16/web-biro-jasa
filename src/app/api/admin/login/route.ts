import { isAdminClaims } from "@/lib/auth/claims";
import { sanitizeAdminNext } from "@/lib/auth/paths";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSameOriginMutation, jsonNoStore } from "../_utils";

interface LoginPayload {
  email?: unknown;
  password?: unknown;
  next?: unknown;
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return jsonNoStore(
      { error: "Permintaan login tidak diizinkan." },
      { status: 403 },
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return jsonNoStore(
      { error: "Koneksi admin belum dikonfigurasi." },
      { status: 503 },
    );
  }

  let payload: LoginPayload;
  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    return jsonNoStore(
      { error: "Data login tidak valid." },
      { status: 400 },
    );
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const password =
    typeof payload.password === "string" ? payload.password : "";

  if (!email || email.length > 320 || !password || password.length > 1024) {
    return jsonNoStore(
      { error: "Email atau kata sandi tidak valid." },
      { status: 400 },
    );
  }

  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !signInData.session?.access_token) {
    return jsonNoStore(
      { error: "Email atau kata sandi tidak cocok." },
      { status: 401 },
    );
  }

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(
    signInData.session.access_token,
  );

  if (claimsError || !isAdminClaims(claimsData?.claims)) {
    await supabase.auth.signOut({ scope: "local" });
    return jsonNoStore(
      { error: "Akun tidak memiliki akses admin." },
      { status: 403 },
    );
  }

  return jsonNoStore({
    ok: true,
    next: sanitizeAdminNext(payload.next),
  });
}

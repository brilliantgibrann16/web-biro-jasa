import { isAdminClaims } from "@/lib/auth/claims";
import { sanitizeAdminNext } from "@/lib/auth/paths";
import {
  ADMIN_LOGIN_RATE_LIMIT,
  checkAdminLoginRateLimit,
} from "@/lib/server/rate-limit";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSameOriginMutation, jsonNoStore } from "../_utils";

interface LoginPayload {
  email?: unknown;
  password?: unknown;
  next?: unknown;
}

const MAX_LOGIN_BODY_BYTES = 4_096;

async function readLoginPayload(request: Request): Promise<LoginPayload> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_LOGIN_BODY_BYTES
  ) {
    throw new Error("payload-too-large");
  }

  if (!request.body) throw new Error("invalid-payload");

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let body = "";
  let receivedBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      receivedBytes += value.byteLength;
      if (receivedBytes > MAX_LOGIN_BODY_BYTES) {
        await reader.cancel();
        throw new Error("payload-too-large");
      }

      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
  } finally {
    reader.releaseLock();
  }

  const payload = JSON.parse(body) as unknown;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("invalid-payload");
  }

  return payload as LoginPayload;
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return jsonNoStore(
      { error: "Permintaan login tidak diizinkan." },
      { status: 403 },
    );
  }

  const rateLimit = checkAdminLoginRateLimit(request);
  if (!rateLimit.allowed) {
    return jsonNoStore(
      {
        error: "Terlalu banyak percobaan login. Coba lagi setelah jeda singkat.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
          "X-RateLimit-Limit": String(ADMIN_LOGIN_RATE_LIMIT.maxRequests),
          "X-RateLimit-Remaining": "0",
        },
      },
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
    payload = await readLoginPayload(request);
  } catch (error) {
    const payloadTooLarge =
      error instanceof Error && error.message === "payload-too-large";
    return jsonNoStore(
      {
        error: payloadTooLarge
          ? "Data login terlalu besar."
          : "Data login tidak valid.",
      },
      { status: payloadTooLarge ? 413 : 400 },
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

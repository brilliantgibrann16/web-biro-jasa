import { randomUUID } from "node:crypto";

const REQUEST_TIMEOUT_MS = 20_000;
const SAFE_TRACKING_KEYS = [
  "bank_account_holder",
  "bank_account_number",
  "bank_name",
  "inquiry_status",
  "payment_amount",
  "payment_instructions",
  "payment_required",
  "payment_status",
  "payment_timing",
  "qris_storage_path",
  "reference_code",
  "service_category",
  "service_detail",
  "updated_at",
  "verification_requested",
].sort();

class VerificationError extends Error {}

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new VerificationError(`environment variable ${name} belum diisi`);
  }
  return value;
}

function pass(message) {
  console.log(`[PASS] ${message}`);
}

function ensure(condition, message) {
  if (!condition) throw new VerificationError(message);
}

async function safeFetch(url, init) {
  try {
    return await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new VerificationError("permintaan ke Supabase gagal");
  }
}

async function parseJson(response, message) {
  try {
    return await response.json();
  } catch {
    throw new VerificationError(message);
  }
}

function isDenied(response) {
  return response.status === 401 || response.status === 403;
}

async function verifyNoDisclosure(response, operation) {
  if (isDenied(response)) {
    pass(`anon ${operation} ditolak`);
    return;
  }

  ensure(
    response.ok,
    `anon ${operation} memberi respons tak terduga (${response.status})`,
  );

  if (response.status === 204) {
    pass(`anon ${operation} tidak mengungkap data`);
    return;
  }

  const payload = await parseJson(
    response,
    `respons anon ${operation} tidak dapat divalidasi`,
  );
  ensure(
    Array.isArray(payload) && payload.length === 0,
    `anon ${operation} mengungkap atau memengaruhi data`,
  );
  pass(`anon ${operation} tidak mengungkap data`);
}

function rpcUrl(baseUrl, functionName) {
  return `${baseUrl}/rest/v1/rpc/${functionName}`;
}

async function callRpc(baseUrl, functionName, headers, body) {
  return safeFetch(rpcUrl(baseUrl, functionName), {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function main() {
  const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
  const publishableKey = requiredEnv(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
  const adminEmail = requiredEnv("SUPABASE_TEST_ADMIN_EMAIL");
  const adminPassword = requiredEnv("SUPABASE_TEST_ADMIN_PASSWORD");

  let parsedBaseUrl;
  try {
    parsedBaseUrl = new URL(supabaseUrl);
  } catch {
    throw new VerificationError("NEXT_PUBLIC_SUPABASE_URL tidak valid");
  }
  ensure(
    parsedBaseUrl.protocol === "https:" || parsedBaseUrl.hostname === "localhost",
    "NEXT_PUBLIC_SUPABASE_URL harus HTTPS atau localhost",
  );

  const authResponse = await safeFetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: publishableKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    },
  );
  ensure(authResponse.ok, `login admin pengujian gagal (${authResponse.status})`);
  const authPayload = await parseJson(
    authResponse,
    "respons login admin tidak dapat divalidasi",
  );
  const accessToken = authPayload?.access_token;
  ensure(
    typeof accessToken === "string" && accessToken.length > 0,
    "JWT admin tidak diterima",
  );

  let jwtClaims;
  try {
    const encodedClaims = accessToken.split(".")[1];
    ensure(Boolean(encodedClaims), "JWT admin tidak valid");
    jwtClaims = JSON.parse(
      Buffer.from(encodedClaims, "base64url").toString("utf8"),
    );
  } catch (error) {
    if (error instanceof VerificationError) throw error;
    throw new VerificationError("claim JWT admin tidak dapat divalidasi");
  }
  ensure(
    jwtClaims?.app_metadata?.role === "admin",
    "JWT pengujian tidak memiliki app_metadata.role=admin",
  );
  pass("login dan claim admin pengujian");

  const anonHeaders = {
    apikey: publishableKey,
    Accept: "application/json",
  };
  const adminHeaders = {
    apikey: publishableKey,
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
  };
  const inquiryTableUrl = `${supabaseUrl}/rest/v1/inquiries`;
  const testimonialTableUrl = `${supabaseUrl}/rest/v1/testimonials`;
  const paymentSettingsUrl = `${supabaseUrl}/rest/v1/payment_settings`;
  const runId = randomUUID().replaceAll("-", "").toUpperCase();
  const fixturePhone = `+62899${Date.now().toString().slice(-9)}`;
  const fixtureMarker = `security-verification-${runId.slice(0, 12)}`;
  const fixture = {
    p_full_name: "Security Verification Fixture",
    p_phone: fixturePhone,
    p_service_category: "dokumen-kendaraan",
    p_service_detail: "Perpanjangan STNK",
    p_region: "Wilayah Uji",
    p_notes: fixtureMarker,
  };

  let inquiryId;
  let testimonialId;
  let primaryError;

  try {
    const submitResponse = await callRpc(
      supabaseUrl,
      "submit_public_inquiry",
      anonHeaders,
      fixture,
    );
    ensure(
      submitResponse.ok,
      `RPC submit inquiry gagal (${submitResponse.status})`,
    );
    const referenceCode = await parseJson(
      submitResponse,
      "respons RPC submit inquiry tidak valid",
    );
    ensure(
      typeof referenceCode === "string" &&
        /^TS-[0-9]{4}-[0-9A-F]{10}$/.test(referenceCode),
      "RPC submit tidak mengembalikan kode referensi yang aman",
    );
    pass("RPC submit hanya mengembalikan kode referensi berformat aman");

    const forbiddenInsertResponse = await safeFetch(inquiryTableUrl, {
      method: "POST",
      headers: {
        ...anonHeaders,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        full_name: "Forbidden Direct Insert",
        phone: `${fixturePhone}9`,
        service_category: "dokumen-kendaraan",
      }),
    });
    ensure(
      isDenied(forbiddenInsertResponse),
      `anon direct INSERT tidak ditolak (${forbiddenInsertResponse.status})`,
    );
    pass("anon direct INSERT ditolak; pencatatan hanya melalui RPC sempit");

    const adminInquiryUrl = new URL(inquiryTableUrl);
    adminInquiryUrl.searchParams.set("reference_code", `eq.${referenceCode}`);
    adminInquiryUrl.searchParams.set(
      "select",
      "id,status,reference_code,source,notes,handled_note,payment_status,payment_confirmation_requested_at,payment_verified_at",
    );
    const adminInquiryResponse = await safeFetch(adminInquiryUrl, {
      headers: adminHeaders,
    });
    ensure(
      adminInquiryResponse.ok,
      `admin tidak dapat membaca fixture (${adminInquiryResponse.status})`,
    );
    const adminInquiryRows = await parseJson(
      adminInquiryResponse,
      "respons fixture admin tidak valid",
    );
    ensure(
      Array.isArray(adminInquiryRows) && adminInquiryRows.length === 1,
      "fixture inquiry tidak ditemukan secara unik",
    );
    const adminInquiry = adminInquiryRows[0];
    inquiryId = adminInquiry?.id;
    ensure(
      typeof inquiryId === "string" &&
        adminInquiry.status === "baru" &&
        adminInquiry.source === "website-form" &&
        adminInquiry.notes === fixtureMarker &&
        adminInquiry.handled_note === null,
      "default atau data fixture inquiry tidak sesuai",
    );
    pass("admin dapat menemukan inquiry lewat kode referensi");

    const anonSelectUrl = new URL(inquiryTableUrl);
    anonSelectUrl.searchParams.set("reference_code", `eq.${referenceCode}`);
    anonSelectUrl.searchParams.set("select", "id,phone,handled_note");
    await verifyNoDisclosure(
      await safeFetch(anonSelectUrl, { headers: anonHeaders }),
      "SELECT inquiries",
    );

    const fixtureByIdUrl = new URL(inquiryTableUrl);
    fixtureByIdUrl.searchParams.set("id", `eq.${inquiryId}`);
    const paymentUpdateResponse = await safeFetch(fixtureByIdUrl, {
      method: "PATCH",
      headers: {
        ...adminHeaders,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        payment_required: true,
        payment_amount: 275000,
        payment_timing: "sebelum-proses",
        payment_status: "menunggu-pembayaran",
      }),
    });
    ensure(
      paymentUpdateResponse.ok,
      `admin gagal mengatur koordinasi pembayaran (${paymentUpdateResponse.status})`,
    );

    const trackingResponse = await callRpc(
      supabaseUrl,
      "get_inquiry_tracking",
      anonHeaders,
      { p_reference_code: referenceCode.toLowerCase() },
    );
    ensure(
      trackingResponse.ok,
      `tracking kode valid gagal (${trackingResponse.status})`,
    );
    const trackingRows = await parseJson(
      trackingResponse,
      "respons tracking tidak valid",
    );
    ensure(
      Array.isArray(trackingRows) && trackingRows.length === 1,
      "tracking kode valid tidak mengembalikan tepat satu hasil",
    );
    const trackingRow = trackingRows[0];
    ensure(
      JSON.stringify(Object.keys(trackingRow).sort()) ===
        JSON.stringify(SAFE_TRACKING_KEYS),
      "RPC tracking mengembalikan field di luar kontrak aman",
    );
    ensure(
      trackingRow.reference_code === referenceCode &&
        trackingRow.payment_amount === 275000 &&
        trackingRow.payment_status === "menunggu-pembayaran",
      "tracking tidak mengembalikan status koordinasi yang benar",
    );
    ensure(
      !("id" in trackingRow) &&
        !("phone" in trackingRow) &&
        !("handled_note" in trackingRow) &&
        !("notes" in trackingRow),
      "tracking membocorkan field privat",
    );
    pass("tracking kode valid hanya mengembalikan subset field aman");

    for (const [label, wrongCode] of [
      ["format salah", "kode-salah"],
      ["kode tidak ditemukan", `TS-0000-${runId.slice(0, 10)}`],
    ]) {
      const wrongResponse = await callRpc(
        supabaseUrl,
        "get_inquiry_tracking",
        anonHeaders,
        { p_reference_code: wrongCode },
      );
      ensure(
        wrongResponse.ok,
        `${label} membocorkan perbedaan lewat status HTTP (${wrongResponse.status})`,
      );
      const wrongRows = await parseJson(
        wrongResponse,
        `respons ${label} tidak valid`,
      );
      ensure(
        Array.isArray(wrongRows) && wrongRows.length === 0,
        `${label} mengungkap informasi inquiry`,
      );
    }
    pass("kode malformed dan tidak ditemukan sama-sama menghasilkan data kosong");

    const requestVerification = async () => {
      const response = await callRpc(
        supabaseUrl,
        "request_payment_verification",
        anonHeaders,
        { p_reference_code: referenceCode },
      );
      ensure(
        response.ok,
        `permintaan verifikasi transfer gagal (${response.status})`,
      );
      return parseJson(response, "respons permintaan verifikasi tidak valid");
    };
    ensure((await requestVerification()) === true, "permintaan verifikasi ditolak");
    ensure(
      (await requestVerification()) === true,
      "permintaan verifikasi ulang tidak idempotent",
    );

    const paymentCheckUrl = new URL(fixtureByIdUrl);
    paymentCheckUrl.searchParams.set(
      "select",
      "payment_status,payment_confirmation_requested_at,payment_verified_at",
    );
    const paymentCheckResponse = await safeFetch(paymentCheckUrl, {
      headers: adminHeaders,
    });
    const paymentCheckRows = await parseJson(
      paymentCheckResponse,
      "respons status pembayaran tidak valid",
    );
    ensure(
      paymentCheckResponse.ok &&
        paymentCheckRows?.[0]?.payment_status === "menunggu-verifikasi" &&
        typeof paymentCheckRows?.[0]?.payment_confirmation_requested_at ===
          "string" &&
        paymentCheckRows?.[0]?.payment_verified_at === null,
      "laporan transfer menandai pembayaran lunas atau tidak tercatat benar",
    );
    pass("laporan transfer hanya meminta verifikasi manual, tidak menandai lunas");

    const settingsSelectUrl = new URL(paymentSettingsUrl);
    settingsSelectUrl.searchParams.set("select", "*");
    await verifyNoDisclosure(
      await safeFetch(settingsSelectUrl, { headers: anonHeaders }),
      "SELECT payment_settings",
    );

    const eligibilityResponse = await safeFetch(fixtureByIdUrl, {
      method: "PATCH",
      headers: {
        ...adminHeaders,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ testimonial_eligible_at: new Date().toISOString() }),
    });
    ensure(
      eligibilityResponse.ok,
      `admin gagal menandai inquiry layak testimoni (${eligibilityResponse.status})`,
    );

    const draftResponse = await safeFetch(testimonialTableUrl, {
      method: "POST",
      headers: {
        ...adminHeaders,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        inquiry_id: inquiryId,
        rating: 5,
        testimonial_text: `Testimoni fixture ${runId.slice(0, 8)}`,
        display_name: "Pelanggan Uji",
      }),
    });
    ensure(
      draftResponse.ok,
      `admin gagal membuat draft testimoni (${draftResponse.status})`,
    );
    const draftRows = await parseJson(
      draftResponse,
      "respons draft testimoni tidak valid",
    );
    testimonialId = draftRows?.[0]?.id;
    ensure(
      typeof testimonialId === "string" && draftRows[0]?.published === false,
      "testimoni baru tidak tersimpan sebagai draft",
    );

    const safeTestimonialUrl = new URL(testimonialTableUrl);
    safeTestimonialUrl.searchParams.set("id", `eq.${testimonialId}`);
    safeTestimonialUrl.searchParams.set(
      "select",
      "id,service_category,rating,testimonial_text,display_name,published_at",
    );
    const hiddenDraftResponse = await safeFetch(safeTestimonialUrl, {
      headers: anonHeaders,
    });
    ensure(hiddenDraftResponse.ok, "query aman testimoni draft gagal");
    const hiddenDraftRows = await parseJson(
      hiddenDraftResponse,
      "respons testimoni draft tidak valid",
    );
    ensure(
      Array.isArray(hiddenDraftRows) && hiddenDraftRows.length === 0,
      "draft testimoni terlihat oleh anon",
    );
    pass("draft testimoni tersembunyi dari publik");

    const protectedColumnUrl = new URL(testimonialTableUrl);
    protectedColumnUrl.searchParams.set("id", `eq.${testimonialId}`);
    protectedColumnUrl.searchParams.set("select", "inquiry_id");
    const protectedColumnResponse = await safeFetch(protectedColumnUrl, {
      headers: anonHeaders,
    });
    ensure(
      isDenied(protectedColumnResponse),
      `anon dapat meminta inquiry_id testimoni (${protectedColumnResponse.status})`,
    );
    pass("inquiry_id testimoni diblokir pada level privilege kolom");

    const testimonialByIdUrl = new URL(testimonialTableUrl);
    testimonialByIdUrl.searchParams.set("id", `eq.${testimonialId}`);
    const publishResponse = await safeFetch(testimonialByIdUrl, {
      method: "PATCH",
      headers: {
        ...adminHeaders,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ published: true }),
    });
    ensure(
      publishResponse.ok,
      `admin gagal mempublikasikan testimoni (${publishResponse.status})`,
    );

    const publishedResponse = await safeFetch(safeTestimonialUrl, {
      headers: anonHeaders,
    });
    ensure(publishedResponse.ok, "query testimoni published gagal");
    const publishedRows = await parseJson(
      publishedResponse,
      "respons testimoni published tidak valid",
    );
    ensure(
      Array.isArray(publishedRows) &&
        publishedRows.length === 1 &&
        publishedRows[0]?.display_name === "Pelanggan Uji" &&
        typeof publishedRows[0]?.published_at === "string",
      "testimoni published tidak tampil melalui kontrak aman",
    );
    pass("hanya testimoni published yang terlihat melalui kolom publik");
  } catch (error) {
    primaryError = error;
  } finally {
    if (testimonialId) {
      try {
        const cleanupUrl = new URL(testimonialTableUrl);
        cleanupUrl.searchParams.set("id", `eq.${testimonialId}`);
        const cleanupResponse = await safeFetch(cleanupUrl, {
          method: "DELETE",
          headers: { ...adminHeaders, Prefer: "return=minimal" },
        });
        ensure(cleanupResponse.ok, "cleanup testimoni gagal");
      } catch (cleanupError) {
        if (!primaryError) primaryError = cleanupError;
      }
    }

    if (inquiryId) {
      try {
        const cleanupUrl = new URL(inquiryTableUrl);
        cleanupUrl.searchParams.set("id", `eq.${inquiryId}`);
        const cleanupResponse = await safeFetch(cleanupUrl, {
          method: "DELETE",
          headers: { ...adminHeaders, Prefer: "return=minimal" },
        });
        ensure(cleanupResponse.ok, "cleanup inquiry gagal");
      } catch (cleanupError) {
        if (!primaryError) primaryError = cleanupError;
      }
    }
  }

  if (primaryError) throw primaryError;
  console.log("[PASS] seluruh verifikasi live Supabase lulus");
}

main().catch((error) => {
  const message =
    error instanceof VerificationError
      ? error.message
      : "verifier berhenti karena error tak terduga";
  console.error(`[FAIL] ${message}`);
  process.exitCode = 1;
});

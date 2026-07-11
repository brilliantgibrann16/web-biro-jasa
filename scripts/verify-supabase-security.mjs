import { randomUUID } from "node:crypto";

const REQUEST_TIMEOUT_MS = 20_000;
const TABLE_NAME = "inquiries";

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
  ensure(
    authResponse.ok,
    `login admin pengujian gagal (${authResponse.status})`,
  );
  const authPayload = await parseJson(
    authResponse,
    "respons login admin tidak dapat divalidasi",
  );
  const accessToken = authPayload?.access_token;
  ensure(typeof accessToken === "string" && accessToken.length > 0, "JWT admin tidak diterima");

  let jwtClaims;
  try {
    const encodedClaims = accessToken.split(".")[1];
    ensure(Boolean(encodedClaims), "JWT admin tidak valid");
    jwtClaims = JSON.parse(Buffer.from(encodedClaims, "base64url").toString("utf8"));
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

  const restUrl = new URL(`${supabaseUrl}/rest/v1/${TABLE_NAME}`);
  const runId = randomUUID().replaceAll("-", "").slice(0, 16);
  const fixturePhone = `+62899${Date.now().toString().slice(-9)}${runId.slice(0, 4)}`;
  const fixtureMarker = `security-verification-${runId}`;
  const anonMutationMarker = `anon-update-attempt-${runId}`;
  const adminNoteMarker = `admin-security-verification-${runId}`;
  const fixture = {
    full_name: "Security Verification Fixture",
    phone: fixturePhone,
    service_category: "dokumen-kendaraan",
    service_detail: "Perpanjangan STNK",
    region: "Wilayah Uji",
    notes: fixtureMarker,
  };

  const fixtureQueryUrl = () => {
    const url = new URL(restUrl);
    url.searchParams.set("phone", `eq.${fixturePhone}`);
    return url;
  };

  let fixtureMayExist = false;
  let primaryError;

  try {
    fixtureMayExist = true;
    const insertResponse = await safeFetch(restUrl, {
      method: "POST",
      headers: {
        ...anonHeaders,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(fixture),
    });
    ensure(
      insertResponse.ok,
      `anon INSERT gagal (${insertResponse.status})`,
    );
    pass("anon INSERT fixture valid");

    const forbiddenStatusResponse = await safeFetch(restUrl, {
      method: "POST",
      headers: {
        ...anonHeaders,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ ...fixture, status: "selesai" }),
    });
    ensure(
      isDenied(forbiddenStatusResponse),
      `anon INSERT status terlarang tidak ditolak (${forbiddenStatusResponse.status})`,
    );
    pass("anon tidak dapat menulis status");

    const forbiddenHandledNoteResponse = await safeFetch(restUrl, {
      method: "POST",
      headers: {
        ...anonHeaders,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        ...fixture,
        handled_note: "forbidden-internal-note",
      }),
    });
    ensure(
      isDenied(forbiddenHandledNoteResponse),
      `anon INSERT handled_note terlarang tidak ditolak (${forbiddenHandledNoteResponse.status})`,
    );
    pass("anon tidak dapat menulis handled_note");

    const anonSelectUrl = fixtureQueryUrl();
    anonSelectUrl.searchParams.set("select", "id,status,notes,handled_note");
    const anonSelectResponse = await safeFetch(anonSelectUrl, {
      headers: anonHeaders,
    });
    await verifyNoDisclosure(anonSelectResponse, "SELECT");

    const anonUpdateResponse = await safeFetch(fixtureQueryUrl(), {
      method: "PATCH",
      headers: {
        ...anonHeaders,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ notes: anonMutationMarker }),
    });
    await verifyNoDisclosure(anonUpdateResponse, "UPDATE");

    const anonDeleteResponse = await safeFetch(fixtureQueryUrl(), {
      method: "DELETE",
      headers: {
        ...anonHeaders,
        Prefer: "return=representation",
      },
    });
    await verifyNoDisclosure(anonDeleteResponse, "DELETE");

    const adminSelectUrl = fixtureQueryUrl();
    adminSelectUrl.searchParams.set(
      "select",
      "id,status,source,notes,handled_note",
    );
    const adminSelectResponse = await safeFetch(adminSelectUrl, {
      headers: adminHeaders,
    });
    ensure(
      adminSelectResponse.ok,
      `authenticated SELECT gagal (${adminSelectResponse.status})`,
    );
    const selectedRows = await parseJson(
      adminSelectResponse,
      "respons authenticated SELECT tidak dapat divalidasi",
    );
    ensure(
      Array.isArray(selectedRows) && selectedRows.length === 1,
      "fixture hilang atau tidak unik setelah percobaan anon",
    );
    const selectedFixture = selectedRows[0];
    ensure(
      typeof selectedFixture?.id === "string" &&
        selectedFixture.status === "baru" &&
        selectedFixture.source === "website-form" &&
        selectedFixture.notes === fixtureMarker &&
        selectedFixture.handled_note === null,
      "anon UPDATE/DELETE memengaruhi fixture atau default database tidak sesuai",
    );
    pass("authenticated SELECT dan integritas fixture");

    const fixtureByIdUrl = new URL(restUrl);
    fixtureByIdUrl.searchParams.set("id", `eq.${selectedFixture.id}`);
    const adminUpdateResponse = await safeFetch(fixtureByIdUrl, {
      method: "PATCH",
      headers: {
        ...adminHeaders,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        status: "diproses",
        handled_note: adminNoteMarker,
      }),
    });
    ensure(
      adminUpdateResponse.ok,
      `authenticated UPDATE gagal (${adminUpdateResponse.status})`,
    );

    const updatedSelectUrl = new URL(fixtureByIdUrl);
    updatedSelectUrl.searchParams.set("select", "id,status,handled_note");
    const updatedSelectResponse = await safeFetch(updatedSelectUrl, {
      headers: adminHeaders,
    });
    ensure(
      updatedSelectResponse.ok,
      `verifikasi authenticated UPDATE gagal (${updatedSelectResponse.status})`,
    );
    const updatedRows = await parseJson(
      updatedSelectResponse,
      "respons verifikasi authenticated UPDATE tidak valid",
    );
    ensure(
      Array.isArray(updatedRows) &&
        updatedRows.length === 1 &&
        updatedRows[0]?.status === "diproses" &&
        updatedRows[0]?.handled_note === adminNoteMarker,
      "authenticated UPDATE tidak tersimpan",
    );
    pass("authenticated UPDATE");

    const adminDeleteResponse = await safeFetch(fixtureByIdUrl, {
      method: "DELETE",
      headers: {
        ...adminHeaders,
        Prefer: "return=minimal",
      },
    });
    ensure(
      adminDeleteResponse.ok,
      `authenticated DELETE gagal (${adminDeleteResponse.status})`,
    );

    const deletedSelectUrl = new URL(fixtureByIdUrl);
    deletedSelectUrl.searchParams.set("select", "id");
    const deletedSelectResponse = await safeFetch(deletedSelectUrl, {
      headers: adminHeaders,
    });
    ensure(
      deletedSelectResponse.ok,
      `verifikasi authenticated DELETE gagal (${deletedSelectResponse.status})`,
    );
    const deletedRows = await parseJson(
      deletedSelectResponse,
      "respons verifikasi authenticated DELETE tidak valid",
    );
    ensure(
      Array.isArray(deletedRows) && deletedRows.length === 0,
      "authenticated DELETE tidak menghapus fixture",
    );
    fixtureMayExist = false;
    pass("authenticated DELETE dan cleanup");
  } catch (error) {
    primaryError = error;
  } finally {
    if (fixtureMayExist) {
      try {
        const cleanupResponse = await safeFetch(fixtureQueryUrl(), {
          method: "DELETE",
          headers: {
            ...adminHeaders,
            Prefer: "return=minimal",
          },
        });
        ensure(
          cleanupResponse.ok,
          `cleanup fixture gagal (${cleanupResponse.status})`,
        );
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

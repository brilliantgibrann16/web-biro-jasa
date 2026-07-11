import { getAdminAuthContext } from "@/lib/auth/admin";
import { isSameOriginMutation, jsonNoStore } from "../_utils";

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return jsonNoStore(
      { error: "Permintaan keluar tidak diizinkan." },
      { status: 403 },
    );
  }

  const context = await getAdminAuthContext();
  if (!context) {
    return jsonNoStore(
      { error: "Sesi admin tidak valid." },
      { status: 401 },
    );
  }

  const { error } = await context.supabase.auth.signOut({ scope: "local" });
  if (error) {
    return jsonNoStore(
      { error: "Sesi belum dapat diakhiri. Coba lagi." },
      { status: 500 },
    );
  }

  return jsonNoStore({ ok: true });
}

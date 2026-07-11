import { type NextRequest, NextResponse } from "next/server";
import { isAdminClaims } from "@/lib/auth/claims";
import { sanitizeAdminNext } from "@/lib/auth/paths";
import {
  copyResponseCookies,
  updateSupabaseSession,
} from "@/lib/supabase/proxy";

const ADMIN_LOGIN_PATH = "/admin/login";
const ADMIN_LOGIN_API_PATH = "/api/admin/login";

export async function proxy(request: NextRequest) {
  const { response, claims, configured } =
    await updateSupabaseSession(request);
  const pathname = request.nextUrl.pathname;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isLoginPage = pathname === ADMIN_LOGIN_PATH;
  const isLoginApi = pathname === ADMIN_LOGIN_API_PATH;
  const isAdmin = isAdminClaims(claims);

  if ((!configured || !isAdmin) && isAdminPage && !isLoginPage) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    loginUrl.searchParams.set(
      "next",
      sanitizeAdminNext(`${pathname}${request.nextUrl.search}`),
    );
    return copyResponseCookies(
      response,
      NextResponse.redirect(loginUrl),
    );
  }

  if ((!configured || !isAdmin) && isAdminApi && !isLoginApi) {
    return copyResponseCookies(
      response,
      NextResponse.json(
        { error: "Sesi admin tidak valid." },
        { status: 401 },
      ),
    );
  }

  if (configured && isAdmin && isLoginPage) {
    return copyResponseCookies(
      response,
      NextResponse.redirect(new URL("/admin", request.url)),
    );
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

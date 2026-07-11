import "server-only";

import { redirect } from "next/navigation";
import { isAdminClaims } from "@/lib/auth/claims";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAdminAuthContext() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getClaims();
  const claims = error ? null : data?.claims ?? null;
  if (!isAdminClaims(claims)) return null;

  return { supabase, claims };
}

export async function requireAdminAuth() {
  const context = await getAdminAuthContext();
  if (!context) redirect("/admin/login");
  return context;
}

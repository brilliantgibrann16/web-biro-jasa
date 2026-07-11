import "server-only";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAdminAuthContext() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getClaims();
  const claims = error ? null : data?.claims ?? null;
  if (!claims?.sub) return null;

  return { supabase, claims };
}

export async function requireAdminAuth() {
  const context = await getAdminAuthContext();
  if (!context) redirect("/admin/login");
  return context;
}

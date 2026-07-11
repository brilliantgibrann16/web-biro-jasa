import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import LoginForm from "@/components/admin/LoginForm";
import { getAdminAuthContext } from "@/lib/auth/admin";
import { sanitizeAdminNext } from "@/lib/auth/paths";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const query = await searchParams;
  const nextPath = sanitizeAdminNext(firstValue(query.next));
  const auth = await getAdminAuthContext();
  if (auth) redirect(nextPath);

  return (
    <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-paper p-6 shadow-soft sm:p-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary-dark">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-6 text-[0.68rem] font-black uppercase tracking-[0.18em] text-primary-dark">
          Akses internal
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-accent">
          Masuk ke ruang admin
        </h1>
        <p className="mt-4 text-sm leading-7 text-neutral-600">
          Gunakan akun yang dibuat manual oleh pengelola. Area ini tidak
          menyediakan pendaftaran akun publik.
        </p>

        <LoginForm
          nextPath={nextPath}
          configured={isSupabaseConfigured()}
        />
      </div>
    </section>
  );
}

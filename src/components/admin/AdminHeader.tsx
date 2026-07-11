import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminHeader({ userEmail }: { userEmail?: string }) {
  return (
    <header className="border-b border-neutral-200 bg-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
        <Link href="/admin" className="min-w-0">
          <span className="block text-[0.64rem] font-black uppercase tracking-[0.18em] text-primary-dark">
            Biro Jasa Tiga Saudara
          </span>
          <span className="mt-1 block text-lg font-extrabold text-accent">
            Ruang admin
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          {userEmail ? (
            <p className="hidden max-w-64 truncate text-sm text-neutral-600 sm:block">
              {userEmail}
            </p>
          ) : null}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

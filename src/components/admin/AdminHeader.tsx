import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";
import { ThemeToggle } from "@/lib/theme";

export default function AdminHeader({ userEmail }: { userEmail?: string }) {
  return (
    <header className="border-b border-neutral-200 bg-paper">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-5 gap-y-4 px-5 py-4 sm:px-8">
        <Link href="/admin" className="min-w-0 shrink-0">
          <span className="block text-[0.64rem] font-black uppercase tracking-[0.18em] text-primary-dark">
            Biro Jasa Tiga Saudara
          </span>
          <span className="mt-1 block text-lg font-extrabold text-accent">
            Ruang admin
          </span>
        </Link>

        <nav
          className="order-last flex w-full gap-2 overflow-x-auto border-t border-neutral-200 pt-3 md:order-none md:w-auto md:border-0 md:pt-0"
          aria-label="Navigasi admin"
        >
          <Link
            href="/admin"
            className="inline-flex min-h-10 shrink-0 items-center rounded-lg border border-neutral-300 bg-surface px-3 text-sm font-bold text-accent hover:border-primary hover:text-primary-dark"
          >
            Inquiry
          </Link>
          <Link
            href="/admin/pengaturan-pembayaran"
            className="inline-flex min-h-10 shrink-0 items-center rounded-lg border border-neutral-300 bg-surface px-3 text-sm font-bold text-accent hover:border-primary hover:text-primary-dark"
          >
            Pengaturan pembayaran
          </Link>
        </nav>

        <div className="flex items-center gap-3 sm:gap-5">
          {userEmail ? (
            <p className="hidden max-w-64 truncate text-sm text-neutral-600 sm:block">
              {userEmail}
            </p>
          ) : null}
          <ThemeToggle className="text-accent" />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

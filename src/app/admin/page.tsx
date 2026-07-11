import Link from "next/link";
import { Filter, Inbox, Search } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireAdminAuth } from "@/lib/auth/admin";
import { SERVICE_CATEGORIES, type ServiceCategoryId } from "@/lib/constants";
import {
  INQUIRY_STATUSES,
  INQUIRY_STATUS_LABELS,
  SERVICE_CATEGORY_LABELS,
  isInquiryStatus,
  isServiceCategoryId,
  type InquiryStatus,
} from "@/lib/inquiries/constants";

export const dynamic = "force-dynamic";

interface DashboardSearchParams {
  status?: string | string[];
  category?: string | string[];
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Waktu tidak tersedia" : dateFormatter.format(date);
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const { supabase, claims } = await requireAdminAuth();
  const query = await searchParams;
  const rawStatus = firstValue(query.status);
  const rawCategory = firstValue(query.category);
  const status: InquiryStatus | undefined = isInquiryStatus(rawStatus)
    ? rawStatus
    : undefined;
  const category: ServiceCategoryId | undefined = isServiceCategoryId(
    rawCategory,
  )
    ? rawCategory
    : undefined;

  let inquiryQuery = supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) inquiryQuery = inquiryQuery.eq("status", status);
  if (category) {
    inquiryQuery = inquiryQuery.eq("service_category", category);
  }

  const { data: inquiries, error } = await inquiryQuery;
  const hasFilters = Boolean(status || category);
  const userEmail = typeof claims.email === "string" ? claims.email : undefined;

  return (
    <>
      <AdminHeader userEmail={userEmail} />
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-primary-dark">
              Inquiry masuk
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-accent sm:text-4xl">
              Daftar kebutuhan pelanggan
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600">
              Urutan dimulai dari inquiry terbaru. Gunakan filter untuk
              memusatkan perhatian pada status atau kategori tertentu.
            </p>
          </div>
          {!error ? (
            <p className="text-sm font-bold text-neutral-600" aria-live="polite">
              {inquiries?.length ?? 0} inquiry ditampilkan
            </p>
          ) : null}
        </div>

        <form
          action="/admin"
          method="get"
          className="mt-8 grid gap-4 rounded-xl border border-neutral-200 bg-paper p-4 shadow-soft sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end sm:p-5"
        >
          <div>
            <label htmlFor="status-filter" className="text-sm font-bold text-accent">
              Status
            </label>
            <select
              id="status-filter"
              name="status"
              defaultValue={status ?? ""}
              className="mt-2 min-h-11 w-full rounded-lg border border-neutral-300 bg-surface px-3 text-sm text-accent"
            >
              <option value="">Semua status</option>
              {INQUIRY_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {INQUIRY_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="category-filter"
              className="text-sm font-bold text-accent"
            >
              Kategori layanan
            </label>
            <select
              id="category-filter"
              name="category"
              defaultValue={category ?? ""}
              className="mt-2 min-h-11 w-full rounded-lg border border-neutral-300 bg-surface px-3 text-sm text-accent"
            >
              <option value="">Semua kategori</option>
              {SERVICE_CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-extrabold text-white hover:bg-primary-dark sm:flex-none"
            >
              <Filter className="h-4 w-4" aria-hidden="true" />
              Terapkan
            </button>
            {hasFilters ? (
              <Link
                href="/admin"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-neutral-300 bg-surface px-4 text-sm font-bold text-accent hover:border-primary"
              >
                Reset
              </Link>
            ) : null}
          </div>
        </form>

        {error ? (
          <div
            className="mt-8 rounded-xl border border-red-300 bg-red-50 p-6 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-100"
            role="alert"
          >
            <h2 className="font-display text-xl font-semibold">
              Data belum dapat dimuat
            </h2>
            <p className="mt-2 text-sm leading-7">
              Periksa koneksi Supabase lalu muat ulang halaman ini.
            </p>
          </div>
        ) : inquiries && inquiries.length > 0 ? (
          <div className="mt-8 overflow-hidden rounded-xl border border-neutral-200 bg-paper shadow-soft">
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">
                  Daftar inquiry pelanggan, diurutkan dari yang terbaru
                </caption>
                <thead className="border-b border-neutral-200 bg-warm-100">
                  <tr className="text-[0.66rem] font-black uppercase tracking-[0.13em] text-neutral-600">
                    <th scope="col" className="px-5 py-4">Masuk</th>
                    <th scope="col" className="px-5 py-4">Pelanggan</th>
                    <th scope="col" className="px-5 py-4">Kebutuhan</th>
                    <th scope="col" className="px-5 py-4">Wilayah</th>
                    <th scope="col" className="px-5 py-4">Status</th>
                    <th scope="col" className="px-5 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="align-top hover:bg-warm-50">
                      <td className="whitespace-nowrap px-5 py-5 text-sm text-neutral-600">
                        {formatDate(inquiry.created_at)}
                      </td>
                      <td className="px-5 py-5">
                        <p className="font-extrabold text-accent">{inquiry.full_name}</p>
                        <a
                          href={`tel:${inquiry.phone.replace(/[^+\d]/g, "")}`}
                          className="mt-1 inline-block text-sm text-neutral-600 hover:text-primary-dark"
                        >
                          {inquiry.phone}
                        </a>
                      </td>
                      <td className="max-w-xs px-5 py-5">
                        <p className="text-sm font-bold text-accent">
                          {SERVICE_CATEGORY_LABELS[inquiry.service_category]}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-neutral-600">
                          {inquiry.service_detail || "Belum dirinci"}
                        </p>
                      </td>
                      <td className="max-w-48 px-5 py-5 text-sm leading-6 text-neutral-600">
                        {inquiry.region || "Belum diisi"}
                      </td>
                      <td className="px-5 py-5">
                        <StatusBadge status={inquiry.status} />
                      </td>
                      <td className="px-5 py-5 text-right">
                        <Link
                          href={`/admin/inquiries/${inquiry.id}`}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-surface px-3 text-sm font-bold text-accent hover:border-primary hover:text-primary-dark"
                          aria-label={`Buka inquiry dari ${inquiry.full_name}`}
                        >
                          <Search className="h-4 w-4" aria-hidden="true" />
                          Buka
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-neutral-200 lg:hidden">
              {inquiries.map((inquiry) => (
                <article key={inquiry.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-extrabold text-accent">{inquiry.full_name}</p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {formatDate(inquiry.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={inquiry.status} />
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm">
                    <div>
                      <dt className="font-bold text-neutral-500">Kategori</dt>
                      <dd className="mt-1 text-accent">
                        {SERVICE_CATEGORY_LABELS[inquiry.service_category]}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-bold text-neutral-500">Detail</dt>
                      <dd className="mt-1 text-accent">
                        {inquiry.service_detail || "Belum dirinci"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-bold text-neutral-500">Wilayah</dt>
                      <dd className="mt-1 text-accent">
                        {inquiry.region || "Belum diisi"}
                      </dd>
                    </div>
                  </dl>
                  <Link
                    href={`/admin/inquiries/${inquiry.id}`}
                    className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-surface px-4 text-sm font-extrabold text-accent hover:border-primary hover:text-primary-dark"
                  >
                    <Search className="h-4 w-4" aria-hidden="true" />
                    Buka detail
                  </Link>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-paper px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warm-100 text-neutral-600">
              <Inbox className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-accent">
              {hasFilters
                ? "Tidak ada inquiry untuk filter ini"
                : "Belum ada inquiry masuk"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-neutral-600">
              {hasFilters
                ? "Ubah atau hapus filter untuk melihat inquiry lainnya."
                : "Inquiry yang dikirim dari formulir kontak akan muncul di sini."}
            </p>
            {hasFilters ? (
              <Link
                href="/admin"
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-neutral-300 bg-surface px-4 text-sm font-bold text-accent hover:border-primary"
              >
                Tampilkan semua inquiry
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}

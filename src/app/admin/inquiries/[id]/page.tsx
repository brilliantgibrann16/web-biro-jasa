import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  MessageCircle,
  Phone,
  RefreshCw,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import InquiryUpdateForm from "@/components/admin/InquiryUpdateForm";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireAdminAuth } from "@/lib/auth/admin";
import { SERVICE_CATEGORY_LABELS } from "@/lib/inquiries/constants";
import {
  buildCustomerWhatsAppUrl,
  normalizePhoneNumber,
  phoneHref,
} from "@/lib/inquiries/phone";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Waktu tidak tersedia" : dateFormatter.format(date);
}

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabase, claims } = await requireAdminAuth();
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound();

  const { data: inquiry, error } = await supabase
    .from("inquiries")
    .select(
      "id, created_at, updated_at, full_name, phone, service_category, service_detail, region, notes, status, source, handled_note",
    )
    .eq("id", id)
    .maybeSingle();

  const userEmail = typeof claims.email === "string" ? claims.email : undefined;

  if (error) {
    return (
      <>
        <AdminHeader userEmail={userEmail} />
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary-dark hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali ke daftar
          </Link>
          <div
            className="mt-8 rounded-xl border border-state-danger-border bg-state-danger-surface p-6 text-state-danger-text"
            role="alert"
          >
            <h1 className="font-display text-2xl font-semibold">
              Detail belum dapat dimuat
            </h1>
            <p className="mt-2 text-sm leading-7">
              Periksa koneksi Supabase lalu muat ulang halaman ini.
            </p>
            <a
              href={`/admin/inquiries/${id}`}
              className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-current px-4 text-sm font-bold"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Coba lagi
            </a>
          </div>
        </div>
      </>
    );
  }

  if (!inquiry) notFound();

  const normalizedPhone = normalizePhoneNumber(inquiry.phone);

  return (
    <>
      <AdminHeader userEmail={userEmail} />
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <Link
          href="/admin"
          className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-primary-dark hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke daftar
        </Link>

        <div className="mt-6 flex flex-col gap-4 border-b border-neutral-200 pb-7 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-primary-dark">
              Detail inquiry
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-accent sm:text-4xl">
              {inquiry.full_name}
            </h1>
            <p className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              Masuk {formatDate(inquiry.created_at)} WIB
            </p>
          </div>
          <StatusBadge status={inquiry.status} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)] lg:items-start">
          <div className="space-y-6">
            <section className="rounded-xl border border-neutral-200 bg-paper p-5 shadow-soft sm:p-6">
              <h2 className="text-xl font-semibold text-accent">Kontak dan kebutuhan</h2>
              <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
                    Nomor telepon
                  </dt>
                  <dd className="mt-2">
                    <p className="font-bold text-accent">{normalizedPhone}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <a
                        href={phoneHref(inquiry.phone)}
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-neutral-300 bg-surface px-3 text-sm font-bold text-accent hover:border-primary hover:text-primary-dark"
                      >
                        <Phone className="h-4 w-4" aria-hidden="true" />
                        Telepon
                      </a>
                      <a
                        href={buildCustomerWhatsAppUrl(
                          inquiry.phone,
                          inquiry.full_name,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-neutral-300 bg-surface px-3 text-sm font-bold text-accent hover:border-primary hover:text-primary-dark"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                        WhatsApp
                      </a>
                    </div>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
                    Wilayah
                  </dt>
                  <dd className="mt-2 leading-7 text-accent">
                    {inquiry.region || "Belum diisi"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
                    Kategori
                  </dt>
                  <dd className="mt-2 leading-7 text-accent">
                    {SERVICE_CATEGORY_LABELS[inquiry.service_category]}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
                    Detail layanan
                  </dt>
                  <dd className="mt-2 leading-7 text-accent">
                    {inquiry.service_detail || "Belum dirinci"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-neutral-200 bg-paper p-5 shadow-soft sm:p-6">
              <h2 className="text-xl font-semibold text-accent">
                Catatan dari pengunjung
              </h2>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-neutral-700">
                {inquiry.notes || "Pengunjung tidak menambahkan catatan."}
              </p>
            </section>

            <section className="rounded-xl border border-neutral-200 bg-paper p-5 shadow-soft sm:p-6">
              <h2 className="text-xl font-semibold text-accent">Jejak data</h2>
              <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
                    Sumber
                  </dt>
                  <dd className="mt-2 text-sm text-accent">{inquiry.source}</dd>
                </div>
                <div>
                  <dt className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
                    Terakhir diperbarui
                  </dt>
                  <dd className="mt-2 text-sm text-accent">
                    {formatDate(inquiry.updated_at)} WIB
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
                    ID inquiry
                  </dt>
                  <dd className="mt-2 break-all font-mono text-xs text-neutral-600">
                    {inquiry.id}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <aside className="order-first rounded-xl border border-neutral-200 bg-paper p-5 shadow-soft sm:p-6 lg:order-none lg:sticky lg:top-6">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-primary-dark">
              Penanganan internal
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-accent">
              Perbarui progres
            </h2>
            <p className="mt-3 text-sm leading-7 text-neutral-600">
              Pisahkan catatan kerja internal dari catatan yang dikirim
              pengunjung.
            </p>
            <div className="mt-6">
              <InquiryUpdateForm
                inquiryId={inquiry.id}
                initialStatus={inquiry.status}
                initialHandledNote={inquiry.handled_note}
                initialUpdatedAt={inquiry.updated_at}
              />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

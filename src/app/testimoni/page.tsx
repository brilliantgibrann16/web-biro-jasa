import { Quote, Star } from "lucide-react";
import Link from "next/link";
import PageHero from "@/components/page/PageHero";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { createRouteMetadata } from "@/lib/metadata";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import type {
  PublicTestimonial,
  PublicTestimonialsClient,
} from "@/lib/testimonials/public";

export const metadata = createRouteMetadata("testimoni");
export const dynamic = "force-dynamic";

const PUBLIC_TESTIMONIAL_COLUMNS = [
  "id",
  "service_category",
  "rating",
  "display_name",
  "testimonial_text",
  "published_at",
].join(", ");

function readText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null;
}

function parsePublicTestimonial(value: unknown): PublicTestimonial | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const id = readText(row.id, 64);
  const serviceCategory = readText(row.service_category, 80);
  const category = SERVICE_CATEGORIES.find(
    (item) => item.id === serviceCategory,
  );
  const displayName = readText(row.display_name, 120);
  const testimonialText = readText(row.testimonial_text, 2_000);
  const publishedAt = readText(row.published_at, 64);
  const rating = row.rating;

  if (
    !id ||
    !category ||
    !displayName ||
    !testimonialText ||
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return null;
  }

  return {
    id,
    serviceCategory: category.id,
    serviceCategoryLabel: category.title,
    rating,
    displayName,
    testimonialText,
    publishedAt:
      publishedAt && !Number.isNaN(new Date(publishedAt).getTime())
        ? publishedAt
        : null,
  };
}

async function getTestimonials(categoryId: string | null): Promise<{
  testimonials: PublicTestimonial[];
  unavailable: boolean;
}> {
  const supabase = createPublicServerClient();
  if (!supabase) return { testimonials: [], unavailable: true };

  const publicClient = supabase as unknown as PublicTestimonialsClient;
  let query = publicClient
    .from("testimonials")
    .select(PUBLIC_TESTIMONIAL_COLUMNS);

  if (categoryId) query = query.eq("service_category", categoryId);

  const { data, error } = await query
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(60);

  if (error) {
    console.error("Public testimonials query failed", { code: error.code });
    return { testimonials: [], unavailable: true };
  }

  const rows = Array.isArray(data) ? data : [];
  return {
    testimonials: rows
      .map(parsePublicTestimonial)
      .filter((item): item is PublicTestimonial => item !== null),
    unavailable: false,
  };
}

function Rating({ value }: { value: number }) {
  return (
    <div
      className="flex items-center gap-1 text-primary-dark"
      role="img"
      aria-label={`Rating ${value} dari 5`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < value ? "fill-current" : "opacity-25"}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default async function TestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string | string[] }>;
}) {
  const params = await searchParams;
  const requestedCategory = Array.isArray(params.kategori)
    ? params.kategori[0]
    : params.kategori;
  const activeCategory = SERVICE_CATEGORIES.some(
    (category) => category.id === requestedCategory,
  )
    ? requestedCategory ?? null
    : null;
  const { testimonials, unavailable } = await getTestimonials(activeCategory);

  return (
    <>
      <PageHero
        variant="index"
        title="Pengalaman pelanggan setelah pengurusan selesai."
        intro="Setiap testimoni ditinjau sebelum dipublikasikan. Nama ditampilkan lengkap, sebagai inisial, atau disamarkan sesuai bentuk yang telah disetujui untuk publikasi."
        asideTitle="Testimoni pelanggan"
        asideBody="Hanya pengalaman yang disampaikan pelanggan dan telah disetujui untuk ditampilkan."
        points={SERVICE_CATEGORIES.map(
          (category) => `Pengalaman layanan ${category.title.toLowerCase()}.`,
        )}
      />

      <section className="bg-page pb-24 text-accent md:pb-32" aria-labelledby="testimonials-title">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-8 border-b border-neutral-200 pb-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end">
            <div>
              <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-primary-dark">
                Daftar testimoni
              </p>
              <h2 id="testimonials-title" className="mt-5 font-display text-4xl font-semibold leading-tight sm:text-5xl">
                Pilih kategori layanan.
              </h2>
            </div>

            <nav aria-label="Filter kategori testimoni" className="lg:justify-self-end">
              <ul className="flex flex-wrap gap-2">
                <li>
                  <Link
                    href="/testimoni"
                    aria-current={activeCategory === null ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center rounded-sm border px-4 text-sm font-extrabold transition-colors ${
                      activeCategory === null
                        ? "border-primary-dark bg-primary-dark text-white"
                        : "border-neutral-300 text-accent hover:border-primary-dark hover:text-primary-dark"
                    }`}
                  >
                    Semua layanan
                  </Link>
                </li>
                {SERVICE_CATEGORIES.map((category) => {
                  const active = activeCategory === category.id;
                  return (
                    <li key={category.id}>
                      <Link
                        href={`/testimoni?kategori=${encodeURIComponent(category.id)}`}
                        aria-current={active ? "page" : undefined}
                        className={`inline-flex min-h-11 items-center rounded-sm border px-4 text-sm font-extrabold transition-colors ${
                          active
                            ? "border-primary-dark bg-primary-dark text-white"
                            : "border-neutral-300 text-accent hover:border-primary-dark hover:text-primary-dark"
                        }`}
                      >
                        {category.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {unavailable ? (
            <div className="mt-10 border border-state-warning-border bg-state-warning-surface p-6 text-state-warning-text" role="status">
              <p className="font-bold">Testimoni belum dapat dimuat.</p>
              <p className="mt-2 text-sm leading-7">
                Muat ulang halaman beberapa saat lagi.
              </p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="mt-10 border-y border-neutral-200 py-12">
              <Quote className="h-7 w-7 text-primary-dark" aria-hidden="true" />
              <h3 className="mt-5 max-w-2xl font-display text-3xl font-semibold text-accent">
                Belum ada testimoni untuk kategori ini.
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600">
                Silakan lihat kategori layanan lain atau kembali lagi nanti.
              </p>
              {activeCategory ? (
                <Link
                  href="/testimoni"
                  className="mt-6 inline-flex min-h-11 items-center border-b border-primary-dark pb-2 text-sm font-extrabold text-primary-dark hover:text-accent"
                >
                  Tampilkan semua testimoni
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="grid border-b border-neutral-200 md:grid-cols-2">
              {testimonials.map((testimonial) => (
                <article
                  key={testimonial.id}
                  className="border-t border-neutral-200 py-9 md:p-9 md:first:pl-0 md:even:border-l md:even:pr-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <Rating value={testimonial.rating} />
                    <span className="text-[0.64rem] font-black uppercase tracking-[0.16em] text-primary-dark">
                      {testimonial.serviceCategoryLabel}
                    </span>
                  </div>
                  <blockquote className="mt-7 whitespace-pre-wrap break-words font-display text-2xl font-semibold leading-9 text-accent">
                    “{testimonial.testimonialText}”
                  </blockquote>
                  <footer className="mt-7 border-t border-neutral-200 pt-5">
                    <p className="break-words font-extrabold text-accent">
                      {testimonial.displayName}
                    </p>
                    <p className="mt-1 text-xs leading-6 text-neutral-500">
                      Nama ditampilkan sesuai izin publikasi.
                    </p>
                  </footer>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

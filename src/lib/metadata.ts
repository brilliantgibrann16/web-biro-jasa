import type { Metadata } from "next";
import { COMPANY, type ServiceCategory } from "./constants";

function normalizeSiteUrl(value: string | undefined): URL | undefined {
  if (!value) return undefined;
  const absoluteValue = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    return new URL(absoluteValue);
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be a valid absolute production URL."
    );
  }
}

const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const VERIFIED_SITE_URL = normalizeSiteUrl(configuredSiteUrl);
export const METADATA_BASE =
  VERIFIED_SITE_URL ?? new URL("http://localhost:3000");

const DEFAULT_SOCIAL_IMAGE: SocialImageMetadata = {
  url: "/opengraph-image",
  alt: "Biro Jasa Tiga Saudara — berkas dibaca dulu, proses dijalankan dengan rapi.",
  width: 1731,
  height: 909,
  type: "image/png",
};

export type SitePath = "/" | `/${string}`;

export interface PageMetadataDefinition {
  title: string;
  description: string;
  path: SitePath;
  keywords?: readonly string[];
}

export interface SocialImageMetadata {
  url: string | URL;
  alt: string;
  width?: number;
  height?: number;
  type?: string;
}

export interface PageMetadataOptions {
  socialImage?: SocialImageMetadata;
  noIndex?: boolean;
  siteUrl?: URL;
}

export const ROUTE_METADATA = {
  home: {
    title: "Biro Jasa Tiga Saudara | Pengurusan Dokumen dan Perizinan",
    description:
      "Biro Jasa Tiga Saudara membantu pengurusan dokumen kendaraan, perizinan bangunan, dan legalitas teknis melalui pemeriksaan berkas yang rapi sejak awal.",
    path: "/",
  },
  layanan: {
    title: "Layanan Pengurusan Dokumen",
    description:
      "Indeks layanan Biro Jasa Tiga Saudara untuk dokumen kendaraan, perizinan bangunan, dan legalitas teknis.",
    path: "/layanan",
  },
  proses: {
    title: "Proses Pengurusan Dokumen",
    description:
      "Cara kerja Biro Jasa Tiga Saudara dalam memeriksa berkas, menentukan alur, memantau proses, dan menyerahkan dokumen akhir.",
    path: "/proses",
  },
  tentang: {
    title: "Tentang Kami",
    description:
      "Profil Biro Jasa Tiga Saudara sebagai pendamping pengurusan dokumen kendaraan, perizinan bangunan, dan legalitas teknis.",
    path: "/tentang",
  },
  faq: {
    title: "FAQ Pengurusan Dokumen",
    description:
      "Pertanyaan umum mengenai konsultasi, estimasi biaya, dokumen awal, waktu proses, dan pengurusan berkas bermasalah.",
    path: "/faq",
  },
  kontak: {
    title: "Kontak",
    description:
      "Hubungi Biro Jasa Tiga Saudara untuk konsultasi awal pengurusan dokumen kendaraan, perizinan bangunan, dan legalitas teknis.",
    path: "/kontak",
  },
  privasi: {
    title: "Pemberitahuan Privasi",
    description:
      "Penjelasan data yang diproses ketika Anda mengirim ringkasan kebutuhan melalui website Biro Jasa Tiga Saudara.",
    path: "/privasi",
  },
} as const satisfies Record<string, PageMetadataDefinition>;

export type RouteMetadataKey = keyof typeof ROUTE_METADATA;

/**
 * Canonical and Open Graph page URLs are emitted only when a verified
 * production origin is provided. Pass `socialImage` only after the bespoke
 * asset exists.
 */
export function createPageMetadata(
  definition: PageMetadataDefinition,
  options: PageMetadataOptions = {}
): Metadata {
  const {
    socialImage,
    noIndex = false,
    siteUrl = VERIFIED_SITE_URL,
  } = options;
  const resolvedSocialImage = socialImage ?? DEFAULT_SOCIAL_IMAGE;
  const pageUrl = siteUrl ? new URL(definition.path, siteUrl) : undefined;
  const socialTitle = definition.title.includes(COMPANY.name)
    ? definition.title
    : `${definition.title} | ${COMPANY.name}`;

  const openGraph: Metadata["openGraph"] = {
    title: socialTitle,
    description: definition.description,
    type: "website",
    locale: "id_ID",
    siteName: COMPANY.name,
    ...(pageUrl ? { url: pageUrl } : {}),
    images: [
      {
        url: resolvedSocialImage.url,
        alt: resolvedSocialImage.alt,
        width: resolvedSocialImage.width,
        height: resolvedSocialImage.height,
        type: resolvedSocialImage.type,
      },
    ],
  };

  const twitter: Metadata["twitter"] = {
    card: "summary_large_image",
    title: socialTitle,
    description: definition.description,
    images: [
      {
        url: socialImage?.url ?? "/twitter-image",
        alt: resolvedSocialImage.alt,
      },
    ],
  };

  return {
    title: definition.title,
    description: definition.description,
    ...(definition.keywords
      ? { keywords: [...definition.keywords] }
      : {}),
    ...(pageUrl
      ? {
          alternates: {
            canonical: pageUrl,
          },
        }
      : {}),
    openGraph,
    twitter,
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
          },
        }
      : {}),
  };
}

export function createRouteMetadata(
  route: RouteMetadataKey,
  options?: PageMetadataOptions
): Metadata {
  return createPageMetadata(ROUTE_METADATA[route], options);
}

export function createServiceMetadata(
  category: Pick<
    ServiceCategory,
    "slug" | "title" | "seoTitle" | "seoDescription" | "services"
  >,
  options?: PageMetadataOptions
): Metadata {
  return createPageMetadata(
    {
      title: category.seoTitle,
      description: category.seoDescription,
      path: `/layanan/${category.slug}`,
      keywords: [
        category.title,
        ...category.services.map((service) => service.name),
      ],
    },
    options
  );
}

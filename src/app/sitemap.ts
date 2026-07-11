import type { MetadataRoute } from "next";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { ROUTE_METADATA, VERIFIED_SITE_URL } from "@/lib/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!VERIFIED_SITE_URL) return [];

  const routePaths = Object.values(ROUTE_METADATA).map((route) => route.path);
  const servicePaths = SERVICE_CATEGORIES.map(
    (category) => `/layanan/${category.slug}`,
  );

  return [...new Set([...routePaths, ...servicePaths])].map((path) => ({
    url: new URL(path, VERIFIED_SITE_URL).toString(),
  }));
}

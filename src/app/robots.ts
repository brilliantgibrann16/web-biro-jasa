import type { MetadataRoute } from "next";
import { VERIFIED_SITE_URL } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  const productionMetadata = VERIFIED_SITE_URL
    ? {
        sitemap: new URL("/sitemap.xml", VERIFIED_SITE_URL).toString(),
        host: VERIFIED_SITE_URL.origin,
      }
    : {};

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    ...productionMetadata,
  };
}

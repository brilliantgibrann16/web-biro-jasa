import HeroSection from "@/components/sections/HeroSection";
import TrustIndicators from "@/components/sections/TrustIndicators";
import FeaturedServices from "@/components/sections/FeaturedServices";
import ProcessSection from "@/components/sections/ProcessSection";
import IndustriesSection from "@/components/sections/IndustriesSection";
import CTASection from "@/components/sections/CTASection";
import { COMPANY, SERVICE_CATEGORIES } from "@/lib/constants";
import { createRouteMetadata, VERIFIED_SITE_URL } from "@/lib/metadata";

export const metadata = createRouteMetadata("home");

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: COMPANY.name,
  description:
    "Jasa pengurusan dokumen kendaraan, perizinan bangunan, dan legalitas teknis.",
  telephone: COMPANY.phone,
  ...(VERIFIED_SITE_URL ? { url: VERIFIED_SITE_URL.toString() } : {}),
  contactPoint: {
    "@type": "ContactPoint",
    telephone: COMPANY.phone,
    contactType: "customer service",
    availableLanguage: "id",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Layanan pengurusan dokumen",
    itemListElement: SERVICE_CATEGORIES.flatMap((category) =>
      category.services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
          serviceType: service.name,
        },
      })),
    ),
  },
};

const serializedOrganizationJsonLd = JSON.stringify(organizationJsonLd).replace(
  /</g,
  "\\u003c",
);

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializedOrganizationJsonLd }}
      />
      <HeroSection />
      <TrustIndicators />
      <FeaturedServices />
      <ProcessSection variant="preview" />
      <IndustriesSection />
      <CTASection />
    </>
  );
}

import HeroSection from "@/components/sections/HeroSection";
import TrustIndicators from "@/components/sections/TrustIndicators";
import FeaturedServices from "@/components/sections/FeaturedServices";
import ProcessSection from "@/components/sections/ProcessSection";
import IndustriesSection from "@/components/sections/IndustriesSection";
import CTASection from "@/components/sections/CTASection";
import { createRouteMetadata } from "@/lib/metadata";

export const metadata = createRouteMetadata("home");

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustIndicators />
      <FeaturedServices />
      <ProcessSection variant="preview" />
      <IndustriesSection />
      <CTASection />
    </>
  );
}

import ServiceDetailPage from "@/components/page/ServiceDetailPage";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { createServiceMetadata } from "@/lib/metadata";

const category = SERVICE_CATEGORIES.find(
  (item) => item.slug === "perizinan-bangunan"
)!;

export const metadata = createServiceMetadata(category);

export default function PerizinanBangunanPage() {
  return <ServiceDetailPage category={category} />;
}

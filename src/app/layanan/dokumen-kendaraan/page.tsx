import ServiceDetailPage from "@/components/page/ServiceDetailPage";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { createServiceMetadata } from "@/lib/metadata";

const category = SERVICE_CATEGORIES.find(
  (item) => item.slug === "dokumen-kendaraan"
)!;

export const metadata = createServiceMetadata(category);

export default function DokumenKendaraanPage() {
  return <ServiceDetailPage category={category} />;
}

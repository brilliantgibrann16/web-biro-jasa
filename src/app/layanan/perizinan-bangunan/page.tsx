import ServiceDetailPage from "@/components/page/ServiceDetailPage";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { createServiceMetadata } from "@/lib/metadata";

const category = SERVICE_CATEGORIES.find(
  (item) => item.slug === "perizinan-bangunan"
)!;

export const metadata = createServiceMetadata(category);

export default function PerizinanBangunanPage() {
  return (
    <ServiceDetailPage
      category={category}
      editorialVisual={{
        src: "/perizinan-bangunan-workspace.webp",
        alt: "Meja kerja berisi gambar teknis bangunan, map dokumen, dan stempel pemeriksaan",
        label: "Dokumen teknis bangunan",
        title: "Data tanah, fungsi bangunan, dan gambar teknis diperiksa sebagai satu kesatuan.",
        body: "Pemeriksaan ini membantu menentukan kelengkapan dan tahapan yang perlu disiapkan sebelum pengajuan.",
      }}
    />
  );
}

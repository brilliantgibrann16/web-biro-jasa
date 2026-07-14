import {
  BadgeCheck,
  Building2,
  Car,
  ClipboardCheck,
  Clock,
  Eye,
  Fingerprint,
  Flame,
  HardHat,
  HeartHandshake,
  Home,
  Landmark,
  Lock,
  MessageCircle,
  PackageCheck,
  PenTool,
  Scale,
  Search,
  Settings,
  Shield,
  Stamp,
  Truck,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const WHATSAPP_NUMBER = "6281363249533";

export const WHATSAPP_MESSAGES = {
  default:
    "Halo Biro Jasa Tiga Saudara, saya ingin berkonsultasi mengenai pengurusan dokumen.",
  layanan:
    "Halo Biro Jasa Tiga Saudara, saya ingin memastikan layanan yang sesuai dengan kebutuhan saya.",
  proses:
    "Halo Biro Jasa Tiga Saudara, saya ingin menanyakan tahapan pengurusan dokumen.",
  tentang:
    "Halo Biro Jasa Tiga Saudara, saya ingin berkonsultasi mengenai layanan dan cara kerja pengurusan dokumen.",
  faq:
    "Halo Biro Jasa Tiga Saudara, saya memiliki pertanyaan mengenai syarat atau proses pengurusan dokumen.",
  kontak:
    "Halo Biro Jasa Tiga Saudara, saya ingin memulai konsultasi pengurusan dokumen.",
  dokumenKendaraan:
    "Halo Biro Jasa Tiga Saudara, saya ingin berkonsultasi mengenai pengurusan dokumen kendaraan.",
  perizinanBangunan:
    "Halo Biro Jasa Tiga Saudara, saya ingin berkonsultasi mengenai perizinan bangunan.",
  legalitasTeknis:
    "Halo Biro Jasa Tiga Saudara, saya ingin berkonsultasi mengenai legalitas teknis atau rekomendasi pendukung.",
  simKirNopil:
    "Halo Biro Jasa Tiga Saudara, saya ingin berkonsultasi mengenai SIM, KIR, ETLE, atau nomor polisi pilihan.",
  mutasiKendaraan:
    "Halo Biro Jasa Tiga Saudara, saya ingin berkonsultasi mengenai mutasi atau cabut berkas kendaraan.",
  dokumenKendaraanHilang:
    "Halo Biro Jasa Tiga Saudara, saya ingin berkonsultasi mengenai STNK atau BPKB yang hilang.",
} as const;

// TODO: perlu data asli dari klien sebelum informasi berikut dipublikasikan.
export const CLIENT_DATA_TODOS = {
  physicalAddress: "Alamat kantor fisik dan petunjuk kunjungan.",
  serviceArea: "Cakupan wilayah untuk setiap jenis layanan.",
  businessLegality:
    "Nama badan usaha, nomor legalitas, sertifikasi, atau afiliasi resmi bila ada.",
  testimonials: "Testimoni yang sudah mendapat izin publikasi dari klien.",
  trackRecord:
    "Statistik terverifikasi seperti lama operasi atau jumlah berkas yang selesai.",
  productionDomain: "Domain produksi untuk canonical URL, sitemap, dan metadata sosial.",
} as const;

export const COMPANY = {
  name: "Biro Jasa Tiga Saudara",
  shortName: "Tiga Saudara",
  tagline: "Berkas diperiksa sebelum proses dimulai.",
  subtitle:
    "Kami membantu pengurusan dokumen kendaraan, perizinan bangunan, dan legalitas teknis. Setiap kebutuhan diperiksa terlebih dahulu agar persyaratan, tahapan, dan perkiraan biayanya dapat dijelaskan dengan jelas.",
  phone: "+62 813 6324 9533",
  whatsappNumber: WHATSAPP_NUMBER,
  whatsappUrl: (message: string = WHATSAPP_MESSAGES.default) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
  defaultWhatsappMessage: WHATSAPP_MESSAGES.default,
  hours: "Senin–Sabtu: 08.00–17.00 WIB",
  year: new Date().getFullYear(),
} as const;

export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Layanan", href: "/layanan" },
  { label: "Proses", href: "/proses" },
  { label: "Tentang", href: "/tentang" },
  { label: "FAQ", href: "/faq" },
  { label: "Kontak", href: "/kontak" },
];

export interface TrustItem {
  icon: LucideIcon;
  label: string;
  description: string;
}

export const TRUST_ITEMS: TrustItem[] = [
  {
    icon: Search,
    label: "Pemeriksaan awal",
    description:
      "Kelengkapan, kecocokan data, wilayah, dan tujuan pengurusan diperiksa sebelum proses dimulai.",
  },
  {
    icon: Stamp,
    label: "Proses sesuai instansi",
    description:
      "Tahapan disusun berdasarkan jenis dokumen dan instansi yang menangani.",
  },
  {
    icon: Lock,
    label: "Dokumen sesuai kebutuhan",
    description:
      "Kami menjelaskan dokumen yang perlu disiapkan dan kapan dokumen asli diperlukan.",
  },
  {
    icon: MessageCircle,
    label: "Pembaruan status",
    description:
      "Anda mendapat kabar saat ada perkembangan, koreksi, atau dokumen tambahan yang diperlukan.",
  },
];

export interface ServiceItem {
  icon: LucideIcon;
  title: string;
  description: string;
  whatsappMessage: string;
  featured?: boolean;
  scope: string;
  href: string;
}

export const FEATURED_SERVICES: ServiceItem[] = [
  {
    icon: Car,
    title: "Dokumen Kendaraan",
    scope: "STNK, BPKB, balik nama, mutasi",
    description:
      "Kami memeriksa kecocokan data kendaraan, identitas pemilik, wilayah Samsat, dan tujuan pengurusan sebelum menentukan proses.",
    whatsappMessage: WHATSAPP_MESSAGES.dokumenKendaraan,
    href: "/layanan/dokumen-kendaraan",
    featured: true,
  },
  {
    icon: Building2,
    title: "Perizinan Bangunan",
    scope: "PBG, SLF, PKKPR, peil banjir",
    description:
      "Kami membantu mengidentifikasi kebutuhan izin dan dokumen teknis berdasarkan fungsi, lokasi, serta kondisi bangunan.",
    whatsappMessage: WHATSAPP_MESSAGES.perizinanBangunan,
    href: "/layanan/perizinan-bangunan",
    featured: true,
  },
  {
    icon: Scale,
    title: "Legalitas Teknis",
    scope: "ANDALALIN, dokumen damkar, rekomendasi teknis, kekayaan intelektual",
    description:
      "Kami membantu mengidentifikasi dokumen teknis atau legalitas pendukung yang perlu dilengkapi sebelum pengajuan utama.",
    whatsappMessage: WHATSAPP_MESSAGES.legalitasTeknis,
    href: "/layanan/legalitas-teknis",
  },
  {
    icon: Fingerprint,
    title: "Dokumen Pengemudi dan Kendaraan",
    scope: "SIM, KIR, ETLE, nomor polisi pilihan",
    description:
      "Jenis permohonan, masa berlaku, serta data kendaraan dan pengemudi diperiksa sebelum kebutuhan administrasinya ditentukan.",
    whatsappMessage: WHATSAPP_MESSAGES.simKirNopil,
    href: "/layanan/dokumen-kendaraan",
  },
  {
    icon: Truck,
    title: "Perpindahan Daerah",
    scope: "Mutasi antar-Samsat, antar-daerah, cabut berkas",
    description:
      "Kami membantu menyusun tahapan mutasi dari Samsat asal hingga Samsat tujuan, termasuk kebutuhan cabut berkas.",
    whatsappMessage: WHATSAPP_MESSAGES.mutasiKendaraan,
    href: "/layanan/dokumen-kendaraan",
  },
  {
    icon: Shield,
    title: "Dokumen Hilang",
    scope: "STNK dan BPKB",
    description:
      "Kami membantu memeriksa kronologi, bukti kepemilikan, dan dokumen pendukung untuk penggantian STNK atau BPKB yang hilang.",
    whatsappMessage: WHATSAPP_MESSAGES.dokumenKendaraanHilang,
    href: "/layanan/dokumen-kendaraan",
  },
];

export interface WhyUsItem {
  icon: LucideIcon;
  title: string;
  description: string;
  proof: string;
}

export const WHY_CHOOSE_US: WhyUsItem[] = [
  {
    icon: Search,
    title: "Kebutuhan diperiksa sebelum proses dimulai",
    description:
      "Kami memeriksa tujuan pengurusan, wilayah, masa berlaku, dan kelengkapan dokumen untuk menentukan langkah berikutnya.",
    proof: "Pemeriksaan awal",
  },
  {
    icon: Shield,
    title: "Proses mengikuti ketentuan yang berlaku",
    description:
      "Setiap pengurusan diarahkan ke instansi yang berwenang sesuai jenis dokumen dan wilayahnya.",
    proof: "Prosedur resmi",
  },
  {
    icon: Eye,
    title: "Rincian biaya dijelaskan sebelum Anda melanjutkan",
    description:
      "Komponen biaya dijelaskan berdasarkan kondisi dokumen dan informasi yang tersedia sebelum proses disetujui.",
    proof: "Rincian biaya",
  },
  {
    icon: Clock,
    title: "Pembaruan disampaikan saat perlu ditindaklanjuti",
    description:
      "Anda mendapat kabar ketika ada perkembangan, koreksi, atau dokumen tambahan yang perlu disiapkan.",
    proof: "Status proses",
  },
  {
    icon: Lock,
    title: "Dokumen diminta sesuai kebutuhan proses",
    description:
      "Kami menjelaskan dokumen yang relevan pada setiap tahap dan mengingatkan Anda agar tidak membagikan data sensitif melalui kanal publik.",
    proof: "Kebutuhan dokumen",
  },
  {
    icon: HeartHandshake,
    title: "Hasil diperiksa sebelum diserahkan",
    description:
      "Nama, nomor, masa berlaku, dan keterangan penting diperiksa kembali sebelum serah terima.",
    proof: "Serah terima",
  },
];

export interface ProcessStep {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
  detail: string;
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    step: 1,
    icon: MessageCircle,
    title: "Konsultasi awal",
    description:
      "Anda menyampaikan jenis dokumen, wilayah, kondisi terakhir, dan tujuan pengurusan.",
    detail:
      "Informasi ini membantu kami menentukan dokumen awal yang perlu diperiksa.",
  },
  {
    step: 2,
    icon: Search,
    title: "Pemeriksaan dokumen",
    description:
      "Kelengkapan, kecocokan data, masa berlaku, dan bukti pendukung diperiksa.",
    detail:
      "Jika ada kekurangan atau perbedaan data, kami menyampaikannya sebelum pengurusan dimulai.",
  },
  {
    step: 3,
    icon: Settings,
    title: "Penentuan proses",
    description:
      "Instansi, urutan pengajuan, dan kebutuhan administrasi disusun berdasarkan hasil pemeriksaan.",
    detail:
      "Anda menerima penjelasan mengenai tahapan, perkiraan biaya, dan bagian proses yang bergantung pada instansi.",
  },
  {
    step: 4,
    icon: ClipboardCheck,
    title: "Pemantauan pengurusan",
    description:
      "Status pengajuan dipantau, termasuk permintaan koreksi atau dokumen tambahan.",
    detail:
      "Kami menghubungi Anda saat ada perkembangan yang perlu ditindaklanjuti.",
  },
  {
    step: 5,
    icon: PackageCheck,
    title: "Verifikasi dan serah terima",
    description:
      "Nama, nomor, alamat, masa berlaku, dan keterangan penting diperiksa sebelum dokumen diserahkan.",
    detail:
      "Kami menjelaskan status hasil, masa berlaku, dan dokumen yang perlu disimpan.",
  },
];

export interface ValueProp {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const VALUE_PROPS: ValueProp[] = [
  {
    icon: Zap,
    title: "Waktu Anda digunakan lebih efisien",
    description:
      "Daftar dokumen awal disusun untuk mengurangi kunjungan atau pengiriman berkas yang tidak diperlukan.",
  },
  {
    icon: Shield,
    title: "Perbedaan data diketahui lebih awal",
    description:
      "Nama, alamat, nomor rangka, atau lampiran teknis diperiksa sebelum menjadi kendala pada tahap berikutnya.",
  },
  {
    icon: BadgeCheck,
    title: "Hasil diperiksa sesuai tujuan",
    description:
      "Dokumen hasil diperiksa kembali agar sesuai dengan permohonan yang diajukan.",
  },
  {
    icon: Clock,
    title: "Riwayat komunikasi mudah ditelusuri",
    description:
      "Konsultasi melalui WhatsApp membantu menyimpan pertanyaan, dokumen yang diminta, dan pembaruan status.",
  },
];

export type ServiceCategoryId =
  | "dokumen-kendaraan"
  | "perizinan-bangunan"
  | "legalitas-teknis";

export interface ServiceCategory {
  id: ServiceCategoryId;
  slug: string;
  title: string;
  navLabel: string;
  icon: LucideIcon;
  seoTitle: string;
  seoDescription: string;
  heroTitle: string;
  heroIntro: string;
  summary: string;
  whatsappMessage: string;
  narrative: string[];
  suitableFor: string[];
  documents: string[];
  processFocus: string[];
  services: {
    name: string;
    description: string;
  }[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "dokumen-kendaraan",
    slug: "dokumen-kendaraan",
    title: "Dokumen Kendaraan",
    navLabel: "Kendaraan",
    icon: Car,
    seoTitle: "Jasa Pengurusan Dokumen Kendaraan",
    seoDescription:
      "Layanan pengurusan STNK, BPKB, balik nama, mutasi, cabut berkas, KIR, ETLE, dan perubahan data kendaraan dengan pemeriksaan awal.",
    heroTitle: "Pengurusan dokumen kendaraan dimulai dengan pemeriksaan data dan wilayah Samsat.",
    heroIntro:
      "Kami memeriksa identitas pemilik, status dokumen, wilayah Samsat, dan tujuan pengurusan sebelum menjelaskan tahapan berikutnya.",
    summary:
      "STNK, BPKB, balik nama, mutasi, cabut berkas, SIM, KIR, ETLE, nomor polisi pilihan, dan perubahan data kendaraan.",
    whatsappMessage: WHATSAPP_MESSAGES.dokumenKendaraan,
    narrative: [
      "Perbedaan nama, alamat, masa berlaku, tunggakan, atau data daerah asal dapat mengubah persyaratan dan urutan pengurusan kendaraan.",
      "Setelah dokumen awal diperiksa, kami menjelaskan kelengkapan yang masih dibutuhkan, tahapan pengurusan, dan bagian yang bergantung pada proses instansi.",
    ],
    suitableFor: [
      "Pemilik kendaraan yang perlu memperpanjang atau memperbarui dokumen.",
      "Pembeli kendaraan bekas yang perlu mengurus balik nama.",
      "Perusahaan yang mengelola dokumen kendaraan operasional.",
      "Pemilik kendaraan yang perlu mengurus penggantian STNK atau BPKB karena hilang.",
    ],
    documents: [
      "Identitas pemilik lama dan/atau pemilik baru sesuai jenis pengurusan.",
      "STNK, BPKB, faktur, kuitansi pembelian, atau bukti kepemilikan lain yang relevan.",
      "Nomor polisi, nomor rangka, nomor mesin, dan data kendaraan lainnya.",
      "Laporan kehilangan atau dokumen tambahan untuk mutasi dan perubahan data, bila diperlukan.",
    ],
    processFocus: [
      "Memeriksa kecocokan identitas pemilik dan data kendaraan.",
      "Menentukan proses di Samsat asal, Samsat tujuan, atau keduanya.",
      "Menjelaskan kelengkapan, tahapan, dan perkiraan waktu berdasarkan jenis pengurusan.",
      "Memeriksa data pada dokumen hasil sebelum serah terima.",
    ],
    services: [
      {
        name: "Perpanjangan STNK",
        description:
          "Pengurusan perpanjangan tahunan atau lima tahunan dengan pemeriksaan masa berlaku, kewajiban pajak, dan data pemilik.",
      },
      {
        name: "Pengurusan BPKB",
        description:
          "Pengurusan perubahan data, penggantian, atau kebutuhan administratif lain terkait BPKB berdasarkan dokumen pendukung yang tersedia.",
      },
      {
        name: "Balik Nama Kendaraan",
        description:
          "Pengurusan perubahan data kepemilikan kendaraan bekas dari pemilik lama ke pemilik baru.",
      },
      {
        name: "Mutasi Antar-Samsat",
        description:
          "Pengurusan perpindahan data kendaraan antarwilayah Samsat sesuai domisili atau tujuan pemilik.",
      },
      {
        name: "Mutasi Antar-Daerah",
        description:
          "Pengurusan mutasi keluar dan masuk ketika kendaraan berpindah kabupaten, kota, atau provinsi.",
      },
      {
        name: "Cabut Berkas Kendaraan",
        description:
          "Pengurusan berkas kendaraan dari wilayah asal sebagai tahap awal mutasi ke wilayah tujuan.",
      },
      {
        name: "STNK Hilang",
        description:
          "Pengurusan penggantian STNK berdasarkan laporan kehilangan, bukti kepemilikan, dan persyaratan instansi.",
      },
      {
        name: "BPKB Hilang",
        description:
          "Pengurusan penggantian BPKB berdasarkan laporan kehilangan, bukti kepemilikan, dan persyaratan instansi.",
      },
      {
        name: "SIM",
        description:
          "Konsultasi kebutuhan administrasi SIM berdasarkan jenis permohonan, golongan, masa berlaku, dan identitas pemohon.",
      },
      {
        name: "KIR",
        description:
          "Pendampingan administrasi uji berkala berdasarkan jenis kendaraan dan masa berlaku.",
      },
      {
        name: "ETLE",
        description:
          "Pendampingan pengecekan data pelanggaran dan penyelesaian administrasi melalui kanal resmi ETLE.",
      },
      {
        name: "Nomor Polisi Pilihan",
        description:
          "Pengecekan persyaratan dan pengurusan nomor kendaraan pilihan sesuai ketersediaan dan ketentuan yang berlaku.",
      },
      {
        name: "Perubahan Bentuk/Ganti Warna Kendaraan",
        description:
          "Pengurusan pembaruan data setelah perubahan bentuk atau warna kendaraan sesuai dokumen pendukung yang dipersyaratkan.",
      },
      {
        name: "Faktur Mobil/Motor",
        description:
          "Pemeriksaan dan pendampingan pengurusan faktur kendaraan sesuai kebutuhan administrasi.",
      },
      {
        name: "Kesesuaian Data Identitas",
        description:
          "Pemeriksaan kecocokan KTP dan data identitas lain yang digunakan dalam pengurusan kendaraan.",
      },
    ],
  },
  {
    id: "perizinan-bangunan",
    slug: "perizinan-bangunan",
    title: "Perizinan Bangunan",
    navLabel: "Bangunan",
    icon: Building2,
    seoTitle: "Jasa Pengurusan PBG, SLF, PKKPR",
    seoDescription:
      "Layanan pengurusan PBG, SLF, PKKPR, peil banjir, dan dokumen perizinan bangunan lainnya.",
    heroTitle: "Perizinan bangunan ditentukan oleh fungsi, lokasi, dan kondisi bangunan.",
    heroIntro:
      "Kami memeriksa fungsi, luas, lokasi, status tanah, dan dokumen teknis untuk menentukan izin yang diperlukan sebelum pengajuan.",
    summary:
      "PBG, SLF, PKKPR, peil banjir, perubahan fungsi, dan penyesuaian dokumen bangunan lama.",
    whatsappMessage: WHATSAPP_MESSAGES.perizinanBangunan,
    narrative: [
      "Persyaratan rumah tinggal, ruko, gudang, kantor, dan bangunan komersial berbeda menurut fungsi, skala, lokasi, serta kondisi bangunan.",
      "Kami membantu memeriksa dokumen yang sudah tersedia, menyusun daftar kekurangan, dan menjelaskan tahapan pengajuan yang perlu ditempuh.",
    ],
    suitableFor: [
      "Pemilik rumah, ruko, gudang, atau bangunan komersial.",
      "Pengembang properti dan kontraktor yang menyiapkan dokumen proyek.",
      "Pemilik usaha yang membutuhkan legalitas fungsi bangunan.",
      "Pengelola bangunan lama yang perlu meninjau kesesuaian dokumennya dengan ketentuan yang berlaku.",
    ],
    documents: [
      "Identitas pemilik atau dokumen badan usaha.",
      "Data tanah, alamat bangunan, dan informasi pemanfaatan ruang.",
      "Gambar teknis, rencana fungsi, dan dokumen pendukung proyek.",
      "Dokumen lama seperti IMB bila akan disesuaikan dengan ketentuan baru.",
    ],
    processFocus: [
      "Memeriksa fungsi bangunan dan menentukan izin yang relevan.",
      "Menyusun daftar dokumen teknis yang perlu disiapkan sebelum pengajuan.",
      "Menjelaskan urutan pengajuan dan koordinasi dengan instansi terkait.",
      "Memeriksa hasil dan catatan penting sebelum dokumen digunakan.",
    ],
    services: [
      {
        name: "PBG",
        description:
          "Pendampingan pengajuan Persetujuan Bangunan Gedung untuk pembangunan baru, perubahan, atau penyesuaian bangunan.",
      },
      {
        name: "SLF",
        description:
          "Pendampingan pengajuan Sertifikat Laik Fungsi berdasarkan fungsi bangunan dan dokumen teknis yang dipersyaratkan.",
      },
      {
        name: "PKKPR",
        description:
          "Pendampingan persetujuan kesesuaian kegiatan pemanfaatan ruang berdasarkan lokasi dan rencana kegiatan.",
      },
      {
        name: "Peil Banjir",
        description:
          "Pendampingan pengurusan keterangan teknis peil banjir sesuai lokasi bangunan dan ketentuan daerah.",
      },
      {
        name: "Penyesuaian Dokumen Bangunan Lama",
        description:
          "Pemeriksaan dokumen bangunan lama untuk menentukan apakah diperlukan perubahan, pembaruan, atau pengajuan baru.",
      },
      {
        name: "Perubahan Fungsi",
        description:
          "Pendampingan penyesuaian dokumen ketika bangunan akan digunakan untuk fungsi yang berbeda dari dokumen awal.",
      },
    ],
  },
  {
    id: "legalitas-teknis",
    slug: "legalitas-teknis",
    title: "Legalitas Teknis",
    navLabel: "Legalitas",
    icon: Scale,
    seoTitle: "Jasa ANDALALIN, Dokumen Damkar, dan Kekayaan Intelektual",
    seoDescription:
      "Layanan pengurusan ANDALALIN, dokumen keselamatan kebakaran, rekomendasi teknis, dan kekayaan intelektual.",
    heroTitle: "Izin utama dapat memerlukan dokumen teknis pendukung.",
    heroIntro:
      "Kami membantu mengidentifikasi dokumen pendukung, instansi yang menangani, dan urutan pengajuannya sebelum proses utama dimulai.",
    summary:
      "ANDALALIN, dokumen keselamatan kebakaran, rekomendasi teknis, dan kekayaan intelektual.",
    whatsappMessage: WHATSAPP_MESSAGES.legalitasTeknis,
    narrative: [
      "Kebutuhan dokumen teknis bergantung pada jenis kegiatan, lokasi, fungsi bangunan, dan izin utama yang sedang diajukan.",
      "Kami memeriksa keterkaitan antar dokumen dan menjelaskan dokumen yang perlu dipersiapkan lebih dahulu.",
    ],
    suitableFor: [
      "Pemilik usaha yang memerlukan dokumen teknis untuk perizinan atau operasional.",
      "Pengembang, kontraktor, atau pengelola bangunan komersial.",
      "Pemilik merek, karya, atau invensi yang ingin mengidentifikasi jenis perlindungan kekayaan intelektual.",
      "Tim proyek yang perlu melengkapi dokumen sebelum pengajuan utama.",
    ],
    documents: [
      "Identitas pemohon atau dokumen badan usaha.",
      "Profil kegiatan, lokasi, fungsi bangunan, atau data proyek.",
      "Dokumen teknis yang diminta oleh instansi terkait.",
      "Bukti kepemilikan, gambar, uraian karya, atau lampiran pendukung bila diperlukan.",
    ],
    processFocus: [
      "Menentukan dokumen pendukung yang diperlukan.",
      "Memeriksa hubungan dokumen teknis dengan izin utama.",
      "Menyiapkan urutan pengajuan agar proses tidak saling menunggu.",
      "Menindaklanjuti koreksi bila instansi meminta perbaikan data.",
    ],
    services: [
      {
        name: "ANDALALIN",
        description:
          "Pendampingan dokumen analisis dampak lalu lintas sesuai jenis dan skala kegiatan.",
      },
      {
        name: "RKK dan SKK Damkar",
        description:
          "Pendampingan dokumen keselamatan kebakaran berdasarkan fungsi dan persyaratan bangunan.",
      },
      {
        name: "Rekomendasi Teknis",
        description:
          "Pendampingan dokumen teknis yang dipersyaratkan untuk pengajuan izin atau operasional.",
      },
      {
        name: "Kekayaan Intelektual",
        description:
          "Konsultasi awal untuk mengidentifikasi jenis perlindungan yang sesuai, seperti merek, hak cipta, atau paten.",
      },
      {
        name: "Dokumen Pendukung Usaha",
        description:
          "Pemetaan lampiran administratif yang diperlukan dalam pengajuan usaha.",
      },
    ],
  },
];

export interface IndustryItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const INDUSTRIES: IndustryItem[] = [
  {
    icon: Flame,
    title: "Pemilik kendaraan pribadi",
    description:
      "Membutuhkan pengurusan STNK, BPKB, balik nama, mutasi, atau penggantian dokumen.",
  },
  {
    icon: Truck,
    title: "Perusahaan dengan kendaraan operasional",
    description:
      "Memerlukan pemantauan masa berlaku dan kesesuaian data dokumen kendaraan operasional.",
  },
  {
    icon: Home,
    title: "Pemilik bangunan",
    description:
      "Membutuhkan legalitas untuk rumah, ruko, gudang, atau bangunan yang berubah fungsi.",
  },
  {
    icon: HardHat,
    title: "Pengembang dan kontraktor",
    description:
      "Perlu menentukan izin proyek, dokumen teknis, dan rekomendasi pendukung sejak awal.",
  },
  {
    icon: PenTool,
    title: "Pelaku usaha",
    description:
      "Membutuhkan dokumen legalitas untuk mendukung operasional, pengajuan, atau kerja sama.",
  },
  {
    icon: Landmark,
    title: "Pengelola aset",
    description:
      "Perlu meninjau dokumen lama sebelum aset dijual, direnovasi, atau digunakan kembali.",
  },
];

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Apakah saya perlu datang langsung untuk konsultasi awal?",
    answer:
      "Tidak selalu. Anda dapat menyampaikan kebutuhan dan kondisi dokumen melalui WhatsApp. Jika ada tahap yang memerlukan kehadiran langsung, kami akan menginformasikannya terlebih dahulu.",
  },
  {
    question: "Kapan perkiraan biaya dapat diberikan?",
    answer:
      "Perkiraan biaya diberikan setelah jenis layanan, wilayah, dan kondisi dokumen diketahui. Komponen biaya dapat berbeda jika terdapat tunggakan, perbedaan data, dokumen hilang, atau persyaratan tambahan.",
  },
  {
    question: "Apakah pengurusan dilakukan melalui jalur resmi?",
    answer:
      "Pengurusan dilakukan melalui instansi yang berwenang sesuai jenis dokumen dan wilayahnya, seperti Samsat, dinas teknis, atau lembaga terkait. Kami tidak menawarkan proses di luar prosedur resmi.",
  },
  {
    question: "Dokumen apa yang perlu saya siapkan?",
    answer:
      "Daftar dokumen berbeda untuk setiap layanan. Pada tahap awal, kami biasanya meminta informasi dasar seperti identitas, dokumen utama, wilayah pengurusan, dan kronologi bila ada masalah pada berkas.",
  },
  {
    question: "Berapa lama waktu pengurusannya?",
    answer:
      "Waktu penyelesaian bergantung pada jenis dokumen, kelengkapan berkas, wilayah, dan antrean instansi. Kami akan menjelaskan bagian yang dapat dipantau dan bagian yang harus menunggu proses instansi.",
  },
  {
    question: "Apa yang dapat dilakukan jika data atau dokumen bermasalah?",
    answer:
      "Kami perlu memeriksa sumber perbedaan atau kendalanya terlebih dahulu. Setelah itu, kami menjelaskan pilihan tindak lanjut, dokumen tambahan yang mungkin diperlukan, dan batas proses yang dapat dilakukan.",
  },
  {
    question: "Apakah layanan tersedia untuk wilayah saya?",
    answer:
      "Cakupan layanan berbeda menurut jenis dokumen dan tahap pengurusan. Sampaikan wilayah serta dokumen yang ingin diurus agar kami dapat memeriksa ketersediaan layanan dan kebutuhan kehadiran langsung.",
  },
  {
    question: "Bagaimana cara memulai konsultasi?",
    answer:
      "Hubungi kami melalui WhatsApp dan jelaskan dokumen yang ingin diurus, wilayah, serta kondisi terakhirnya. Kami akan menginformasikan dokumen awal yang perlu disiapkan.",
  },
];

export const CORPORATE_PRINCIPLES = [
  "Kami menjelaskan batas layanan dan bagian proses yang bergantung pada instansi sejak awal.",
  "Dokumen diminta sesuai kebutuhan pengurusan yang telah disepakati.",
  "Setiap rekomendasi disertai alasan dan langkah yang dapat dipahami.",
];

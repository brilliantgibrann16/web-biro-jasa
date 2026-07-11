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
    "Halo Biro Jasa Tiga Saudara, saya ingin menentukan layanan yang sesuai untuk dokumen saya.",
  proses:
    "Halo Biro Jasa Tiga Saudara, saya ingin memahami alur pemeriksaan dan pengurusan dokumen.",
  tentang:
    "Halo Biro Jasa Tiga Saudara, saya ingin mengetahui cara kerja pendampingan pengurusan dokumen.",
  faq:
    "Halo Biro Jasa Tiga Saudara, saya memiliki pertanyaan mengenai syarat atau proses pengurusan dokumen.",
  kontak:
    "Halo Biro Jasa Tiga Saudara, saya ingin memulai konsultasi dan pemeriksaan awal berkas.",
  dokumenKendaraan:
    "Halo Biro Jasa Tiga Saudara, saya ingin berkonsultasi mengenai pengurusan dokumen kendaraan.",
  perizinanBangunan:
    "Halo Biro Jasa Tiga Saudara, saya ingin berkonsultasi mengenai perizinan bangunan.",
  legalitasTeknis:
    "Halo Biro Jasa Tiga Saudara, saya ingin berkonsultasi mengenai legalitas teknis atau rekomendasi pendukung.",
  simKirNopil:
    "Halo Biro Jasa Tiga Saudara, saya ingin berkonsultasi mengenai SIM, KIR, ETLE, atau nomor cantik (NOPIL).",
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
  tagline: "Berkas dibaca dulu, proses dijalankan dengan rapi.",
  subtitle:
    "Kami membantu pemilik kendaraan, pemilik bangunan, dan pelaku usaha menyelesaikan pengurusan dokumen melalui alur yang jelas. Setiap pekerjaan dimulai dari pemeriksaan kondisi berkas, bukan dari janji yang belum tentu sesuai keadaan.",
  phone: "+62 813 6324 9533",
  whatsappNumber: WHATSAPP_NUMBER,
  whatsappUrl: (message: string = WHATSAPP_MESSAGES.default) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
  defaultWhatsappMessage: WHATSAPP_MESSAGES.default,
  hours: "Senin - Sabtu: 08.00 - 17.00 WIB",
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
    description: "Kondisi dokumen dibaca sebelum biaya dan langkah dibicarakan.",
  },
  {
    icon: Stamp,
    label: "Jalur instansi",
    description: "Pengurusan diarahkan sesuai lembaga dan aturan yang berlaku.",
  },
  {
    icon: Lock,
    label: "Berkas dijaga",
    description: "Identitas, bukti kepemilikan, dan dokumen usaha ditangani terbatas.",
  },
  {
    icon: MessageCircle,
    label: "Update seperlunya",
    description: "Klien diberi kabar saat ada status, kebutuhan, atau keputusan.",
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
      "Kami memeriksa data kendaraan, identitas pemilik, dan tujuan pengurusan lebih dulu agar proses di Samsat tidak berjalan dengan asumsi yang keliru.",
    whatsappMessage: WHATSAPP_MESSAGES.dokumenKendaraan,
    href: "/layanan/dokumen-kendaraan",
    featured: true,
  },
  {
    icon: Building2,
    title: "Perizinan Bangunan",
    scope: "PBG, SLF, PKKPR, peil banjir",
    description:
      "Untuk bangunan dan proyek, kami bantu membaca kebutuhan izin, dokumen teknis, dan urutan pengajuan agar pemilik tidak kehilangan arah di tengah proses.",
    whatsappMessage: WHATSAPP_MESSAGES.perizinanBangunan,
    href: "/layanan/perizinan-bangunan",
    featured: true,
  },
  {
    icon: Scale,
    title: "Legalitas Teknis",
    scope: "ANDALALIN, damkar, RKK, hak paten",
    description:
      "Beberapa pekerjaan membutuhkan rekomendasi teknis atau dokumen pendukung. Bagian ini kami petakan sejak awal supaya syarat utama tidak berhenti karena lampiran yang kurang.",
    whatsappMessage: WHATSAPP_MESSAGES.legalitasTeknis,
    href: "/layanan/legalitas-teknis",
  },
  {
    icon: Fingerprint,
    title: "Dokumen Pengemudi dan Kendaraan",
    scope: "SIM, KIR, ETLE, nomor cantik (NOPIL)",
    description:
      "Administrasi identitas kendaraan dan pengemudi perlu disesuaikan dengan masa berlaku, jenis kendaraan, dan kebutuhan pemilik.",
    whatsappMessage: WHATSAPP_MESSAGES.simKirNopil,
    href: "/layanan/dokumen-kendaraan",
  },
  {
    icon: Truck,
    title: "Perpindahan Daerah",
    scope: "Mutasi antar-Samsat, antar-daerah, cabut berkas semua daerah",
    description:
      "Perpindahan data kendaraan membutuhkan urutan yang tertib dari daerah asal sampai tujuan. Kami bantu menjaga agar berkas tidak salah langkah.",
    whatsappMessage: WHATSAPP_MESSAGES.mutasiKendaraan,
    href: "/layanan/dokumen-kendaraan",
  },
  {
    icon: Shield,
    title: "Dokumen Hilang",
    scope: "STNK dan BPKB",
    description:
      "Jika dokumen hilang, proses dimulai dari membaca kronologi dan bukti pendukung agar penggantian dapat diajukan dengan dasar yang tepat.",
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
    title: "Kami tidak langsung menjalankan berkas",
    description:
      "Langkah pertama selalu membaca tujuan klien, wilayah pengurusan, masa berlaku, dan kelengkapan dokumen. Dari situ baru terlihat proses yang paling masuk akal.",
    proof: "Audit awal",
  },
  {
    icon: Shield,
    title: "Yang dikejar adalah dokumen yang sah",
    description:
      "Kami menghindari cara kerja yang hanya mengejar cepat tetapi meninggalkan risiko pada pemilik dokumen. Proses harus bisa dijelaskan ulang bila suatu saat diperlukan.",
    proof: "Jalur resmi",
  },
  {
    icon: Eye,
    title: "Biaya dibicarakan setelah kondisi jelas",
    description:
      "Biaya jasa dan kebutuhan administrasi berbeda untuk setiap kasus. Klien perlu tahu sumber biayanya sebelum memutuskan untuk lanjut.",
    proof: "Transparan",
  },
  {
    icon: Clock,
    title: "Komunikasi dibuat singkat dan berguna",
    description:
      "Update tidak perlu ramai. Yang penting klien tahu status terakhir, hal yang sedang menunggu, dan dokumen tambahan bila diperlukan.",
    proof: "Tertib kabar",
  },
  {
    icon: Lock,
    title: "Dokumen pribadi tidak diperlakukan sembarangan",
    description:
      "KTP, BPKB, sertifikat, gambar teknis, dan surat usaha adalah dokumen penting. Penanganannya harus terbatas dan tercatat.",
    proof: "Kontrol berkas",
  },
  {
    icon: HeartHandshake,
    title: "Kami tetap menjelaskan sampai akhir",
    description:
      "Saat dokumen selesai, klien tidak hanya menerima hasil. Kami jelaskan poin penting, masa berlaku, dan hal yang perlu disimpan baik-baik.",
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
    title: "Kebutuhan diceritakan dulu",
    description:
      "Klien menyampaikan jenis dokumen, wilayah, kondisi terakhir, dan tujuan pengurusan.",
    detail:
      "Tahap ini penting karena kasus yang terlihat sama sering memiliki syarat berbeda saat dokumen aslinya diperiksa.",
  },
  {
    step: 2,
    icon: Search,
    title: "Berkas diperiksa satu per satu",
    description:
      "Kami membaca identitas, nomor dokumen, masa berlaku, bukti pendukung, dan catatan yang mungkin menahan proses.",
    detail:
      "Jika ada kekurangan, klien diberi daftar yang jelas sebelum proses berjalan lebih jauh.",
  },
  {
    step: 3,
    icon: Settings,
    title: "Alur resmi ditentukan",
    description:
      "Setelah kondisi berkas jelas, kami menentukan instansi, urutan pengajuan, dan perkiraan kebutuhan administrasi.",
    detail:
      "Pada tahap ini klien mendapat gambaran realistis mengenai apa yang bisa dikerjakan dan apa yang perlu menunggu.",
  },
  {
    step: 4,
    icon: ClipboardCheck,
    title: "Proses dipantau sampai ada hasil",
    description:
      "Berkas yang masuk proses dipantau, terutama saat ada verifikasi, koreksi, atau permintaan dokumen tambahan.",
    detail:
      "Update disampaikan ketika ada perkembangan yang perlu diketahui, bukan sekadar pesan formal tanpa isi.",
  },
  {
    step: 5,
    icon: PackageCheck,
    title: "Hasil akhir dicek sebelum diserahkan",
    description:
      "Nama, nomor, alamat, masa berlaku, dan keterangan penting dibaca kembali sebelum dokumen kembali ke klien.",
    detail:
      "Serah terima dilakukan dengan penjelasan ringkas agar klien memahami status dokumen yang diterima.",
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
    title: "Waktu klien dihargai",
    description:
      "Kami menyiapkan daftar kebutuhan sejak awal supaya klien tidak bolak-balik hanya karena informasi yang kurang lengkap.",
  },
  {
    icon: Shield,
    title: "Risiko administrasi dibaca lebih awal",
    description:
      "Masalah kecil pada nama, alamat, nomor rangka, atau lampiran teknis bisa berdampak besar bila terlambat ditemukan.",
  },
  {
    icon: BadgeCheck,
    title: "Hasilnya perlu bisa dipakai",
    description:
      "Dokumen akhir harus sesuai tujuan pengurusan, bukan sekadar selesai secara formal.",
  },
  {
    icon: Clock,
    title: "Respons mengikuti jam layanan",
    description:
      "Pertanyaan diarahkan melalui WhatsApp agar riwayat komunikasi tetap mudah ditelusuri.",
  },
];

export interface ServiceCategory {
  id: string;
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
    id: "kendaraan",
    slug: "dokumen-kendaraan",
    title: "Dokumen Kendaraan",
    navLabel: "Kendaraan",
    icon: Car,
    seoTitle: "Jasa Pengurusan Dokumen Kendaraan",
    seoDescription:
      "Pengurusan STNK, BPKB, balik nama, mutasi, cabut berkas, SIM, KIR, ETLE, NOPIL, dan perubahan data kendaraan dengan pemeriksaan awal.",
    heroTitle: "Pengurusan dokumen kendaraan dimulai dari data yang benar.",
    heroIntro:
      "Sebelum kendaraan diproses, kami membaca dulu siapa pemiliknya, status dokumen terakhir, wilayah Samsat, dan tujuan pengurusan. Dari situ alurnya bisa dibicarakan dengan lebih jernih.",
    summary:
      "STNK, BPKB, balik nama, mutasi, cabut berkas semua daerah, SIM, KIR, ETLE, nomor cantik (NOPIL), perubahan kendaraan, faktur, dan KTP terkait kendaraan.",
    whatsappMessage: WHATSAPP_MESSAGES.dokumenKendaraan,
    narrative: [
      "Pengurusan kendaraan sering terlihat sederhana, tetapi hambatannya biasanya muncul dari detail kecil: nama yang berbeda, alamat lama, pajak tertunda, atau berkas yang belum siap dari daerah asal.",
      "Kami membantu klien membaca kondisi itu lebih dulu. Jika proses bisa berjalan, kami jelaskan urutannya. Jika ada yang harus dilengkapi, kami sampaikan sebelum klien mengeluarkan waktu dan biaya lebih jauh.",
    ],
    suitableFor: [
      "Pemilik kendaraan pribadi yang ingin memperpanjang atau memperbarui dokumen.",
      "Pembeli kendaraan bekas yang perlu balik nama dengan data yang rapi.",
      "Perusahaan yang mengelola kendaraan operasional lintas wilayah.",
      "Pemilik kendaraan yang kehilangan STNK atau BPKB.",
    ],
    documents: [
      "Identitas pemilik lama dan pemilik baru sesuai kebutuhan proses.",
      "STNK, BPKB, faktur, kwitansi, atau bukti pendukung kepemilikan.",
      "Data kendaraan seperti nomor polisi, nomor rangka, dan nomor mesin.",
      "Dokumen tambahan bila ada mutasi, kehilangan, atau perubahan data.",
    ],
    processFocus: [
      "Membaca kecocokan data kendaraan dan identitas pemilik.",
      "Menentukan apakah proses dilakukan di Samsat asal, tujuan, atau keduanya.",
      "Menjelaskan tahap yang perlu ditunggu dan dokumen yang harus dibawa.",
      "Memeriksa kembali hasil akhir sebelum dokumen diserahkan.",
    ],
    services: [
      {
        name: "Perpanjangan STNK",
        description:
          "Perpanjangan tahunan dan lima tahunan dengan pengecekan masa berlaku, pajak, dan identitas pemilik.",
      },
      {
        name: "Pengurusan BPKB",
        description:
          "BPKB baru, perubahan data, penggantian, atau pendampingan ketika dokumen utama bermasalah.",
      },
      {
        name: "Balik Nama Kendaraan",
        description:
          "Transfer kepemilikan kendaraan bekas agar data pemilik baru tercatat dengan benar.",
      },
      {
        name: "Mutasi Antar-Samsat",
        description:
          "Perpindahan data kendaraan antar-Samsat sesuai wilayah administrasi dan tujuan pemilik.",
      },
      {
        name: "Mutasi Antar-Daerah",
        description:
          "Perpindahan data kendaraan dari daerah asal ke daerah tujuan dengan urutan administrasi yang sesuai.",
      },
      {
        name: "Cabut Berkas Semua Daerah",
        description:
          "Pengambilan berkas dari wilayah asal sebagai dasar proses mutasi ke wilayah tujuan.",
      },
      {
        name: "STNK Hilang",
        description:
          "Pendampingan penggantian STNK berdasarkan kronologi kehilangan dan bukti pendukung yang tersedia.",
      },
      {
        name: "BPKB Hilang",
        description:
          "Pendampingan penggantian BPKB berdasarkan kronologi, bukti kepemilikan, dan dokumen pendukung.",
      },
      {
        name: "SIM",
        description:
          "Pengurusan dokumen pengemudi dengan memperhatikan jenis permohonan, masa berlaku, dan data identitas.",
      },
      {
        name: "KIR",
        description:
          "Pengurusan administrasi uji berkala untuk kendaraan yang wajib KIR sesuai masa berlaku dan jenis kendaraan.",
      },
      {
        name: "ETLE",
        description:
          "Pendampingan administrasi terkait tilang elektronik berdasarkan data pelanggaran dan kendaraan.",
      },
      {
        name: "Nomor Cantik (NOPIL)",
        description:
          "Pengecekan ketersediaan dan pengurusan nomor kendaraan pilihan sesuai ketentuan yang berlaku.",
      },
      {
        name: "Perubahan Bentuk/Ganti Warna Kendaraan",
        description:
          "Pengurusan perubahan data kendaraan setelah perubahan bentuk atau warna agar dokumen mengikuti kondisi kendaraan.",
      },
      {
        name: "Faktur Mobil/Motor",
        description:
          "Pengurusan faktur kendaraan sebagai dokumen pendukung asal-usul dan administrasi mobil atau motor.",
      },
      {
        name: "Perpanjangan KTP Terkait Kendaraan",
        description:
          "Pendampingan pembaruan KTP yang diperlukan sebagai dokumen pendukung pengurusan kendaraan.",
      },
    ],
  },
  {
    id: "bangunan",
    slug: "perizinan-bangunan",
    title: "Perizinan Bangunan",
    navLabel: "Bangunan",
    icon: Building2,
    seoTitle: "Jasa Pengurusan PBG, SLF, PKKPR",
    seoDescription:
      "Pendampingan perizinan bangunan untuk PBG, SLF, PKKPR, peil banjir, dan kebutuhan legalitas fungsi bangunan.",
    heroTitle: "Izin bangunan perlu dibaca dari fungsi, lokasi, dan dokumen teknis.",
    heroIntro:
      "Untuk bangunan, proses yang tepat bergantung pada fungsi bangunan, luas, lokasi, gambar teknis, dan rencana penggunaan. Kami membantu memetakan syaratnya sebelum pengajuan berjalan.",
    summary:
      "PBG, SLF, PKKPR, peil banjir, perubahan fungsi, dan penyesuaian dokumen bangunan lama.",
    whatsappMessage: WHATSAPP_MESSAGES.perizinanBangunan,
    narrative: [
      "Setiap bangunan membawa konteks sendiri. Rumah tinggal, ruko, gudang, kantor, dan proyek komersial tidak bisa diperlakukan dengan pola yang sama.",
      "Kami membantu pemilik atau pengelola bangunan memahami dokumen apa yang sudah ada, dokumen apa yang belum siap, dan tahapan apa yang perlu dilewati agar izin tidak berhenti di tengah jalan.",
    ],
    suitableFor: [
      "Pemilik rumah, ruko, gudang, atau bangunan komersial.",
      "Developer dan kontraktor yang menyiapkan dokumen proyek.",
      "Pemilik usaha yang membutuhkan legalitas fungsi bangunan.",
      "Pengelola bangunan lama yang perlu menyesuaikan dokumen ke aturan terbaru.",
    ],
    documents: [
      "Identitas pemilik atau badan usaha.",
      "Data tanah, alamat bangunan, dan informasi pemanfaatan ruang.",
      "Gambar teknis, rencana fungsi, dan dokumen pendukung proyek.",
      "Dokumen lama seperti IMB bila akan disesuaikan dengan ketentuan baru.",
    ],
    processFocus: [
      "Membaca fungsi bangunan dan kebutuhan izin yang paling relevan.",
      "Memetakan dokumen teknis yang perlu disiapkan sebelum pengajuan.",
      "Menjelaskan urutan koordinasi dengan instansi terkait.",
      "Mengecek hasil dan catatan penting sebelum dokumen digunakan.",
    ],
    services: [
      {
        name: "PBG",
        description:
          "Persetujuan Bangunan Gedung untuk pembangunan baru, perubahan, atau penyesuaian bangunan.",
      },
      {
        name: "SLF",
        description:
          "Sertifikat Laik Fungsi untuk memastikan bangunan siap digunakan sesuai fungsi yang diajukan.",
      },
      {
        name: "PKKPR",
        description:
          "Persetujuan kesesuaian kegiatan pemanfaatan ruang berdasarkan lokasi dan rencana penggunaan.",
      },
      {
        name: "Peil Banjir",
        description:
          "Keterangan teknis ketinggian bangunan terhadap acuan banjir atau drainase setempat.",
      },
      {
        name: "IMB ke PBG",
        description:
          "Penyesuaian dokumen lama agar mengikuti ketentuan perizinan bangunan yang berlaku saat ini.",
      },
      {
        name: "Perubahan Fungsi",
        description:
          "Pendampingan ketika bangunan akan digunakan untuk fungsi yang berbeda dari dokumen awal.",
      },
    ],
  },
  {
    id: "legalitas",
    slug: "legalitas-teknis",
    title: "Legalitas Teknis",
    navLabel: "Legalitas",
    icon: Scale,
    seoTitle: "Jasa ANDALALIN, RKK, SKK Damkar, Hak Paten",
    seoDescription:
      "Pendampingan dokumen legalitas teknis seperti ANDALALIN, RKK, SKK Damkar, rekomendasi teknis, dan hak paten.",
    heroTitle: "Dokumen pendukung sering menentukan lancar tidaknya izin utama.",
    heroIntro:
      "Beberapa kebutuhan tidak berdiri sebagai izin utama, tetapi tetap menentukan apakah sebuah proses bisa lanjut. Kami membantu memetakan dokumen teknis dan legalitas pendukung sejak awal.",
    summary:
      "ANDALALIN, rekomendasi damkar, RKK, SKK, dokumen teknis, dan hak kekayaan intelektual.",
    whatsappMessage: WHATSAPP_MESSAGES.legalitasTeknis,
    narrative: [
      "Legalitas teknis biasanya muncul ketika sebuah proyek, usaha, atau aset membutuhkan pembuktian tambahan. Jika dokumen ini terlambat disiapkan, proses utama bisa tertahan.",
      "Kami membantu membaca dokumen pendukung yang relevan, menjelaskan kenapa dokumen itu dibutuhkan, dan mengarahkan proses sesuai instansi yang menangani.",
    ],
    suitableFor: [
      "Pemilik usaha yang membutuhkan rekomendasi teknis untuk operasional.",
      "Developer, kontraktor, atau pengelola bangunan komersial.",
      "Pemilik merek, karya, atau inovasi yang ingin menata hak kekayaan intelektual.",
      "Tim proyek yang perlu melengkapi dokumen sebelum pengajuan utama.",
    ],
    documents: [
      "Identitas pemohon atau badan usaha.",
      "Profil kegiatan, lokasi, fungsi bangunan, atau data proyek.",
      "Dokumen teknis yang diminta oleh instansi terkait.",
      "Bukti kepemilikan, gambar, uraian karya, atau lampiran pendukung bila diperlukan.",
    ],
    processFocus: [
      "Menentukan dokumen pendukung yang benar-benar dibutuhkan.",
      "Membaca hubungan dokumen teknis dengan izin utama.",
      "Menyiapkan urutan pengajuan agar proses tidak saling menunggu.",
      "Mengawal koreksi bila instansi meminta perbaikan data.",
    ],
    services: [
      {
        name: "ANDALALIN",
        description:
          "Analisis dampak lalu lintas untuk proyek, bangunan, atau kegiatan yang memengaruhi pergerakan kendaraan.",
      },
      {
        name: "RKK dan SKK Damkar",
        description:
          "Dokumen rekomendasi keselamatan kebakaran sesuai kebutuhan bangunan atau kegiatan usaha.",
      },
      {
        name: "Rekomendasi Teknis",
        description:
          "Pendampingan dokumen teknis yang menjadi syarat pengajuan izin atau operasional.",
      },
      {
        name: "Hak Paten dan Kekayaan Intelektual",
        description:
          "Pendampingan awal untuk pendaftaran dan perlindungan karya, merek, atau inovasi.",
      },
      {
        name: "Dokumen Pendukung Usaha",
        description:
          "Pemetaan lampiran administratif yang diperlukan agar pengajuan usaha tidak terhenti.",
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
      "Perlu menjaga masa berlaku dan data kendaraan agar administrasi armada tetap tertib.",
  },
  {
    icon: Home,
    title: "Pemilik bangunan",
    description:
      "Membutuhkan legalitas untuk rumah, ruko, gudang, atau bangunan yang berubah fungsi.",
  },
  {
    icon: HardHat,
    title: "Developer dan kontraktor",
    description:
      "Perlu memetakan izin proyek, dokumen teknis, dan rekomendasi pendukung sejak awal.",
  },
  {
    icon: PenTool,
    title: "Pelaku usaha",
    description:
      "Membutuhkan dokumen legalitas yang bisa dipakai untuk operasional, pengajuan, atau kerja sama.",
  },
  {
    icon: Landmark,
    title: "Pengelola aset",
    description:
      "Perlu membaca ulang dokumen lama sebelum aset dijual, direnovasi, atau digunakan kembali.",
  },
];

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Apakah saya harus datang langsung sejak awal?",
    answer:
      "Tidak selalu. Untuk konsultasi awal, cukup sampaikan kebutuhan dan kondisi dokumen melalui WhatsApp. Jika ada tahap yang memerlukan kehadiran fisik, kami jelaskan sejak awal agar waktu Anda bisa diatur.",
  },
  {
    question: "Kapan estimasi biaya bisa diberikan?",
    answer:
      "Estimasi diberikan setelah jenis layanan, wilayah, dan kondisi berkas dibaca. Cara ini lebih adil karena biaya pengurusan bisa berubah bila ada tunggakan, data berbeda, dokumen hilang, atau syarat teknis tambahan.",
  },
  {
    question: "Apakah semua proses melalui jalur resmi?",
    answer:
      "Ya. Pengurusan diarahkan melalui instansi yang berwenang sesuai jenis dokumen, seperti Samsat, dinas teknis, atau lembaga terkait. Kami tidak menyarankan proses yang tidak bisa dipertanggungjawabkan.",
  },
  {
    question: "Dokumen apa yang perlu saya siapkan?",
    answer:
      "Daftar dokumen berbeda untuk setiap layanan. Pada tahap awal, kami biasanya meminta informasi dasar seperti identitas, dokumen utama, wilayah pengurusan, dan kronologi bila ada masalah pada berkas.",
  },
  {
    question: "Berapa lama proses pengurusan selesai?",
    answer:
      "Waktu proses bergantung pada jenis dokumen, kelengkapan berkas, wilayah, dan antrean instansi. Kami akan menjelaskan bagian yang bisa dipantau dan bagian yang memang harus menunggu proses resmi.",
  },
  {
    question: "Bagaimana bila dokumen saya bermasalah?",
    answer:
      "Masalah dokumen perlu dibaca dulu sumbernya. Setelah itu kami jelaskan pilihan penyelesaian, dokumen tambahan yang mungkin dibutuhkan, dan risiko bila proses tetap dilanjutkan.",
  },
  {
    question: "Apakah layanan tersedia untuk wilayah saya?",
    answer:
      "Cakupan berbeda untuk setiap jenis layanan dan tahap pengurusan. Sampaikan wilayah serta dokumen yang ingin diurus; kami akan memeriksa lebih dulu apakah proses dapat dibantu dan apakah ada tahap yang memerlukan kehadiran langsung.",
  },
  {
    question: "Bagaimana cara memulai konsultasi?",
    answer:
      "Hubungi kami melalui WhatsApp, jelaskan dokumen yang ingin diurus, lalu kirim informasi awal yang diminta. Setelah berkas dibaca, kami bantu susun langkah yang paling sesuai.",
  },
];

export const CORPORATE_PRINCIPLES = [
  "Kami lebih memilih menjelaskan batas proses daripada memberi janji yang tidak bisa dijaga.",
  "Dokumen klien diperlakukan sebagai amanah administrasi, bukan sekadar berkas kerja.",
  "Setiap rekomendasi harus punya alasan yang bisa dipahami pemilik dokumen.",
];

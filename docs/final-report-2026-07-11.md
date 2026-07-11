# Laporan Akhir — Biro Jasa Tiga Saudara

Tanggal verifikasi: 11 Juli 2026  
Workspace: `C:\Users\akunb\OneDrive\Documents\WEB BIRO JASA\biro-jasa-tiga-saudara`

## Hasil utama

Sembilan route publik telah diaudit, direkomposisi, dan diverifikasi sebagai satu sistem **Editorial Authority** yang responsif. Implementasi mempertahankan Next.js App Router, React, Tailwind CSS v4, Framer Motion, Lucide, helper WhatsApp, nomor telepon, jam layanan, dan arsitektur data terpusat. Tidak ada form palsu, testimoni rekaan, angka keberhasilan rekaan, atau klaim cakupan wilayah yang belum terverifikasi.

Perbaikan utama meliputi:

- katalog kendaraan lengkap 15 layanan, perizinan bangunan 6 layanan, dan legalitas teknis 5 layanan;
- metadata unik pada seluruh route, Open Graph/Twitter card, icon TS, dan social image editorial;
- canonical hanya diterbitkan setelah `NEXT_PUBLIC_SITE_URL` berisi origin produksi asli;
- theme light/dark yang stabil saat hard refresh tanpa hydration warning;
- drawer mobile dengan focus management, focus trap, Escape, return focus, dan background inert;
- hero mobile khusus, variasi masthead per fungsi halaman, preview proses tiga bab di homepage, dan proses penuh lima tahap di `/proses`;
- section yang tidak lagi bergantung pada pola card/ledger berulang;
- CTA WhatsApp kontekstual dan terpusat;
- token kontras, focus ring, skip link, reduced-motion, JSON-LD aman, dan header `X-Powered-By` dinonaktifkan.

## Skor visual sebelum dan sesudah

Skor akhir memakai rubrik subjektif yang sama dengan audit awal: komposisi editorial, kekhasan ritme halaman, bebas anti-pattern template, dan kualitas mobile.

| Route | Awal | Akhir | Perubahan utama |
| --- | ---: | ---: | --- |
| `/` | 7.2 | 9.3 | Hero mobile khusus, dossier muncul di viewport awal, proses ringkas tiga bab, dan section lebih bervariasi. |
| `/layanan` | 6.4 | 9.1 | Masthead indeks, tiga kategori sebagai ruang kerja, dan hierarki katalog yang lebih tegas. |
| `/layanan/dokumen-kendaraan` | 6.0 | 9.2 | Katalog faktual lengkap 15 item dan struktur editorial detail yang mudah dipindai. |
| `/layanan/perizinan-bangunan` | 6.6 | 9.0 | Narasi, katalog enam item, pemeriksaan berkas, dan fokus proses terpisah jelas. |
| `/layanan/legalitas-teknis` | 6.5 | 9.0 | Terminologi konsisten, katalog lima item, dan konteks teknis tidak lagi generik. |
| `/proses` | 5.2 | 9.2 | Halaman kini unik dengan lima tahap penuh; tidak lagi menduplikasi homepage. |
| `/tentang` | 5.8 | 8.8 | Menjadi manifesto kerja yang khas tanpa mengarang sejarah atau angka perusahaan. |
| `/faq` | 6.8 | 9.0 | Masthead pertanyaan, accordion aksesibel, serta klaim luar kota dinetralkan. |
| `/kontak` | 6.1 | 9.1 | WhatsApp-first yang fokus, topik konsultasi berbentuk editorial ledger, tanpa pengulangan CTA berlebihan. |

## Bukti QA

| Pemeriksaan | Hasil |
| --- | --- |
| ESLint | Lulus tanpa error atau warning. |
| Next.js production build | Lulus; 15 static outputs dibuat, termasuk 9 route publik dan endpoint social image. |
| Lighthouse mobile — Performance | **94** |
| Lighthouse mobile — Accessibility | **100** |
| Lighthouse mobile — Best Practices | **100** |
| Lighthouse mobile — SEO | **100** |
| Responsive matrix | **54/54 lulus**: 9 route × 375, 390, 768, 1024, 1440, dan 1920 px. |
| Horizontal overflow | 0 px pada seluruh 54 kombinasi. |
| Runtime/console | Tidak ada console error, warning hydration, atau page error. |
| Metadata | 9/9 lengkap dan 9 judul unik; canonical lokal sengaja ditunda. |
| Katalog layanan | 15 kendaraan, 6 bangunan, 5 legalitas teknis. |
| Social images | `/opengraph-image` dan `/twitter-image`: 200, PNG, 2.197.498 byte. |
| Keyboard/accessibility | Theme persistence, drawer focus/inert/Escape/return focus, skip link, dan reduced-motion lulus. |

Catatan: Lighthouse berhasil menulis laporan JSON dan seluruh skor di atas valid. Proses CLI mengembalikan exit code 1 hanya ketika `chrome-launcher` gagal menghapus folder sementara Windows setelah laporan selesai; ini bukan kegagalan audit halaman.

## Screenshot before/after

Baseline dan hasil akhir tersedia sebagai pasangan full-page desktop 1440 px dan mobile 390 px untuk seluruh route:

- baseline: `output/playwright/before/`
- hasil final: `output/playwright/after/`
- bukti dark theme: `output/playwright/after/layanan-dark-final-mobile-390.png`

File per route memakai slug yang sama, misalnya:

- `home-desktop-1440.png` dan `home-mobile-390.png`
- `layanan-desktop-1440.png` dan `layanan-mobile-390.png`
- `dokumen-kendaraan-desktop-1440.png` dan `dokumen-kendaraan-mobile-390.png`
- `perizinan-bangunan-*`, `legalitas-teknis-*`, `proses-*`, `tentang-*`, `faq-*`, dan `kontak-*`

## Commit implementasi

- `ffd4d91` — `docs: record editorial authority audit`
- `7b7787e` — `chore: clean production scaffolding`
- `62ed667` — `feat: add editorial design system and metadata`
- `dc17039` — `feat: rebuild service experience across routes`

## Data klien yang masih dibutuhkan

Bagian berikut sengaja tidak dikarang dan tetap menjadi TODO:

1. origin/domain produksi asli untuk `NEXT_PUBLIC_SITE_URL`;
2. alamat kantor lengkap;
3. cakupan wilayah layanan yang terverifikasi;
4. nama badan usaha dan nomor legalitas/izin yang boleh dipublikasikan;
5. testimoni nyata dengan izin publikasi;
6. statistik historis yang dapat dibuktikan.

Deployment tidak dijalankan karena domain, target hosting, dan kredensial produksi tidak diberikan. Setelah domain tersedia, salin `.env.example` menjadi `.env.local`, isi `NEXT_PUBLIC_SITE_URL`, build ulang, lalu deploy ke target hosting yang dipilih.

## Catatan preservasi

`public/hero-permit-asset-v2.png` adalah file lama yang tidak lagi dirujuk oleh UI. File tersebut sengaja tidak dihapus, tidak diubah, dan tidak dimasukkan ke commit agar aset milik pengguna tetap terjaga.

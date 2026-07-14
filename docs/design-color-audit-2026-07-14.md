# Audit Desain dan Warna Lanjutan — 14 Juli 2026

Repo: `biro-jasa-tiga-saudara`

Referensi visual:

- `20260713-1839-32.7455366.mp4` — arah light mode yang dipilih;
- `20260713-1840-43.8606142.mp4` — pembanding kontinuitas halaman;
- `20260713-1843-23.9316836.mp4` — bukti banding paling kuat pada layanan, dark mode, dan kontak.

## Keputusan art direction

Situs memakai satu kanvas editorial untuk seluruh isi halaman. Pergantian warna full-width hanya dipakai sebagai bookend pada header dan footer. Hierarki di dalam konten dibangun lewat whitespace, skala tipografi, garis tipis, dan panel lokal; bukan lewat tumpukan section dengan warna berbeda.

Home tetap memiliki atmosfer gradient karena berfungsi sebagai pembuka brand, tetapi nilainya ditarik mendekati warna kanvas dan transisinya dibuat gradual.

## Diagnosis sebelum perbaikan

Masalah utamanya bukan satu kode warna, melainkan semantic drift:

- `paper`, `warm-50`, dan `surface` dipakai bergantian sebagai background section penuh;
- ketiganya hampir sama pada light mode, tetapi berubah menjadi tiga navy berbeda pada dark mode;
- hero layanan memakai navy fixed sehingga light mode terlihat seperti mixed-theme;
- halaman kontak berurutan ink → paper → navy → warm → footer;
- dua bidang tembaga vertikal pada hero/form kontak membuat perbedaan section semakin keras;
- Navbar menebak warna hero berdasarkan pathname, sehingga route seperti privasi dan 404 berisiko memakai kontras yang salah.

## Sistem surface final

| Fungsi | Light | Dark | Aturan |
| --- | --- | --- | --- |
| Page canvas | `#FBFAF7` | `#07111F` | Semua section full-width publik |
| Header | `#FFFDF8` | `#080D16` | Bookend atas, konsisten pada semua route |
| Footer | `#F4EFE6` | `#080D16` | Bookend bawah |
| Panel | `#FFFDF8` | `#111C2D` | Kartu, form, dan objek lokal |
| Inset | `#F4EFE6` | `#0D1A2C` | Aside kecil di dalam section |
| Dossier | `#FFF8EB` | `#2B2926` | Metafora dokumen yang adaptif terhadap theme |
| Teks utama | `#101725` | `#FFFAF0` | Heading dan body kuat |
| Teks tembaga kecil | `#8F451C` | `#D79A55` | Eyebrow dan link penting |

Tembaga `#B8642A` tetap dipakai untuk fill tombol atau elemen besar, bukan teks kecil pada background terang.

## Perbaikan yang diterapkan

1. Menambahkan token semantic `page`, `panel`, `inset`, `site-header`, `site-footer`, dan `site-chrome-line`.
2. Mengubah seluruh root section publik menjadi `bg-page`.
3. Menahan `bg-panel` dan `bg-inset` hanya pada objek yang berada di dalam kanvas.
4. Mengubah seluruh variant `PageHero` menjadi theme-aware tanpa menghilangkan layout masing-masing.
5. Menghapus hero navy fixed serta gradient hard-coded pada tiga halaman detail layanan.
6. Mengganti service dossier fixed-paper menjadi token dossier adaptif.
7. Mengubah hero dan outer form kontak menjadi page canvas, serta menghapus dua bidang tembaga vertikal.
8. Mengubah kartu form kontak dan kartu editorial menjadi panel lokal dengan border halus.
9. Menyatukan Navbar pada surface header yang eksplisit dan menghapus heuristik warna berdasarkan pathname.
10. Menyatukan Footer pada satu strategi token tanpa override `dark:*` paralel.
11. Menghapus token fixed-paper yang tidak lagi dipakai.
12. Memperhalus gradient hero home agar bertemu kanvas tanpa hard cut.

Admin tidak diubah: shell warm dan paper cards tetap menjadi sistem terpisah karena konteksnya dashboard, bukan halaman editorial publik.

## Hasil per route

| Route | Light | Dark |
| --- | --- | --- |
| Home | Gradient pembuka halus → satu kanvas → footer warm | Gradient navy halus → satu navy → footer ink |
| Layanan | Satu warm-white; cards lokal | Satu navy; cards lokal |
| 3 detail layanan | Tidak ada mixed-theme navy hero | Tidak ada band navy/paper/warm |
| Proses | Hero, timeline, charter, CTA menyatu | Seluruh isi satu navy |
| Tentang | Kontinuitas dipertahankan | Kontinuitas dipertahankan |
| FAQ | Hero, accordion, CTA menyatu | Seluruh isi satu navy |
| Kontak | Tidak lagi dark/light/dark/light | Tidak lagi empat tingkat navy |
| Privasi dan 404 | Kontras Navbar benar, satu kanvas | Satu navy dengan footer ink |

## Bukti QA

- 10 route × 2 theme × desktop 1440×900: **20/20 lulus**.
- 10 route × 2 theme × mobile 390×844: **20/20 lulus**.
- Seluruh 40 kombinasi memiliki:
  - tepat satu H1 terlihat;
  - horizontal overflow `0`;
  - tepat satu warna background section utama;
  - header/footer sesuai token bookend.
- Computed colors:
  - light content `rgb(251, 250, 247)`;
  - light header `rgb(255, 253, 248)`;
  - light footer `rgb(244, 239, 230)`;
  - dark content `rgb(7, 17, 31)`;
  - dark header/footer `rgb(8, 13, 22)`.
- Closing overlay hero home pada dark mode, background hero, dan section sesudahnya sama-sama resolve ke `rgb(7, 17, 31)`; tidak ada strip panel tersisa di batas section.
- Lighthouse mobile pada kontak dan detail layanan:
  - Accessibility **100**;
  - Best Practices **100**;
  - Color Contrast **lulus**;
  - tidak ada binary accessibility failure.
- Theme toggle, persistence, mobile drawer, focus return, dan perubahan surface saat drawer terbuka lulus.

Artefak visual lokal berada di `output/playwright/color-redesign/` dan tidak masuk bundle maupun commit.

## Penilaian akhir

Sistem warna sekarang mengikuti pola editorial kontemporer yang lebih restrained: satu canvas, kontras lokal yang fungsional, dan chrome sebagai frame. Identitas copper/navy tetap kuat tanpa membuat halaman terasa seperti gabungan beberapa theme. Layanan dan kontak sekarang berada dalam bahasa visual yang sama dengan halaman referensi light mode pertama.

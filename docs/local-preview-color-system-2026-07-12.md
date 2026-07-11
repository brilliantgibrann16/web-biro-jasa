# Laporan Preview Lokal dan Sistem Warna

Tanggal: 12 Juli 2026

Status: **selesai untuk scope lokal; preview production tersedia di
`http://localhost:3100`**

## Yang dikerjakan

- Membuat satu admin permanen melalui Supabase Admin API dengan
  `app_metadata.role = "admin"` pada request pembuatan awal.
- Membuktikan login aplikasi di `/admin/login` dan akses dashboard dengan respons
  HTTP 200.
- Menetapkan retensi inquiry 12 bulan dalam satu policy database yang mudah
  diubah, dengan purge otomatis harian dan fungsi purge manual yang sama.
- Menyamakan `NEXT_PUBLIC_SITE_URL`, Supabase Auth Site URL, dan redirect lokal
  ke `http://localhost:3100` selama domain asli belum tersedia.
- Menambahkan token warna semantik untuk lima status admin serta state
  danger, warning, dan success dalam light/dark theme.
- Mengganti kelas Tailwind palette mentah pada status, error, dan feedback admin
  dengan token bernama.
- Memperbarui pemberitahuan privasi dan dokumentasi operasional.
- Menjalankan build production dan mempertahankan server lokal pada port 3100.

Credential admin hanya ditampilkan satu kali di terminal operator. Email dan
password tidak dicatat di repository, laporan, screenshot, commit, atau
environment client.

## Sistem warna setelah perbaikan

| Peran | Arah warna |
| --- | --- |
| Baru | copper/terracotta lembut |
| Diproses | steel-blue hangat |
| Menunggu dokumen | ochre teredam |
| Selesai | sage teredam |
| Dibatalkan | neutral stone |
| Danger/error | brick red teredam |

Semua pasangan teks dan permukaan token baru melewati rasio kontras minimum
WCAG AA untuk teks normal. Rasio terendah yang dihitung adalah 5,48:1 pada
light theme dan 8,75:1 pada dark theme.

Audit seluruh `src/` menghasilkan nol kelas palette kromatik bawaan Tailwind
di luar token (`red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`,
`teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`,
dan `rose`), serta nol arbitrary hex/RGB pada area admin. Kelas `neutral-*`
tetap merupakan token proyek karena seluruh skalanya dipetakan ulang ke
`--theme-neutral-*` di `globals.css`. Pengecualian yang disengaja:

- `text-white` dan putih transparan tetap digunakan di atas permukaan brand
  gelap yang tetap karena memberi kontras tinggi;
- gradient/hex/rgba pada Hero, PageHero, Process, Featured, dan Footer adalah
  artwork brand yang sudah ada, bukan warna state UI;
- warna inline pada `src/app/icon.tsx` mencerminkan token brand karena generator
  image tidak dapat membaca CSS custom property saat render.

## Retensi inquiry

Migration `20260712050000_add_inquiry_retention_policy.sql` menambahkan:

- singleton `private.inquiry_retention_policy` dengan `retention_months = 12`;
- fungsi terbatas `private.purge_expired_inquiries()`;
- job aktif `purge-expired-inquiries-daily` pukul 02:30 UTC atau 09:30 WIB.

Migration lanjutan `20260712053000_allow_retention_service_role_invocation.sql`
memberi `USAGE` schema yang diperlukan agar grant eksekusi fungsi kepada
`service_role` benar-benar konsisten. Schema tetap tidak dibuka untuk `anon`
atau `authenticated`, dan aplikasi tetap tidak menyimpan atau memakai service
role key.

Perubahan masa retensi cukup dilakukan pada satu nilai di policy tersebut.
Enforcement dibuktikan dengan membuat fixture berumur 13 bulan: purge menghapus
1 dari 1 row dan tidak menyisakan fixture kedaluwarsa. Seluruh fixture QA lalu
dibersihkan.

## Evidence screenshot

- Before status: `output/playwright/color-system/before-admin-statuses.png`
- After status: `output/playwright/color-system/after-admin-statuses.png`
- Before error: `output/playwright/color-system/before-admin-error.png`
- After error: `output/playwright/color-system/after-admin-error.png`

Screenshot status berasal dari dashboard asli dengan fixture sementara.
Screenshot error adalah simulasi visual yang memakai kelas komponen produksi,
karena memutus koneksi Supabase asli hanya untuk mengambil gambar akan mengubah
state eksternal yang tidak perlu. Fixture inquiry dan akun QA sementara telah
dihapus; hanya admin permanen yang tetap ada.

## Verifikasi definition of done

| Poin | Bukti | Hasil |
| --- | --- | --- |
| Admin permanen dengan claim sejak awal | Initial Admin API payload memuat role; login aplikasi 200; dashboard 200 | Lulus |
| Credential hanya di terminal | Tidak ada credential di file, laporan, screenshot, atau commit | Lulus |
| Retensi 12 bulan, satu sumber | Policy singleton, cron aktif, purge fixture 13 bulan 1/1 | Lulus |
| URL preview lokal konsisten | App URL, Auth Site URL, dan redirect memakai `localhost:3100` | Lulus |
| Production preview | Home, privasi, robots, dan sitemap merespons build production | Lulus |
| Status memakai token | Lima status memakai token `status-*` | Lulus |
| Error memakai token | Semua feedback admin memakai token `state-*` | Lulus |
| Audit seluruh `src/` | Raw palette 0; arbitrary admin color 0; pengecualian terdokumentasi | Lulus |
| Before/after tersedia | Empat screenshot status dan error tersedia | Lulus |
| Lint | `npm run lint` tanpa error/warning | Lulus |
| Typecheck | `npm run typecheck` | Lulus |
| Build | `npm run build`; 21 page output dan seluruh route terdaftar | Lulus |
| Client secret scan | 22 client bundle bersih | Lulus |
| Dependency audit | 0 vulnerability | Lulus |
| Database lint | No schema errors found | Lulus |

Browser QA after-state juga lulus pada dark theme mobile: overflow horizontal 0,
satu H1 terlihat, console error 0, page error 0, dan seluruh token status terbaca
sesuai nilai dark theme.

Commit implementasi:

- `37ca729` — `feat: enforce twelve month inquiry retention`
- `e9b71d2` — `refactor: unify semantic admin colors`

## Yang sengaja tidak disentuh

- Arah desain Editorial Authority dan artwork publik yang sudah disetujui.
- Arsitektur katalog/data di `constants.ts`.
- Boundary RLS, proxy admin, dan route security yang sudah lulus audit.
- Public signup, upload dokumen sensitif, payment, portal pelanggan, role admin
  bertingkat, tracking invasif, dan klaim bisnis yang belum terverifikasi.

## Yang masih menunggu pemilik bisnis

Tiga keputusan/aksi bisnis tetap tersisa:

1. memilih domain asli;
2. memilih dan memberi akses target hosting;
3. menjalankan deploy ke origin asli.

Saat domain diputuskan, ganti bersama-sama `NEXT_PUBLIC_SITE_URL`, Supabase Auth
Site URL, dan redirect URL dari localhost ke origin HTTPS produksi, lalu ulangi
smoke test login admin pada domain tersebut.

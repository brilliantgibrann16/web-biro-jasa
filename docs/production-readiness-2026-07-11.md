# Production Readiness — Biro Jasa Tiga Saudara

Tanggal pekerjaan: 11–12 Juli 2026

Project Supabase: `ybsyxuugydemuznobiaf` (`ap-southeast-1`)

Status: **preview production lokal siap di `http://localhost:3100`; go-live hanya menunggu domain, hosting, dan deploy ke origin asli**

## Ruang lingkup final

Website menyediakan:

- sembilan route editorial publik dan katalog 26 layanan;
- formulir inquiry di `/kontak` yang mencoba mencatat data ke Supabase lalu
  membuka WhatsApp;
- validasi server, honeypot, batas body, dan rate limit aplikasi;
- pemberitahuan privasi yang menjelaskan aliran data dan retensi inquiry 12 bulan;
- login admin manual tanpa sign-up;
- dashboard inquiry dengan filter, pagination 25 baris, detail, telepon,
  WhatsApp, status, dan catatan internal;
- loading, empty, error, 404, robots, dan sitemap state;
- metadata serta social image yang sudah terpusat.

## Security model

- Role `anon` hanya mendapat grant/policy untuk `INSERT` kolom inquiry publik.
- Role `anon` tidak dapat membaca, memperbarui, atau menghapus inquiry, serta
  tidak dapat mengisi `status` atau `handled_note`.
- User `authenticated` biasa tidak mendapat akses inquiry.
- Aplikasi, proxy, API admin, dan policy RLS mensyaratkan
  `app_metadata.role = "admin"`.
- Admin mutations memeriksa sesi server-side dan same-origin request.
- Update admin memakai `updated_at` sebagai optimistic concurrency token dan
  mengembalikan HTTP 409 bila data berubah di sesi lain.
- Logout hanya mengakhiri sesi browser aktif (`scope: "local"`).
- Aplikasi tidak menggunakan service-role key.
- Header CSP, frame denial, MIME sniffing protection, referrer policy, dan
  permissions policy diterapkan oleh Next.js.
- PostCSS dikunci ke versi patched melalui npm override; jangan hapus override
  tanpa audit dependency baru.

## Environment preview lokal dan production

Hanya tiga variable aplikasi yang perlu diisi:

```dotenv
NEXT_PUBLIC_SITE_URL=https://DOMAIN-ASLI
NEXT_PUBLIC_SUPABASE_URL=https://ybsyxuugydemuznobiaf.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

Untuk preview production lokal, ketiga URL saat ini menggunakan origin
`http://localhost:3100`. Jalankan `npm run build` lalu `npm start -- -p 3100`.
Sebelum live, ganti `NEXT_PUBLIC_SITE_URL`, Supabase Auth **Site URL**, dan
redirect URL dengan origin HTTPS domain asli.

`SUPABASE_TEST_ADMIN_EMAIL` dan `SUPABASE_TEST_ADMIN_PASSWORD` hanya untuk
verifier lokal. Keduanya tidak boleh dideploy. Jangan menambahkan
`SUPABASE_SERVICE_ROLE_KEY`, password admin, atau token ke environment client.

## Admin permanen

Satu admin permanen sudah dibuat melalui Supabase Admin API. Claim
`app_metadata.role = "admin"` disertakan pada request pembuatan awal, bukan
ditambal setelah user terbentuk. Login aplikasi di `/admin/login` dan akses
dashboard telah diverifikasi dengan HTTP 200.

Credential hanya ditampilkan satu kali di terminal operator dan tidak disimpan
di repository, laporan, screenshot, atau environment client. Pemilik perlu
memindahkannya ke password manager dan merotasi password apabila terminal pernah
terekspos. User tanpa claim admin tetap sengaja ditolak meskipun email/password
valid.

## Supabase sebelum live

1. Di **Authentication → Providers → Email**, pastikan pendaftaran user baru
   nonaktif.
2. Di **Authentication → URL Configuration**, isi **Site URL** dengan origin
   produksi asli dan tambahkan hanya redirect URL yang benar-benar diperlukan.
3. Pastikan migration berikut tercatat di remote:
   - `20260711124715_create_inquiries.sql`
   - `20260711223000_require_admin_claim_for_inquiries.sql`
   - `20260712050000_add_inquiry_retention_policy.sql`
   - `20260712053000_allow_retention_service_role_invocation.sql`
4. Pastikan cron `purge-expired-inquiries-daily` aktif dan policy tunggal tetap
   berisi `retention_months = 12`.
5. Jalankan remote DB lint dan live security verifier dari mesin operator.
6. Hapus semua akun/fixture QA setelah pemeriksaan.

## Checklist deployment

1. Tentukan domain dan target hosting; deployment belum dijalankan dari fase ini.
2. Hubungkan repository ke Vercel atau hosting Node.js yang mendukung Next.js 16.
3. Isi variable Production dari `.env.example`; jangan unggah `.env.local`.
4. Samakan domain hosting, `NEXT_PUBLIC_SITE_URL`, dan Supabase Auth Site URL.
5. Pindahkan credential admin permanen yang sudah dibuat ke password manager.
6. Jalankan `npm ci`, lint, typecheck, build, secret scan, dan verifier.
7. Deploy production.
8. Ulangi smoke test pada domain asli:
   - halaman publik, metadata, robots, sitemap, dan social image;
   - submit form dan handoff WhatsApp;
   - login admin, filter/pagination, detail, update status, dan logout;
   - mobile 390 px, tablet, desktop 1440 px, dark mode, keyboard, dan overflow.
9. Pantau inquiry pertama bersama pemilik dan pastikan jalur WhatsApp benar.

## Yang sengaja tidak dibangun

- public signup dan akun pelanggan;
- upload KTP, STNK, BPKB, atau dokumen sensitif;
- payment/checkout;
- portal status pelanggan;
- role management multi-admin;
- tracking invasive;
- testimoni, statistik, alamat, legalitas, atau cakupan wilayah yang belum
  diberikan dan diverifikasi klien.

## Risiko dan keputusan manusia yang tersisa

- Limiter inquiry bersifat in-memory per instance dan tidak melindungi direct
  anon insert ke Data API. Jika spam nyata muncul, pindahkan write publik ke
  RPC/Edge Function atau rate limiter terdistribusi sebelum menambah kompleksitas
  lain.
- Retensi inquiry aktif selama 12 bulan melalui
  `private.inquiry_retention_policy`. Job `purge-expired-inquiries-daily`
  menegakkannya setiap hari dan fungsi purge yang sama dapat dijalankan manual.
- Alamat kantor, badan usaha/nomor izin, wilayah layanan, testimoni, dan statistik
  historis tetap kosong sampai ada sumber yang dapat dibuktikan.
- Deployment publik masih menunggu domain, target/akses hosting, dan deploy ke
  origin asli. URL preview localhost harus diganti bersamaan setelah origin
  production diketahui; karena itu statusnya **belum deployed**.

## Evidence QA

Verifikasi final diselesaikan 12 Juli 2026 terhadap build production lokal:

| Pemeriksaan | Hasil |
| --- | --- |
| `npm run lint` | Lulus tanpa error/warning |
| `npm run typecheck` | Lulus |
| `npm run build` | Lulus; 21 static pages generated dan seluruh route dinamis terdaftar |
| `npm run verify:client-secrets` | Lulus; 22 client bundle bersih |
| `npm audit --omit=dev --audit-level=moderate` | 0 vulnerability |
| Migration local/remote | Empat migration sampai `20260712053000` sejajar |
| `supabase db lint --linked --level warning` | No schema errors found |
| Live Supabase verifier | Admin claim, anon insert-only, field internal denial, admin CRUD, dan cleanup lulus |
| Admin permanen | Claim admin ada; login aplikasi HTTP 200; dashboard HTTP 200 |
| Retensi inquiry | Policy 12 bulan dan cron harian aktif; fixture 13 bulan terhapus 1/1 |
| Audit warna semantik | Palette kromatik Tailwind di luar token dan arbitrary color admin menghasilkan 0 temuan |
| Preview production lokal | `http://localhost:3100` merespons HTTP 200 |
| Hosted public signup | Ditolak HTTP 422 |
| Non-admin RLS/app login | SELECT 0 row; INSERT 403; login admin app 403 |
| Native form tanpa JavaScript | HTTP 303 ke `wa.me`, `X-Inquiry-Recorded: yes` |
| Invalid native form | HTTP 303 ke URL generik; nama/nomor tidak masuk query website |
| Body lebih dari 16 KiB | Ditolak HTTP 400 |
| Responsive browser matrix | 60/60: 10 route × 375/390/768/1024/1440/1920 px |
| Metadata/content | 10/10 lengkap dan unik; katalog 15/6/5; social image valid |
| Interaction/accessibility | Theme persistence, drawer focus/inert/Escape, skip link, dan reduced motion lulus |
| Fullstack browser | Insert→WhatsApp, fallback 503→WhatsApp, pagination, filter, kontak, update, conflict 409, logout, dan deep-link protection lulus |
| Rate limiter | `201, 201, 201, 201, 429, 429, 429` |
| Runtime | Unexpected console error 0; page error 0 |
| Security headers/utility | CSP, DENY framing, nosniff, no `X-Powered-By`, custom 404, robots, dan sitemap lulus |
| Cleanup akhir | Fixture inquiry QA 0; akun QA sementara 0; satu admin permanen tersisa; inquiry row 0 |

Runner pgTAP lokal tidak dijalankan karena Docker Server tidak tersedia pada
mesin ini. File test memiliki 24 assertion, sementara boundary yang sama
diverifikasi langsung terhadap project remote melalui REST/Auth dan remote DB
lint.

## Screenshot final

- `output/playwright/final-production/home-desktop-1440.png`
- `output/playwright/final-production/home-mobile-390.png`
- `output/playwright/final-production/contact-desktop-1440.png`
- `output/playwright/final-production/contact-mobile-390.png`
- `output/playwright/final-production/admin-login-desktop-1440.png`
- `output/playwright/final-production/admin-dashboard-desktop-1440.png`
- `output/playwright/final-production/admin-detail-desktop-1440.png`
- `output/playwright/final-production/privacy-dark-mobile-390.png`
- `output/playwright/color-system/before-admin-statuses.png`
- `output/playwright/color-system/after-admin-statuses.png`
- `output/playwright/color-system/before-admin-error.png`
- `output/playwright/color-system/after-admin-error.png`

Screenshot status admin memakai fixture inquiry dan akun QA sementara. Screenshot
error adalah simulasi visual dengan kelas komponen produksi. Seluruh fixture dan
akun QA sementara telah dihapus; admin permanen tetap aktif. Tidak ada credential
atau data pelanggan nyata di dalam evidence.

## Commit implementasi

- `024432d` — `fix: harden inquiry and admin authorization`
- `f0364b7` — `feat: polish public and admin workflows`
- `37ca729` — `feat: enforce twelve month inquiry retention`
- `e9b71d2` — `refactor: unify semantic admin colors`

Commit dokumentasi/handoff memuat file ini dan dicatat pada laporan akhir
setelah commit dibuat.

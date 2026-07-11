# Laporan Fase Fullstack — Inquiry dan Dashboard Admin

Tanggal verifikasi: 11 Juli 2026  
Repo: `C:\Users\akunb\OneDrive\Documents\WEB BIRO JASA\biro-jasa-tiga-saudara`

## Ringkasan hasil

Website publik tetap menggunakan positioning dan sistem visual Editorial Authority dari fase sebelumnya, tetapi sekarang memiliki lapisan pencatatan inquiry yang nyata. Pengunjung mengisi ringkasan kebutuhan di `/kontak`, server mencoba menyimpannya ke Supabase, lalu browser tetap membuka WhatsApp dengan pesan terisi—baik penyimpanan berhasil maupun gagal.

Pemilik bisnis dapat masuk melalui `/admin/login` memakai akun Supabase Auth yang dibuat manual. `/admin` menampilkan inquiry terbaru, filter status/kategori, empty state, tabel desktop, kartu mobile, detail inquiry, serta pembaruan status dan catatan internal.

Project Supabase yang dibuat:

- nama: `biro-jasa-tiga-saudara`
- project ref: `ybsyxuugydemuznobiaf`
- region: `ap-southeast-1`
- status saat verifikasi: `ACTIVE_HEALTHY`
- dashboard: `https://supabase.com/dashboard/project/ybsyxuugydemuznobiaf`

## Perbaikan ritme editorial

Dua dari empat section yang disebutkan dalam brief sudah diberi struktur pembuka berbeda:

1. `TrustIndicators` sekarang menjadi ledger ringkas tepat setelah hero: satu heading horizontal dan empat indikator terurut, bukan intro label–judul–paragraf yang sama.
2. `IndustriesSection` memakai index rail `01—06`, heading/description bertumpuk, lalu lead profile dan supporting profiles.

`ProcessSection` dipertahankan karena dark chapter-nya sudah menjadi jeda tonal. `WhyChooseUs` tidak dipakai pada homepage. Browser QA pada 390 dan 1440 px memastikan struktur baru, empat item trust, index rail industries, dan overflow 0.

## Fondasi database dan RLS

Migration `supabase/migrations/20260711124715_create_inquiries.sql` membuat:

- tabel `public.inquiries` dengan UUID, timestamp, field publik, status, source, dan `handled_note` internal;
- check constraints panjang input, tiga kategori layanan, dan lima status;
- trigger `updated_at` setiap update;
- index untuk urutan waktu, status, dan kategori;
- RLS aktif sejak migration pertama;
- grant kolom anon hanya untuk `full_name`, `phone`, `service_category`, `service_detail`, `region`, dan `notes`;
- policy anon hanya `INSERT` dengan default `baru`, `website-form`, dan tanpa `handled_note`;
- authenticated mendapat policy `SELECT`, `INSERT`, `UPDATE`, dan `DELETE` penuh.

Nilai kategori tidak memakai daftar kedua. `ServiceCategory.id` di `SERVICE_CATEGORIES` sekarang persis:

- `dokumen-kendaraan`
- `perizinan-bangunan`
- `legalitas-teknis`

App tidak memakai service-role/secret key. Publishable key menjalankan form sebagai role `anon`; dashboard memakai JWT user sebagai role `authenticated` sehingga RLS tetap menjadi boundary database.

## Form inquiry

Section baru di `/kontak` berada sebelum “Topik konsultasi” dan berisi:

- nama;
- nomor telepon/WhatsApp;
- kategori dari `SERVICE_CATEGORIES`;
- sub-layanan opsional dari kategori yang dipilih;
- wilayah;
- catatan singkat;
- honeypot tersembunyi.

Tidak ada upload file. Copy form secara eksplisit melarang nomor identitas dan foto KTP/STNK/BPKB.

`POST /api/inquiries` melakukan validasi server, honeypot, limiter lima request per 15 menit, dan anon insert tanpa `.select()`. Timeout, 4xx, 5xx, atau kegagalan jaringan tidak memblokir WhatsApp.

Limiter bersifat in-memory per instance. Ini cukup untuk jalur form normal, tetapi bukan pembatas global Data API. Karena definition of done mengharuskan anon dapat insert langsung, pemanggil yang sengaja melewati endpoint Next.js juga melewati limiter. Proteksi global kelak memerlukan RPC/Edge Function/pre-request policy dan pencabutan direct anon table insert.

## Auth dan dashboard

Next.js 16 menggunakan `src/proxy.ts`, bukan `middleware.ts`. Proxy menyegarkan token dan melakukan redirect optimistis untuk `/admin`, tetapi bukan satu-satunya boundary:

- `/admin` dan detail memanggil `requireAdminAuth()` sebelum query;
- login, logout, dan PATCH status memeriksa auth sendiri;
- mutation API memerlukan same-origin request;
- login memakai `getClaims()`, bukan mempercayai `getSession()`;
- `/admin/login` tidak memiliki sign-up;
- metadata admin `noindex`, `nofollow`, `noarchive`, dan `noimageindex`;
- chrome marketing/WhatsApp float tidak dirender pada route admin.

Global public signup dan anonymous sign-in Supabase dinonaktifkan. Email provider tetap aktif hanya agar akun yang dibuat manual dapat login. Password minimum disetel 12 karakter dan TOTP tetap aktif pada konfigurasi remote.

Pada verifikasi keamanan awal, akun uji sementara dibuat lalu dihapus. Follow-up
12 Juli 2026 kemudian membuat satu admin permanen melalui Admin API dengan claim
`app_metadata.role = "admin"` pada request awal. Credential hanya ditampilkan di
terminal operator dan tidak disimpan dalam repository atau laporan.

## Pengujian keamanan langsung

### Data API anon dari luar aplikasi

Request dikirim langsung ke REST Supabase memakai publishable key, bukan endpoint Next:

| Operasi | Hasil |
| --- | ---: |
| `INSERT` anon | `201` |
| `SELECT` anon | `401` |
| `UPDATE` anon | `401` |
| `DELETE` anon | `401` |
| Public sign-up | `422` / ditolak |

### Authenticated RLS verifier

`scripts/verify-supabase-security.mjs` lulus seluruh langkah:

- login akun uji;
- anon insert fixture;
- anon select/update/delete ditolak;
- authenticated select dan verifikasi default/integritas fixture;
- authenticated update status + `handled_note`;
- authenticated delete dan cleanup.

`supabase db lint --linked --level warning` menghasilkan **No schema errors found**.

File pgTAP 20 assertion tersedia di `supabase/tests/database/inquiries_rls.test.sql`. Runner `supabase test db --linked` tetap membutuhkan image Docker `pg_prove`; mesin ini tidak memiliki Docker Desktop, sehingga runner itu tidak dijalankan. Kekosongan tersebut tidak menggantikan atau mengurangi uji REST/Auth live di atas, yang benar-benar dijalankan terhadap project remote.

### Auth route dan browser

Browser nyata membuktikan:

- `/admin` tanpa cookie langsung ke `/admin/login`, tanpa data flash;
- deep-link `/admin/inquiries/<uuid>` tanpa sesi juga kembali ke login;
- login benar membuka dashboard;
- filter status dan kategori bekerja;
- detail inquiry dapat dibuka;
- status serta catatan internal tersimpan;
- logout membuat route admin terlindungi lagi;
- form sukses tersimpan dan membuka WhatsApp dengan nama/kategori/wilayah/catatan;
- API 503 simulasi tetap membuka WhatsApp;
- rate limiter menghasilkan `[201, 201, 201, 201, 429, 429, 429]`;
- unexpected console error 0 dan page error 0.

Seluruh fixture browser (3/3) dan akun admin uji sementara sudah dihapus setelah screenshot.

### Secret scan dan regression

- `npm run verify:client-secrets`: **21 file bundle client bersih**.
- `npm run lint`: lulus tanpa warning.
- `npm run typecheck`: lulus.
- `npm run build`: lulus, 18 static outputs dan seluruh admin/API route dinamis terdaftar.
- public responsive regression: **54/54** kombinasi lulus untuk 9 route pada 375/390/768/1024/1440/1920 px, overflow 0.
- Lighthouse tambahan `/kontak`: Performance 88, Accessibility 100, Best Practices 100, SEO 100. Performance bukan syarat fase ini; LCP tetap heading PageHero publik yang sengaja tidak diubah karena batasan scope.
- `npm audit`: 2 advisory moderate dari PostCSS yang dibundel Next 16.2.10; saran otomatis adalah downgrade major ke Next 9.3.3, sehingga tidak diterapkan.

## Screenshot

- `output/playwright/fullstack/contact-form-mobile-390.png`
- `output/playwright/fullstack/admin-dashboard-desktop-1440.png`
- `output/playwright/fullstack/admin-detail-desktop-1440.png`
- `output/playwright/fullstack/home-rhythm-mobile-390.png`
- `output/playwright/fullstack/home-rhythm-desktop-1440.png`

## Yang sengaja tidak dibangun

- sistem pembayaran atau checkout;
- akun pelanggan publik;
- halaman sign-up admin;
- upload foto KTP, STNK, BPKB, atau dokumen lain;
- role admin bertingkat;
- portal status pelanggan berkode referensi.

Semua item tersebut sengaja ditahan karena tidak sesuai kebutuhan fase ini atau memerlukan keputusan bisnis/security review terpisah.

## Environment production

Wajib:

```dotenv
NEXT_PUBLIC_SITE_URL=https://domain-produksi-asli.example
NEXT_PUBLIC_SUPABASE_URL=https://ybsyxuugydemuznobiaf.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

Hanya untuk verifier lokal, tidak boleh dideploy:

```dotenv
SUPABASE_TEST_ADMIN_EMAIL=
SUPABASE_TEST_ADMIN_PASSWORD=
```

Tidak ada `SUPABASE_SERVICE_ROLE_KEY` dalam environment aplikasi. Sebelum deploy, ubah `auth.site_url` dan `additional_redirect_urls` di `supabase/config.toml` dari localhost ke domain produksi, lalu jalankan `supabase config push`.

## Commit fase ini

- `4be629e` — `refactor: vary homepage section rhythm`
- `76c2201` — `feat: add Supabase inquiry data foundation`
- `88d1943` — `feat: record inquiries before WhatsApp handoff`
- `e5d9651` — `feat: add protected inquiry admin dashboard`
- `abd436f` — `test: add Supabase security verification`

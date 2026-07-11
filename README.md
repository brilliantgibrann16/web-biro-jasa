# Biro Jasa Tiga Saudara

Website lead-generation untuk Biro Jasa Tiga Saudara. Situs menjelaskan
pengurusan dokumen kendaraan, perizinan bangunan, dan legalitas teknis dengan
prinsip: berkas dipahami terlebih dahulu, lalu proses dijalankan dengan rapi.

## Stack

- Next.js 16 App Router dan React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Lucide React
- Supabase Postgres, Row Level Security, dan Supabase Auth

## Menjalankan project

```bash
npm ci
npm run dev
```

Buka `http://localhost:3000`. Untuk pemeriksaan production:

```bash
npm run lint
npm run typecheck
npm run build
npm start
```

Salin `.env.example` menjadi `.env.local`, lalu isi:

- `NEXT_PUBLIC_SITE_URL` dengan origin produksi asli untuk metadata, robots,
  sitemap, canonical, dan social preview;
- `NEXT_PUBLIC_SUPABASE_URL` dengan Project URL;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` dengan publishable key Supabase.

Saat URL produksi belum diisi, build lokal memakai origin localhost hanya untuk
preview dan tidak menerbitkan canonical atau sitemap produksi.

Project tidak memakai `SUPABASE_SERVICE_ROLE_KEY` atau `sb_secret_*` di kode
aplikasi. Dashboard hanya menerima user terautentikasi yang memiliki claim
`app_metadata.role = "admin"` dan tetap tunduk pada RLS. Form publik memakai
publishable key sebagai role `anon`.

## Struktur utama

- `src/app/` — route, metadata, dan style global
- `src/components/layout/` — navbar, footer, dan aksi WhatsApp global
- `src/components/page/` — pola hero dan halaman detail layanan
- `src/components/sections/` — section editorial lintas halaman
- `src/lib/constants.ts` — sumber data company, katalog layanan, FAQ, proses,
  dan prinsip
- `src/app/api/inquiries/` — endpoint pencatatan inquiry publik
- `src/app/admin/` — login dan dashboard inquiry internal
- `src/proxy.ts` — refresh sesi serta proteksi optimistis route admin pada
  Next.js 16
- `supabase/migrations/` — skema, trigger, grants, dan policy RLS
- `supabase/tests/database/` — pengujian pgTAP untuk tabel dan policy

## Setup Supabase

CLI Supabase harus sudah login. Hubungkan repo dan terapkan migration:

```bash
supabase link --project-ref PROJECT_REF
npm run supabase:push
```

Konfigurasi Auth pada `supabase/config.toml` mempertahankan login email untuk
akun yang dibuat manual, tetapi `auth.enable_signup = false`. Anonymous sign-in
juga nonaktif. Jangan menjalankan `supabase config push` dengan domain contoh;
isi konfigurasi produksi yang benar terlebih dahulu.

### Membuat admin permanen

Tidak ada halaman sign-up publik. Buat akun manual, lalu beri claim admin:

1. Buka Supabase Dashboard dan pilih project `ybsyxuugydemuznobiaf`.
2. Buka **Authentication → Users → Add user**.
3. Isi email pemilik bisnis dan password unik minimal 12 karakter. Tandai email
   sebagai terkonfirmasi, lalu simpan password di password manager.
4. Buka **SQL Editor**, ganti placeholder email, lalu jalankan:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"role":"admin"}'::jsonb
where lower(email) = lower('ADMIN_EMAIL_ASLI');
```

5. Pastikan perintah hanya memperbarui satu user.
6. Login melalui `/admin/login`. Jika user sempat login sebelum claim
   ditambahkan, logout lalu login ulang agar JWT baru memuat role admin.

User email/password biasa tanpa claim tersebut ditolak oleh aplikasi dan RLS.
Jangan menyimpan email admin, password, access token, atau service-role key di
repo.

### Menjaga public signup tetap nonaktif

Di Supabase Dashboard, buka **Authentication → Providers → Email** dan pastikan
pendaftaran user baru nonaktif. Repo juga menyimpan
`auth.enable_signup = false` di `supabase/config.toml`. Sebelum live,
verifikasi endpoint Auth hosted tetap menolak public sign-up.

### URL Auth produksi

Setelah domain asli tersedia, buka **Authentication → URL Configuration**:

1. set **Site URL** ke origin produksi persis, misalnya
   `https://domain-asli.tld`;
2. tambahkan hanya redirect origin/path yang benar-benar dipakai;
3. jangan mempertahankan wildcard preview yang tidak diperlukan;
4. samakan origin dengan `NEXT_PUBLIC_SITE_URL` pada hosting.

Jangan mengganti nilai production dengan domain contoh dari dokumentasi ini.

## Alur inquiry

Form di `/kontak` hanya menerima data kontak dan ringkasan kebutuhan berbentuk
teks. Form tidak menerima foto KTP, STNK, BPKB, atau unggahan dokumen lain.
Setelah percobaan penyimpanan selesai, browser meneruskan pengguna ke WhatsApp,
termasuk ketika Supabase atau jaringan gagal. Pesan fallback memberi tahu admin
bila inquiry belum sempat tercatat.

`POST /api/inquiries` memakai validasi server, honeypot, batas body, dan limiter
in-memory lima request per 15 menit per fingerprint IP/user-agent. Limiter ini
melindungi alur aplikasi normal, tetapi bukan pembatas terdistribusi lintas
instance. Karena anon masih diberi `INSERT` langsung oleh kebutuhan arsitektur
saat ini, pemanggil Data API secara sengaja juga dapat melewati limiter Next.js.
Proteksi spam global kelak memerlukan RPC/Edge Function atau pembatas Data API
terpisah.

## Verifikasi keamanan

Pengujian database lokal membutuhkan Docker/Supabase local stack:

```bash
npm run supabase:test:db
```

Verifikasi live memakai REST/Auth Supabase langsung, bukan endpoint aplikasi:

```powershell
$env:SUPABASE_TEST_ADMIN_EMAIL="<email-admin-uji>"
$env:SUPABASE_TEST_ADMIN_PASSWORD="<password-kuat-sementara>"
npm run verify:supabase
```

Script memastikan anon hanya dapat insert, user biasa tidak dapat membaca atau
memutasi data, dan user dengan claim admin dapat menjalankan CRUD fixture.
Fixture selalu dibersihkan. Setelah production build, periksa bundle client:

```bash
npm run verify:client-secrets
```

Credential pengujian tidak boleh disimpan di repo, dideploy, atau diberi prefix
`NEXT_PUBLIC_`.

## Deployment production

Checklist aman untuk Vercel atau hosting Node.js yang mendukung Next.js 16:

1. hubungkan repository dan gunakan runtime Node.js yang didukung;
2. isi tiga variable `NEXT_PUBLIC_*` dari `.env.example` pada environment
   Production; jangan deploy variable verifier;
3. samakan `NEXT_PUBLIC_SITE_URL`, domain hosting, dan Supabase Auth Site URL;
4. terapkan migration remote dari mesin operator yang sudah login ke Supabase;
5. buat admin permanen dan claim role dengan langkah di atas;
6. jalankan lint, typecheck, build, secret scan, dan verifier Supabase;
7. deploy, lalu ulangi smoke test form inquiry, handoff WhatsApp, login,
   dashboard, update status, logout, metadata, dan layout responsive pada domain
   asli.

Deployment belum dilakukan dari repo ini karena domain asli, pilihan/akses
hosting, dan credential admin permanen belum diberikan.

## Aturan konten

- Semua link WhatsApp dibuat melalui helper terpusat.
- Katalog layanan diperbarui di `SERVICE_CATEGORIES`, bukan di-hardcode pada
  komponen.
- Jangan menambahkan alamat, cakupan wilayah, testimoni, statistik, atau nomor
  legalitas tanpa sumber asli dari klien.
- Jangan menambahkan upload dokumen sensitif, checkout, atau pendaftaran akun
  publik tanpa keputusan bisnis dan security review terpisah.

## Catatan Next.js

Project menggunakan Next.js 16. Baca panduan lokal di
`node_modules/next/dist/docs/` sebelum mengubah API Next.js, routing, metadata,
image, atau konfigurasi.

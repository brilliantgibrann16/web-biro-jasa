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

Buka `http://localhost:3000` untuk development. Preview production lokal
standar project memakai port 3100:

```bash
npm run lint
npm run typecheck
npm run build
npm start -- -p 3100
```

Buka `http://localhost:3100`.

Salin `.env.example` menjadi `.env.local`, lalu isi:

- `NEXT_PUBLIC_SITE_URL` dengan origin preview atau produksi untuk metadata,
  robots, sitemap, canonical, dan social preview;
- `NEXT_PUBLIC_SUPABASE_URL` dengan Project URL;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` dengan publishable key Supabase;
- `RATE_LIMIT_TRUSTED_PROXY_HEADER` hanya setelah hosting dipastikan menimpa dan
  membersihkan header IP tersebut. Biarkan kosong pada preview langsung.

Preview saat ini memakai `NEXT_PUBLIC_SITE_URL=http://localhost:3100`.
Supabase Auth Site URL dan redirect URL remote juga sementara menunjuk ke origin
tersebut. Ketiganya wajib diganti bersamaan ketika domain asli tersedia.

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

Admin permanen sudah dibuat melalui Supabase Admin API dengan
`app_metadata.role = "admin"` pada request pembuatan pertama. Login nyata
melalui aplikasi dan akses dashboard telah diverifikasi. Credential tidak
disimpan di repo; pemilik harus menyimpannya di password manager.

Jika admin perlu diganti, buat penggantinya melalui Admin API dengan claim
tersebut sejak awal. Jangan membuat user authenticated biasa lalu memberi claim
belakangan. User tanpa claim admin tetap ditolak oleh aplikasi dan RLS.

### Menjaga public signup tetap nonaktif

Di Supabase Dashboard, buka **Authentication → Providers → Email** dan pastikan
pendaftaran user baru nonaktif. Repo juga menyimpan
`auth.enable_signup = false` di `supabase/config.toml`. Sebelum live,
verifikasi endpoint Auth hosted tetap menolak public sign-up.

### URL Auth produksi

Untuk preview, Site URL dan redirect URL saat ini adalah
`http://localhost:3100`. Setelah domain asli tersedia, buka
**Authentication → URL Configuration**:

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

## Retensi inquiry

Inquiry disimpan selama **12 bulan sejak `created_at`**, lalu dihapus permanen.
Satu-satunya nilai operasional disimpan pada singleton row
`private.inquiry_retention_policy`. Job `pg_cron`
`purge-expired-inquiries-daily` menjalankan penghapusan setiap hari pukul
02.30 UTC (09.30 WIB).

Untuk mengubah masa retensi, operator menjalankan satu update berikut melalui
Supabase SQL Editor, lalu menyesuaikan copy pemberitahuan privasi:

```sql
update private.inquiry_retention_policy
set retention_months = 12, updated_at = now()
where id = true;
```

Purge manual yang memakai nilai policy yang sama:

```sql
select private.purge_expired_inquiries();
```

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
5. pastikan credential admin permanen tersimpan di password manager dan login
   berhasil pada origin production;
6. jalankan lint, typecheck, build, secret scan, dan verifier Supabase;
7. deploy, lalu ulangi smoke test form inquiry, handoff WhatsApp, login,
   dashboard, update status, logout, metadata, dan layout responsive pada domain
   asli.
8. verifikasi reverse proxy membersihkan header IP dari client, lalu isi
   `RATE_LIMIT_TRUSTED_PROXY_HEADER`; pada deployment multi-instance, ganti
   limiter in-memory dengan penyimpanan terdistribusi.

Deployment belum dilakukan dari repo ini karena domain asli serta pilihan/akses
hosting belum diberikan.

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

# Biro Jasa Tiga Saudara

Website lead-generation untuk Biro Jasa Tiga Saudara. Situs menjelaskan pengurusan dokumen kendaraan, perizinan bangunan, dan legalitas teknis dengan posisi utama: **berkas dibaca dulu, proses dijalankan dengan rapi**.

## Stack

- Next.js 16 App Router dan React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Lucide React
- Supabase Postgres, Row Level Security, dan Supabase Auth

## Menjalankan project

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Untuk pemeriksaan production:

```bash
npm run lint
npm run build
npm start
```

Salin `.env.example` menjadi `.env.local`, lalu isi:

- `NEXT_PUBLIC_SITE_URL` dengan origin produksi asli untuk canonical dan social preview;
- `NEXT_PUBLIC_SUPABASE_URL` dengan Project URL;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` dengan publishable key Supabase.

Saat URL produksi belum diisi, build lokal memakai `http://localhost:3000`
hanya sebagai basis preview lokal dan tidak menerbitkan canonical produksi.

Project tidak memakai `SUPABASE_SERVICE_ROLE_KEY` atau `sb_secret_*` di kode
aplikasi. Dashboard bekerja sebagai user `authenticated` dan tetap tunduk pada
RLS; form publik memakai publishable key sebagai role `anon`.

## Struktur utama

- `src/app/` — route, metadata, dan style global
- `src/components/layout/` — navbar, footer, dan aksi WhatsApp global
- `src/components/page/` — pola hero dan halaman detail layanan
- `src/components/sections/` — section editorial yang dipakai lintas halaman
- `src/lib/constants.ts` — sumber data company, katalog layanan, FAQ, proses, dan prinsip
- `src/app/api/inquiries/` — endpoint pencatatan inquiry publik
- `src/app/admin/` — login dan dashboard inquiry internal
- `src/proxy.ts` — refresh sesi serta redirect optimistis route admin pada Next.js 16
- `supabase/migrations/` — skema, trigger, grants, dan policy RLS
- `supabase/tests/database/` — pengujian pgTAP untuk tabel dan policy

## Setup Supabase

CLI Supabase harus sudah login, lalu hubungkan repo dan terapkan migration:

```bash
supabase link --project-ref PROJECT_REF
npm run supabase:push
```

Konfigurasi Auth pada `supabase/config.toml` mempertahankan login email untuk
akun yang dibuat manual, tetapi `auth.enable_signup = false`. Anonymous sign-in
juga nonaktif. Terapkan perubahan config dengan:

```bash
supabase config push --project-ref PROJECT_REF
```

### Membuat admin pertama

Tidak ada halaman sign-up publik. Buat akun secara manual:

1. Buka Supabase Dashboard.
2. Pilih **Authentication → Users → Add user**.
3. Isi email pemilik bisnis dan password kuat minimal 12 karakter.
4. Tandai email sebagai terkonfirmasi, lalu login melalui `/admin/login`.

Siapa pun yang berhasil login dianggap admin pada versi ini. Karena itu public
signup wajib tetap nonaktif.

## Alur inquiry

Form baru di `/kontak` hanya menerima data kontak dan deskripsi kebutuhan dalam
bentuk teks. Form tidak menerima foto KTP, STNK, BPKB, atau unggahan dokumen
lain. Setelah percobaan penyimpanan selesai, browser selalu meneruskan pengguna
ke WhatsApp—termasuk ketika Supabase atau jaringan sedang gagal.

Endpoint `/api/inquiries` memakai honeypot dan limiter in-memory lima request per
15 menit per fingerprint IP/user-agent. Batas ini melindungi alur form normal,
tetapi bukan rate limit global terdistribusi: karena definition of done memang
mengizinkan role anon melakukan `INSERT` langsung, orang yang sengaja memanggil
Data API Supabase dapat melewati endpoint Next.js. Jika kelak perlu proteksi
spam global, direct anon insert harus diganti RPC/Edge Function atau pembatas
Data API terpisah.

## Verifikasi keamanan

Pengujian database lokal membutuhkan Docker/Supabase local stack:

```bash
npm run supabase:test:db
```

Verifikasi live memakai REST/Auth Supabase langsung, bukan endpoint aplikasi:

```powershell
$env:SUPABASE_TEST_ADMIN_EMAIL="admin@example.com"
$env:SUPABASE_TEST_ADMIN_PASSWORD="password-admin"
npm run verify:supabase
```

Script memastikan anon hanya dapat insert dan user authenticated dapat
select/update/delete fixture. Fixture selalu dibersihkan. Setelah production
build, pastikan tidak ada secret pada bundle client:

```bash
npm run verify:client-secrets
```

Credential pengujian tidak boleh disimpan di repo atau diberi prefix
`NEXT_PUBLIC_`.

## Aturan konten

- Semua link WhatsApp dibuat melalui `COMPANY.whatsappUrl()`.
- Katalog layanan harus diperbarui di `SERVICE_CATEGORIES`, bukan di-hardcode pada komponen.
- Jangan menambahkan alamat, cakupan wilayah, testimoni, statistik, atau nomor legalitas tanpa sumber asli dari klien.
- URL produksi diperlukan sebelum canonical, sitemap absolut, dan `metadataBase` dapat ditetapkan.
- Jangan menambahkan upload dokumen sensitif, checkout, atau pendaftaran akun publik tanpa keputusan bisnis dan security review terpisah.

## Catatan Next.js

Project menggunakan Next.js 16. Baca panduan lokal yang relevan di `node_modules/next/dist/docs/` sebelum mengubah API Next.js, routing, metadata, image, atau konfigurasi.

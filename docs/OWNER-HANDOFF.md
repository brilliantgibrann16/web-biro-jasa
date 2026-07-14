# Panduan Pemilik, Preview Klien, dan Go-Live

Terakhir diperbarui: 14 Juli 2026
Project: Biro Jasa Tiga Saudara

Dokumen ini ditulis untuk pemilik usaha yang tidak perlu mengedit kode sendiri.
Gunakan penanda berikut:

- **[SUDAH]** sudah tersedia atau sudah dikonfigurasi pada project saat ini;
- **[WAJIB]** harus selesai sebelum website diumumkan sebagai website produksi;
- **[OPSIONAL]** berguna, tetapi website tetap dapat berjalan tanpanya;
- **[HANYA JIKA FITUR DIAKTIFKAN]** jangan dikerjakan untuk rilis sekarang.

## Jawaban singkat

1. **Anda tidak perlu mengedit file TypeScript, SQL, atau CSS untuk rilis
   normal.** Pekerjaan manual pemilik adalah memberikan data bisnis yang benar,
   memiliki akun/domain, menyetujui isi, menyimpan akses admin, lalu melakukan
   beberapa pengaturan melalui dashboard Vercel dan Supabase bersama
   developer.
2. **Supabase dipakai sebagai database inquiry dan sistem login admin.** Supabase
   bukan pembuat tampilan website dan bukan tempat hosting halaman utamanya.
3. **Ruang admin tidak tampil di menu publik.** Buka
   `https://DOMAIN-ANDA/admin/login`; setelah login, dashboard berada di
   `https://DOMAIN-ANDA/admin`.
4. **Tracking yang tersedia saat ini adalah tracking internal.** Admin dapat
   memberi status dan catatan pada inquiry. Pelanggan belum memiliki halaman
   untuk mengecek progres sendiri.
5. **Website belum terhubung ke hosting publik dari checkout lokal ini.** Repo
   belum memiliki Git remote dan belum tertaut ke project Vercel. Preview lokal
   yang tersedia di `http://localhost:3100` hanya dapat dibuka dari komputer
   yang menjalankannya.
6. **Vercel CLI sudah terpasang, tetapi session lokalnya tidak valid.** Deploy
   melalui Dashboard tetap dapat dilakukan. Bila developer memilih CLI, ia
   harus menjalankan `vercel login` terlebih dahulu; token tidak boleh disimpan
   di source atau dikirim melalui chat.

## Apa yang sudah tersedia dan apa yang masih manual

| Bagian | Status saat ini | Tindakan pemilik |
| --- | --- | --- |
| Website publik dan responsive layout | **[SUDAH]** | Setujui tampilan dan isi final. |
| Nomor WhatsApp `+62 813 6324 9533` | **[SUDAH DI KODE]** | **[WAJIB]** Konfirmasi nomor tersebut masih benar dan aktif. |
| Jam operasional Senin-Sabtu, 08.00-17.00 WIB | **[SUDAH DI KODE]** | **[WAJIB]** Konfirmasi jam tersebut benar. |
| Form inquiry ke database lalu WhatsApp | **[SUDAH]** | Lakukan satu pengujian nyata setelah deploy. |
| Database, RLS, retensi 12 bulan, dan cron purge | **[SUDAH]** pada project Supabase yang ditautkan | Pastikan project menjadi milik/berada di organisasi klien dan backup dipilih. |
| Admin permanen | **[SUDAH]** menurut verifikasi produksi | Simpan email/password di password manager; jangan kirim bersamaan melalui chat. |
| Login dan dashboard admin | **[SUDAH]** | Gunakan URL `/admin/login`; tidak ada link di navbar publik. |
| Domain produksi | **[BELUM]** | **[WAJIB]** Beli/tentukan domain dan putuskan domain utama (`www` atau tanpa `www`). |
| Git repository remote | **[BELUM]** | **[WAJIB]** Buat repo privat milik klien/agency lalu push commit final. |
| Hosting Vercel | **[BELUM]**; tidak ada `.vercel/project.json`, dan session Vercel CLI lokal perlu login ulang | **[WAJIB]** Import repo, isi environment variables, dan deploy. |
| URL Auth Supabase produksi | Masih memakai origin localhost pada konfigurasi repo | **[WAJIB]** Ganti ke domain HTTPS produksi sebelum go-live. |
| Alamat kantor, cakupan wilayah, legalitas usaha, testimoni, statistik | Sengaja belum dipublikasikan karena belum ada sumber yang dapat diverifikasi | **[OPSIONAL]** Berikan bukti/data resmi bila ingin ditambahkan. |
| Analytics pengunjung | Tidak dipasang | **[OPSIONAL]** Aktifkan hanya setelah menentukan kebutuhan dan memperbarui pemberitahuan privasi bila diperlukan. |
| Tracking publik untuk pelanggan | Tidak dibangun | **[HANYA JIKA FITUR DIAKTIFKAN]** Memerlukan scope dan audit keamanan terpisah. |

Project Supabase yang saat ini ditautkan memiliki ref
`ybsyxuugydemuznobiaf`. Empat migration sampai
`20260712053000_allow_retention_service_role_invocation.sql` telah dicatat dan
sebelumnya diverifikasi pada remote project. Jangan membuat project Supabase
baru kecuali memang ingin memindahkan kepemilikan atau memisahkan staging dan
production.

## Cara kerja website dalam bahasa sederhana

```text
Pengunjung membuka /kontak
          |
          v
Mengisi nama, telepon, layanan, wilayah, dan catatan singkat
          |
          v
Server memvalidasi isian dan mencoba menyimpannya ke Supabase
          |
          +------ berhasil ------> inquiry muncul di /admin dengan status "Baru"
          |
          +------ gagal ---------> data tidak muncul di /admin
          |
          v
WhatsApp tetap dibuka dengan ringkasan kebutuhan
```

### Alur inquiry publik yang persis

1. Pengunjung mengisi nama dan nomor telepon. Kategori layanan wajib dipilih;
   sub-layanan, wilayah, dan catatan bersifat opsional.
2. Browser mengirim data ke `POST /api/inquiries`.
3. Server memeriksa format, batas ukuran 16 KiB, kolom jebakan spam, dan rate
   limit lima permintaan per 15 menit per alamat proxy tepercaya.
4. Jika valid, server memanggil RPC sempit untuk membuat inquiry berstatus awal
   **Baru** dan menerima kode referensi acak.
5. Setelah percobaan penyimpanan, browser membuka WhatsApp dengan ringkasan yang
   sama beserta kode referensi. WhatsApp tetap dibuka bila jaringan atau
   Supabase gagal.
6. Bila pencatatan gagal, pesan WhatsApp memuat catatan agar admin mencatat
   permintaan tersebut secara manual.
7. Form tidak menerima unggahan file dan tidak boleh digunakan untuk nomor KTP,
   nomor dokumen, atau foto berkas sensitif.

**Konsekuensi operasional:** admin harus melihat dashboard dan WhatsApp. Jangan
menganggap semua pesan WhatsApp otomatis tersimpan; pesan fallback secara jelas
menandai kegagalan pencatatan.

## Supabase: fungsinya dan pengaturan yang diperlukan

### Fungsi Supabase pada project ini

- menyimpan nama, nomor telepon, kategori, detail layanan, wilayah, dan catatan
  inquiry;
- menyimpan status penanganan dan catatan internal admin;
- menyimpan koordinasi pembayaran, rekening/QRIS, dan permintaan verifikasi
  transfer manual;
- menyediakan tracking publik berbasis kode melalui RPC yang hanya
  mengembalikan field aman;
- menyimpan draft dan publikasi testimoni;
- melakukan autentikasi email/password untuk admin;
- membatasi akses database melalui Row Level Security (RLS);
- menghapus inquiry yang lebih tua dari 12 bulan melalui job terjadwal.

Website hanya memakai **Project URL** dan **publishable key**. Publishable key
memang dirancang untuk dipakai aplikasi publik dan keamanannya bergantung pada
RLS. Project ini tidak memakai `service_role` atau secret key di aplikasi.
Jangan pernah menambahkan password admin atau secret key ke variable bernama
`NEXT_PUBLIC_*`.

### Yang sudah dikonfigurasi

- **[SUDAH]** tabel `public.inquiries` dan index yang diperlukan;
- **[SUDAH]** anon tidak dapat `SELECT` atau `INSERT` langsung pada tabel
  inquiry; pencatatan dan tracking hanya melalui RPC sempit;
- **[SUDAH]** user authenticated biasa tidak boleh membaca data inquiry;
- **[SUDAH]** hanya JWT dengan `app_metadata.role = "admin"` yang dapat membaca
  dan memperbarui inquiry;
- **[SUDAH]** retensi 12 bulan dan purge harian pukul 02.30 UTC atau 09.30 WIB;
- **[SUDAH]** pengaturan pembayaran hanya dapat dibaca/diubah admin dan bucket
  QRIS membatasi format serta ukuran file;
- **[SUDAH]** anon hanya dapat membaca kolom publik pada testimoni yang sudah
  dipublikasikan;
- **[SUDAH]** public signup dan anonymous sign-in dinonaktifkan pada konfigurasi
  repo;
- **[SUDAH]** satu admin permanen telah dibuat dan diuji;
- **[SUDAH]** `.env.local` lokal berisi konfigurasi publik Supabase dan
  `NEXT_PUBLIC_SITE_URL=http://localhost:3100`; nilainya tidak dilacak Git.

### Pengaturan manual Supabase sebelum go-live

1. **[WAJIB] Kepemilikan dan keamanan akun**

   - Pastikan project Supabase berada di organisasi yang dimiliki klien, bukan
     hanya akun personal developer.
   - Undang developer sebagai anggota; jangan membagikan password akun utama.
   - Aktifkan MFA untuk akun Supabase dan, bila memungkinkan, miliki dua
     organization owner agar akses tidak bergantung pada satu orang.

2. **[WAJIB] URL produksi**

   - Buka **Supabase Dashboard -> Authentication -> URL Configuration**.
   - Isi **Site URL** dengan origin final, misalnya `https://www.domainanda.id`.
   - Tambahkan hanya redirect URL yang benar-benar diperlukan.
   - Hapus wildcard atau URL preview yang tidak lagi dipakai setelah serah
     terima.
   - Samakan nilai ini dengan `NEXT_PUBLIC_SITE_URL` di Vercel.

   Panduan resmi: [Supabase Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

3. **[WAJIB] Pastikan signup publik tetap mati**

   - Buka **Authentication -> Providers -> Email**.
   - Pastikan pendaftaran user baru dari publik tidak diizinkan.
   - Jangan mengaktifkan anonymous sign-in.
   - Admin baru harus dibuat manual dan diberi claim admin secara aman.

4. **[WAJIB] Verifikasi keamanan database**

   - Pastikan kelima migration repo tercatat pada remote project.
   - Periksa Security Advisor dan pastikan RLS tetap aktif pada
     `public.inquiries`.
   - Pastikan job `purge-expired-inquiries-daily` tetap aktif dan policy retensi
     tetap 12 bulan.

5. **[WAJIB PUTUSKAN] Paket dan backup**

   - Untuk website bisnis yang bergantung pada inquiry, paket Pro lebih aman
     karena project Free dapat dipause saat tidak aktif dan strategi backup-nya
     lebih terbatas.
   - Pada Pro/Team/Enterprise, periksa backup di **Database -> Backups**.
   - Pada Free, jadwalkan logical dump berkala dengan Supabase CLI dan simpan
     salinan terenkripsi di lokasi terpisah.
   - Untuk kebutuhan recovery yang lebih ketat, pertimbangkan PITR.

   Panduan resmi: [Supabase Database Backups](https://supabase.com/docs/guides/platform/backups)
   dan [Supabase Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod).

6. **[HANYA JIKA PINDAH KE PROJECT SUPABASE BARU] Terapkan migration**

   Ini pekerjaan developer, bukan pemilik nonteknis:

   ```bash
   supabase login
   supabase link --project-ref PROJECT_REF_BARU
   supabase db push --dry-run
   supabase db push
   ```

   Jangan menjalankan `supabase config push` selama `supabase/config.toml`
   masih berisi URL localhost. Panduan resmi:
   [Supabase local development and migrations](https://supabase.com/docs/guides/local-development/overview).

## Admin: lokasi, role, dan cara pakainya

### Di mana admin berada?

- Login: `https://DOMAIN-ANDA/admin/login`
- Dashboard: `https://DOMAIN-ANDA/admin`
- Detail inquiry: `https://DOMAIN-ANDA/admin/inquiries/ID-INQUIRY`
- Pengaturan pembayaran: `https://DOMAIN-ANDA/admin/pengaturan-pembayaran`

URL ini sengaja tidak ada di navbar/footer publik. Menyembunyikan link bukan
mekanisme keamanan; proteksi sesungguhnya tetap dilakukan oleh session Supabase,
pemeriksaan claim pada server Next.js, dan RLS database.

Jika orang yang belum login membuka `/admin`, aplikasi akan memindahkannya ke
`/admin/login`. Email/password yang valid tetapi tidak memiliki role admin tetap
ditolak.

### Apa arti `app_metadata.role = "admin"`?

`app_metadata` adalah metadata milik sistem Supabase Auth yang tidak dapat
diubah sendiri oleh user. Saat admin login, Supabase menandatangani claim
tersebut di JWT. Project memeriksanya pada dua lapisan:

1. aplikasi memeriksa claim sebelum menampilkan halaman/API admin;
2. RLS PostgreSQL memeriksa claim yang sama sebelum mengizinkan query data.

Role tidak disimpan di form publik dan tidak boleh diletakkan di
`user_metadata`, karena `user_metadata` dapat diubah oleh user. Setelah role
diubah atau dicabut, minta user logout dan login ulang agar token diperbarui.

Rujukan resmi:
[Supabase users and app metadata](https://supabase.com/docs/guides/auth/users)
dan [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

### Kemampuan dashboard saat ini

- melihat inquiry terbaru, 25 item per halaman;
- mencari kode referensi dan memfilter status, kategori layanan, serta status
  pembayaran;
- membuka detail kebutuhan, nomor telepon, wilayah, dan catatan pengunjung;
- menghubungi pelanggan melalui telepon atau WhatsApp;
- mengubah status menjadi **Baru**, **Diproses**, **Menunggu dokumen**,
  **Selesai**, atau **Dibatalkan**;
- menulis catatan internal maksimal 4.000 karakter;
- mengatur nominal, waktu, dan status pembayaran per inquiry serta memeriksa
  laporan transfer secara manual;
- menyimpan rekening/instruksi atau QRIS statis sekali untuk dipakai pada order
  yang sedang menunggu pembayaran;
- menandai inquiry layak testimoni, menulis draft rating/nama/teks secara
  eksplisit, lalu mempublikasikannya dengan tindakan terpisah;
- melihat waktu dibuat, waktu terakhir diperbarui, sumber, dan ID inquiry;
- logout dari session browser yang sedang digunakan.

Dashboard belum memiliki pengelolaan akun admin, tombol lupa password, delete
inquiry, export CSV, notifikasi otomatis, atau riwayat perubahan status. Jika
password admin hilang, Supabase owner/developer harus meresetnya melalui jalur
admin Supabase; tidak ada self-service reset di website sekarang.

### Prosedur admin sehari-hari

1. Buka `/admin` minimal sekali setiap hari kerja.
2. Filter **Baru**, lalu cocokkan dengan pesan WhatsApp yang masuk.
3. Hubungi calon pelanggan dan ubah status menjadi **Diproses**.
4. Gunakan **Menunggu dokumen** bila tindak lanjut tertahan pada kelengkapan.
5. Tulis catatan internal secukupnya; jangan salin nomor KTP atau isi dokumen
   sensitif ke catatan.
6. Ubah status menjadi **Selesai** atau **Dibatalkan** setelah penanganan berakhir.
7. Bila ada pembayaran, isi nominal dan timing hanya setelah disepakati melalui
   WhatsApp. Pilih **Sudah dibayar** hanya setelah mutasi/QRIS diperiksa.
8. Bila pelanggan menyetujui testimoni, tandai layak, isi konten sesuai ucapan
   pelanggan, simpan draft, periksa ulang, lalu publikasikan secara terpisah.
9. Logout saat menggunakan perangkat bersama.

## Apakah ada fitur tracking proses?

### Yang sudah ada: tracking publik ringan

Setiap inquiry yang berhasil dicatat memperoleh kode berbentuk
`TS-YYMM-XXXXXXXXXX`. Kode itu masuk ke pesan WhatsApp dan dapat dipakai pada
`/lacak` tanpa akun pelanggan. Halaman hanya menampilkan status ramah pelanggan,
kategori/detail layanan, waktu pembaruan, serta informasi pembayaran bila
relevan. Nomor telepon, nama, catatan, dan ID internal tidak ditampilkan.

Kode adalah bearer secret: siapa pun yang memilikinya dapat melihat ringkasan
aman tersebut. Minta pelanggan menyimpannya dan tidak menaruhnya di kanal
publik. Kode tidak ditempatkan di query URL. Kode salah dan kode yang tidak ada
memberi respons generik tanpa data.

Ini bukan tracking resmi antrean Samsat/dinas, bukan timeline per langkah, dan
tidak mengirim notifikasi WhatsApp otomatis. Status tetap diperbarui admin pada
dashboard; percakapan rinci tetap dilakukan melalui WhatsApp.

### Koordinasi pembayaran dan testimoni

- Isi rekening/QRIS satu kali melalui **Pengaturan pembayaran**. Pastikan milik
  bisnis dan cek ulang sebelum dipakai.
- Pada detail inquiry, aktifkan pembayaran, isi nominal dan timing, lalu pilih
  **Menunggu pembayaran**. Informasi itu baru tampil di `/lacak`.
- Tombol **Saya sudah transfer** hanya membuat status **Menunggu verifikasi**.
  Uang tidak diproses website dan status tidak otomatis menjadi lunas.
- Testimoni tidak pernah dibuat dari catatan admin. Admin harus menandai layak,
  mengisi rating/nama tampilan/teks, menyimpan draft, lalu menekan publikasi
  secara terpisah. Nama tampilan harus sesuai persetujuan pelanggan.

## Cara memberikan preview kepada klien

### Pilihan A - Vercel Preview Deployment (direkomendasikan)

Ini memberi klien URL HTTPS yang dapat dibuka dari perangkat mana pun tanpa
mengumumkan website produksi.

1. **[WAJIB OLEH DEVELOPER]** Buat repository Git privat di akun/organisasi yang
   disepakati, lalu push source final. Checkout ini saat ini belum memiliki
   remote Git.

   Untuk repository baru yang kosong, developer dapat memakai:

   ```bash
   git remote add origin URL_REPOSITORY_PRIVAT
   git push -u origin master
   ```

   Bila organisasi menetapkan branch produksi `main`, rename dan kebijakan
   branch harus disepakati terlebih dahulu; jangan menjalankan perintah rename
   hanya untuk mengikuti contoh dokumentasi.

2. Buka Vercel, pilih **New Project**, lalu import repository tersebut.
3. Isi environment variables untuk environment **Preview**.
4. Deploy branch preview, misalnya `client-preview`.
5. Buka **Project -> Settings -> Deployment Protection** dan gunakan Standard
   Protection/Vercel Authentication. Undang email klien atau buat shareable
   link dengan akses sesempit mungkin.
6. Kirim **commit-specific link** untuk persetujuan final agar isi yang ditinjau
   tidak berubah diam-diam. Gunakan branch link hanya bila klien memang ingin
   selalu melihat revisi terbaru.
7. Minta klien mengecek halaman publik, mobile, dark/light mode, semua tombol
   WhatsApp, form, dan fakta bisnis.
8. Bila klien menguji form, gunakan data berlabel `TEST PREVIEW` dan hapus data
   uji setelah acceptance.

Vercel otomatis memberi URL unik untuk setiap preview. Preview URL tidak boleh
dianggap privat hanya karena sulit ditebak; gunakan deployment protection.
Password Protection merupakan fitur berbayar pada paket tertentu, sedangkan
Vercel Authentication/Standard Protection tersedia lebih luas.

Referensi resmi:

- [Deploying Git repositories with Vercel](https://vercel.com/docs/git)
- [Sharing a Preview Deployment](https://vercel.com/docs/deployments/sharing-deployments)
- [Deployment Protection](https://vercel.com/docs/deployment-protection)

### Pilihan B - presentasi lokal melalui screen share

Gunakan `http://localhost:3100` sambil screen share Zoom/Meet. Ini paling aman
untuk review awal karena tidak membuka preview ke internet. Kekurangannya,
klien tidak dapat menguji sendiri setelah sesi selesai.

Jangan mengirim `http://localhost:3100` kepada klien jarak jauh; alamat tersebut
akan menunjuk ke komputer klien sendiri, bukan komputer developer.

### Akses dashboard pada masa preview

- Untuk review desain publik, **jangan kirim credential admin permanen**.
- Bila klien perlu melihat dashboard, pilihan paling aman adalah demo melalui
  screen share.
- **[OPSIONAL]** Developer dapat membuat admin QA sementara dengan
  `app_metadata.role = "admin"`. Setelah review, lakukan global sign-out/revoke
  session melalui prosedur admin Supabase, hapus role/user, dan tunggu JWT aktif
  kedaluwarsa sebelum menyatakan akses benar-benar tertutup. Menghapus user saja
  tidak otomatis membatalkan JWT yang sudah terbit.
- Jangan menaruh password admin pada dokumen acceptance, repository, screenshot,
  atau pesan grup.

## Environment variables untuk hosting

Atur di **Vercel Project -> Settings -> Environment Variables**. Perubahan
environment variable hanya berlaku pada deployment baru, sehingga lakukan
redeploy setelah mengubah nilai.

| Variable | Preview | Production | Catatan |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Origin HTTPS preview yang stabil | Origin HTTPS domain final | Tanpa path tambahan dan tanpa domain contoh. |
| `NEXT_PUBLIC_SUPABASE_URL` | Project Supabase staging atau project saat ini | Project Supabase production | Project URL, bukan database password. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key project yang sesuai | Publishable key production | Aman berada di browser karena RLS tetap wajib. |
| `RATE_LIMIT_TRUSTED_PROXY_HEADER` | `x-vercel-forwarded-for` bila deployment langsung di Vercel | `x-vercel-forwarded-for` bila deployment langsung di Vercel | **[HANYA DI HOSTING YANG TERPERCAYA]** Biarkan kosong pada hosting lain sampai developer memverifikasi header ditimpa proxy. |
| `SUPABASE_TEST_ADMIN_EMAIL` | Jangan set di Vercel | Jangan set di Vercel | Hanya untuk verifier lokal sementara. |
| `SUPABASE_TEST_ADMIN_PASSWORD` | Jangan set di Vercel | Jangan set di Vercel | Hanya untuk verifier lokal sementara. |

Vercel mendokumentasikan bahwa `x-vercel-forwarded-for` diberikan oleh
platform dan identik dengan alamat publik pengunjung pada deployment langsung.
Rujukan: [Vercel request headers](https://vercel.com/docs/headers/request-headers).

Panduan environment variable resmi:
[Vercel Environment Variables](https://vercel.com/docs/environment-variables).

## Langkah deployment produksi

### Bagian pemilik/klien

1. **[WAJIB]** Konfirmasi nama usaha, nomor WhatsApp, jam kerja, daftar layanan,
   wilayah yang benar-benar dapat dilayani, dan semua klaim publik.
2. **[WAJIB]** Setujui pemberitahuan privasi dan kebijakan retensi 12 bulan.
3. **[WAJIB]** Tentukan domain utama dan siapa yang membayar perpanjangannya.
4. **[WAJIB]** Pastikan akun Git, Vercel, Supabase, dan registrar domain dimiliki
   klien atau organisasi yang disepakati; aktifkan MFA.
5. **[WAJIB]** Simpan credential admin website di password manager.
6. **[WAJIB]** Berikan acceptance tertulis terhadap preview commit tertentu.
7. **[WAJIB PUTUSKAN]** Pilih paket Supabase dan jadwal backup yang sesuai risiko
   bisnis.

### Bagian developer/agency

1. Pastikan seluruh perubahan sudah di-commit dan aset yang memang dipakai sudah
   dilacak Git.
2. Push repository ke remote privat dan import ke Vercel. Bila memilih Vercel
   CLI pada mesin ini, jalankan `vercel login` lebih dahulu karena session yang
   tersimpan saat audit sudah tidak valid. Login CLI tidak diperlukan bila
   seluruh setup dilakukan melalui Dashboard.
3. Jalankan pemeriksaan lokal:

   ```bash
   npm ci
   npm run lint
   npm run typecheck
   npm run build
   npm run verify:client-secrets
   npm audit --omit=dev --audit-level=moderate
   ```

4. Pastikan remote Supabase up to date, RLS aktif, signup hosted tetap ditolak,
   cron retensi hidup, dan live security verifier lulus.
5. Tambahkan environment variables Preview dan Production di Vercel. Jangan
   mengunggah `.env.local`.
6. Tambahkan domain di **Vercel Project -> Settings -> Domains**, lalu ikuti
   record DNS yang ditampilkan Vercel. Jangan menebak A/CNAME record karena
   nilainya dapat bergantung pada konfigurasi project.
7. Samakan domain final pada Vercel, `NEXT_PUBLIC_SITE_URL`, dan Supabase Auth
   Site URL.
8. Deploy preview, dapatkan acceptance, lalu merge/promote commit yang sama ke
   production branch.
9. Setelah production aktif, uji smoke test pada domain asli:

   - homepage, layanan, proses, tentang, FAQ, kontak, privasi, dan 404;
   - mobile 390 px serta desktop;
   - light/dark mode dan menu keyboard;
   - semua CTA WhatsApp;
   - satu submit form test sampai muncul di admin dan membuka WhatsApp;
   - login admin, filter, detail, update status, catatan, dan logout;
   - `/robots.txt`, `/sitemap.xml`, canonical, dan social image;
   - header keamanan serta log runtime tanpa error tak terduga.

10. Hapus inquiry/admin QA dan pantau inquiry nyata pertama bersama pemilik.

Referensi resmi:

- [Next.js deployment](https://nextjs.org/docs/app/getting-started/deploying)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Adding a custom domain on Vercel](https://vercel.com/docs/domains/working-with-domains/add-a-domain)

## Cara menyerahkan hasil akhir kepada klien

### Format serah terima yang direkomendasikan

1. **Repository Git privat** sebagai sumber utama, dengan klien menjadi owner
   atau memiliki akses administratif yang cukup.
2. **Project Vercel** berada pada team klien atau klien diundang sebagai owner;
   domain dan billing jelas.
3. **Project Supabase** berada pada organization klien, minimal dua owner bila
   memungkinkan, dan MFA aktif.
4. **Domain registrar** tetap dimiliki klien. Agency cukup diberi akses teknis
   seperlunya.
5. **Password manager handoff** untuk admin website dan akun operasional. Kirim
   username dan secret melalui kanal terpisah.
6. **Dokumen acceptance** menyebut domain, commit hash, tanggal rilis, fitur yang
   termasuk, fitur yang tidak termasuk, dan masa support.
7. Berikan dokumen ini, laporan audit/release, serta daftar kontak support.

ZIP hanya menjadi salinan tambahan, bukan sumber utama. Bila ZIP diperlukan,
jangan masukkan `.env.local`, `.git`, `node_modules`, `.next`, output test,
password, token, atau backup database yang tidak dienkripsi.

### Batas fitur yang harus dijelaskan saat serah terima

- website menghasilkan inquiry dan mengarahkan percakapan ke WhatsApp;
- dashboard adalah alat internal, bukan CRM lengkap;
- status saat ini tidak terlihat oleh pelanggan;
- tidak ada upload dokumen, payment, signup pelanggan, atau tracking instansi;
- tidak ada alamat, legalitas, statistik, dan testimoni yang belum diverifikasi;
- perubahan konten tetap dilakukan melalui source/developer, belum ada CMS.

## Backup, privasi, dan tanggung jawab data

### Data yang disimpan

Supabase menyimpan nama, nomor telepon, kategori, detail layanan, wilayah,
catatan, status, catatan internal, sumber, ID, serta waktu pembuatan/perubahan.
Fingerprint rate limit bersifat sementara di memory server dan tidak ditampilkan
sebagai data inquiry.

Ringkasan yang sama dikirim ke WhatsApp/Meta ketika pengunjung melanjutkan.
Penghapusan dari Supabase **tidak otomatis menghapus percakapan WhatsApp**.
Pemilik perlu memiliki aturan retensi sendiri untuk chat dan file yang diterima
melalui WhatsApp.

### Rutinitas privasi

- jangan meminta nomor identitas atau foto berkas melalui form website;
- berikan akses admin hanya kepada staf yang menangani inquiry;
- periksa dan cabut akses saat staf berhenti atau berganti peran;
- tanggapi permintaan koreksi/penghapusan melalui kanal WhatsApp bisnis;
- setelah restore backup, jalankan purge retensi lagi dan periksa apakah data
  yang sebelumnya diminta dihapus muncul kembali;
- jangan mengekspor CSV inquiry ke perangkat pribadi tanpa kebutuhan dan
  perlindungan yang jelas;
- perbarui `/privasi` bila menambah analytics, upload, notifikasi, tracking
  pelanggan, vendor baru, atau tujuan penggunaan data baru.

Retensi database saat ini adalah 12 bulan. Backup dapat memiliki siklus retensi
yang berbeda; dokumentasikan berapa lama backup disimpan dan siapa yang dapat
memulihkannya. Bila kebutuhan kepatuhan klien lebih ketat, minta peninjauan
hukum/privasi tersendiri. Dokumen ini bukan nasihat hukum.

## Checklist singkat hari-H

- [ ] Konten faktual disetujui pemilik.
- [ ] Domain final aktif dan HTTPS valid.
- [ ] Git, Vercel, Supabase, dan domain dimiliki pihak yang benar; MFA aktif.
- [ ] Environment variables Production benar; tidak ada test credential.
- [ ] Supabase Site URL sesuai domain final; signup publik tetap mati.
- [ ] Migration, RLS, admin claim, cron retensi, dan backup telah diperiksa.
- [ ] Build, lint, typecheck, secret scan, audit dependency, dan security verifier lulus.
- [ ] Preview commit telah disetujui klien.
- [ ] Form test tercatat di admin dan WhatsApp terbuka.
- [ ] Login, update status, logout, mobile, dark/light, metadata, dan 404 lulus.
- [ ] Data/admin QA sudah dihapus.
- [ ] Credential dan kepemilikan akun sudah diserahkan dengan aman.
- [ ] Pemilik tahu bahwa tracking pelanggan belum tersedia.

## Referensi resmi utama

- [Next.js: Deploying](https://nextjs.org/docs/app/getting-started/deploying)
- [Vercel: Deploying Git repositories](https://vercel.com/docs/git)
- [Vercel: Environment Variables](https://vercel.com/docs/environment-variables)
- [Vercel: Sharing Preview Deployments](https://vercel.com/docs/deployments/sharing-deployments)
- [Vercel: Deployment Protection](https://vercel.com/docs/deployment-protection)
- [Vercel: Adding a Custom Domain](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
- [Supabase: Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase: Database Backups](https://supabase.com/docs/guides/platform/backups)
- [Supabase: Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
- [Supabase: Local Development and Migrations](https://supabase.com/docs/guides/local-development/overview)

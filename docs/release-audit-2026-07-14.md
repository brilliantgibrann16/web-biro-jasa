# Audit Final Menyeluruh — 14 Juli 2026

Repo: `biro-jasa-tiga-saudara`
Baseline sebelum audit: `67b8df1 fix: theme hero dossier surfaces`
Mode audit: production build lokal pada `http://localhost:3100`, live project Supabase tertaut, dan browser Chromium nyata.

Addendum visual setelah audit utama didokumentasikan di `docs/design-color-audit-2026-07-14.md`. Bagian warna di bawah mencerminkan sistem surface final setelah follow-up tersebut.

## Ringkasan eksekutif

Tidak ditemukan temuan **Critical**. Temuan High-impact yang dapat diselesaikan aman di repo sudah diperbaiki: limiter dan batas payload login admin, atribut cookie sesi, propagasi header anti-cache Supabase SSR, HSTS produksi, kontras form, semantik FAQ/landmark/toggle, title homepage, schema, dan metadata 404.

Secara UI, copy, struktur frontend, alur publik, dan alur admin, produk sekarang terasa konsisten sebagai satu sistem Editorial Authority. Tidak ada lagi indikasi mencolok bahwa light/dark theme atau halaman utilitas merupakan tambalan terpisah. Repo juga layak ditunjukkan sebagai portofolio engineering.

Keputusan rilis publik tetap **conditional no-go** sampai release gate eksternal di bagian akhir diselesaikan. Alasan utamanya bukan cacat UI, melainkan kontrol platform yang tidak boleh diubah secara spekulatif: MFA admin belum didaftarkan, leaked-password protection membutuhkan paket Supabase Pro, database SSL enforcement menyebabkan reboot singkat, allowlist jaringan membutuhkan IP operator/deployment, batas kepercayaan proxy/distributed limiter bergantung pada target hosting, dan domain produksi belum tersedia.

## Matriks hasil akhir

| Dimensi | Hasil | Critical | High diperbaiki | Gate eksternal |
| --- | --- | ---: | ---: | ---: |
| Keamanan | Lulus dengan gate | 0 | 4 kelompok | 5 |
| Warna/token | Lulus | 0 | 3 kelompok | 0 |
| Aksesibilitas | Lulus | 0 | 4 kelompok | 0 |
| Performa | Lulus secara arsitektur; lab perlu rerun saat host idle | 0 | 0 | 1 validasi |
| SEO/metadata | Lulus dengan domain gate | 0 | 3 kelompok | 1 |
| Tipografi/spacing/copy | Lulus | 0 | 2 kelompok | 0 |
| UX end-to-end | Lulus | 0 | 0 regresi | 0 |

---

## 1. Keamanan

### Metodologi

- Menjalankan `npm audit --omit=dev` dan `npm audit`.
- Membangun bundle produksi baru, lalu menjalankan `npm run verify:client-secrets`.
- Menjalankan `npm run verify:supabase` memakai akun admin QA sementara dengan `app_metadata.role=admin`.
- Menguji akses anon untuk INSERT field publik, field internal terlarang, SELECT, UPDATE, dan DELETE.
- Menguji CRUD authenticated admin dan cleanup fixture.
- Menguji HTTP route lokal: same-origin, cross-origin, payload besar, limiter login, header keamanan, redirect admin, dan deep-link setelah logout.
- Memeriksa live Supabase Security Advisor, DB lint, migration, RLS/policy/grant, auth user, retensi, cron, SSL enforcement, network restriction, dan status MFA.
- Akun QA dan semua fixture selalu dihapus pada blok `finally`.

### Hasil yang lulus

- `npm audit --omit=dev`: **0 vulnerability**.
- `npm audit`: **0 vulnerability**.
- Secret scan bundle: **25 file bersih**.
- `supabase db lint --linked`: tidak ada schema error.
- Empat migration lokal/remote selaras.
- Tabel publik hanya `inquiries`; RLS aktif.
- Policy efektif: anon INSERT-only pada field publik; SELECT/UPDATE/DELETE membutuhkan claim admin.
- Verifier live lulus seluruhnya:
  - admin login dan claim valid;
  - anon INSERT fixture valid;
  - anon tidak dapat menulis `status` atau `handled_note`;
  - anon SELECT/UPDATE/DELETE ditolak;
  - authenticated SELECT/UPDATE/DELETE lulus;
  - fixture terhapus.
- Cross-origin login memberi **403**.
- Payload login lebih dari 4 KiB memberi **413**.
- Percobaan keenam dalam window limiter memberi **429** dan `Retry-After: 900`.
- Admin tanpa sesi dan deep-link setelah logout kembali ke login.
- CSP, `DENY`, nosniff, referrer policy, permissions policy, HSTS produksi, dan penghapusan `X-Powered-By` terverifikasi lewat respons nyata.
- Cleanup akhir remote: `inquiries` **0**, auth user **1**, temporary QA user **0**.

### High-impact yang diperbaiki

1. **Login admin belum memiliki guard aplikasi.**
   - Ditambahkan limiter 5 percobaan/15 menit per alamat dari trusted proxy, plus batas global 50 percobaan/15 menit per instance, di `src/lib/server/rate-limit.ts`.
   - Jika trusted proxy belum dikonfigurasi, limiter fail-closed ke satu bucket bersama; rotasi User-Agent atau header buatan client tidak membuat bucket baru.
   - Ditambahkan pembacaan body streaming dengan batas 4 KiB sebelum parsing JSON, validasi object non-null, serta respons 413/429 di `src/app/api/admin/login/route.ts`.

2. **Header anti-cache dari `@supabase/ssr` diabaikan.**
   - Callback `setAll(cookies, headers)` sekarang menyalin `Cache-Control`, `Expires`, dan `Pragma`.
   - Redirect/401 yang membungkus response Supabase juga meneruskan ketiga header tersebut di `src/lib/supabase/proxy.ts`.
   - Helper JSON admin sekarang selalu `no-store`, `Expires: 0`, dan `Pragma: no-cache`.

3. **Cookie auth memakai default `httpOnly:false`.**
   - Server dan proxy Supabase sekarang memakai `httpOnly:true`, `sameSite:"lax"`, dan `secure:true` pada production.
   - Browser QA membuktikan cookie auth aktual memiliki `HttpOnly`, `Secure`, dan `SameSite=Lax`.

4. **HSTS belum ada.**
   - Production response sekarang mengirim `Strict-Transport-Security: max-age=31536000`.
   - Tidak memakai `includeSubDomains` atau `preload`, karena kesiapan seluruh subdomain belum diketahui.

### High-impact yang sengaja belum diubah

1. **Leaked-password protection nonaktif.** Security Advisor masih memiliki tepat satu WARN `auth_leaked_password_protection`. Fitur ini tersedia pada Supabase Pro ke atas; repo tidak dapat menyelesaikannya tanpa keputusan paket.

2. **MFA admin belum aktif secara nyata.** TOTP API enabled di config, tetapi remote memiliki 0 faktor terverifikasi dan sesi aktif masih AAL1. Enrollment QR/TOTP membutuhkan interaksi pemilik, sedangkan enforcement membutuhkan flow challenge/recovery yang merupakan keputusan auth UX. Jangan menyebut admin “MFA protected” sebelum enrollment dan AAL2 benar-benar diuji.

3. **Database SSL enforcement nonaktif.** HTTP API tetap TLS; risikonya khusus koneksi Postgres/pooler langsung. Mengaktifkan enforcement menyebabkan restart database singkat, sehingga perlu window operasi yang disetujui.

4. **Network restriction masih `0.0.0.0/0` dan `::/0`.** Allowlist tidak boleh dikarang karena dapat memblokir migration CLI atau deployment. IP operator dan hosting harus ditentukan dulu.

5. **Limiter aplikasi belum terdistribusi.** Implementasi saat ini in-memory per process. Target hosting harus menetapkan header IP yang benar-benar disanitasi dan, untuk multi-instance, menyediakan store terdistribusi sebelum limiter dianggap kontrol primer.

### Residual risk yang tercatat

Rate limiter inquiry tetap in-memory, per instance, dan dapat dilewati lewat anon INSERT langsung ke Supabase Data API. Solusi menyeluruh membutuhkan RPC/Edge Function atau limiter terdistribusi. Batasan ini tetap tercatat; tidak dihilangkan dari laporan.

Limiter login admin juga tetap in-memory, sehingga restart mereset window dan scale-out memecah hitungan antar-instance. Default tanpa konfigurasi memakai bucket bersama agar header client tidak dapat membuka bucket baru, tetapi konsekuensinya satu sumber dapat membuat admin terkunci sementara. `RATE_LIMIT_TRUSTED_PROXY_HEADER` hanya boleh diisi setelah reverse proxy terbukti menimpa dan membersihkan header itu. Deployment multi-instance memerlukan store terdistribusi.

---

## 2. Warna dan sistem token

### Metodologi

- Menyisir seluruh `src/` untuk kelas warna kromatik Tailwind mentah.
- Menyisir literal hex/RGB di TS/TSX dan mengklasifikasikannya sebagai token gap atau artwork statis.
- Menghitung rasio kontras pasangan yang benar-benar dipakai.
- Menguji light/dark secara browser pada route publik, form, service hero, dan admin.
- Menguji 60 kombinasi: 10 route × viewport 375, 390, 768, 1024, 1440, dan 1920 px.

### Hasil scan

- Raw chromatic Tailwind classes: **0**.
- Literal TS/TSX yang tersisa hanya pengecualian visual terklasifikasi:
  - warna ikon brand statis;
  - copper atmospheric overlay halus pada Footer/WhyChooseUs;
  - black neutral shadows pada dossier/hero.
- Tidak ada kebocoran status color lama.
- Utility CSS orphan (`glass`, `glass-border`, `gradient-navy`, `gradient-cta`, `section-divider`, `shadow-glow`) sudah dihapus setelah pencarian pemakaian menunjukkan nol consumer.

### High-impact yang diperbaiki

1. **Border kontrol light mode terlalu samar.**
   - Sebelum: `neutral-300` memberi sekitar 1.84–1.89:1.
   - Sesudah: token `control-border` memakai `#968b7e` light dan `#71809a` dark; sekitar **3.28:1** dan **4.28:1**.

2. **Placeholder light mode tidak mencapai 4.5:1.**
   - Sebelum: `neutral-400`, sekitar 3.20–3.28:1.
   - Sesudah: token `form-placeholder` memakai `#675f57` light dan `#c4c9d0` dark; sekitar **6.16:1** dan **10.27:1**.

3. **Surface publik drift dan menghasilkan full-width band pada dark mode.**
   - Seluruh root section publik sekarang memakai satu token `page`: `#fbfaf7` light dan `#07111f` dark.
   - `panel` dan `inset` hanya dipakai pada kartu/form/aside lokal; header/footer menjadi satu-satunya bookend full-width.
   - Service hero fixed navy dan bidang vertikal kontak dihapus. Dossier layanan memakai token `dossier-*` yang adaptif; token `fixed-paper-*` yang tidak lagi dipakai dihapus.
   - Navbar dan Footer sekarang memakai satu strategi token tanpa heuristik pathname atau override `dark:*` paralel.

Browser computed-style proof pada form kontak:

| Mode | Border | Background | Placeholder |
| --- | --- | --- | --- |
| Light | `rgb(150, 139, 126)` | `rgb(255, 253, 248)` | `rgb(103, 95, 87)` |
| Dark | `rgb(113, 128, 154)` | `rgb(17, 28, 45)` | `rgb(196, 201, 208)` |

Angka dekoratif pada TrustIndicators dan Industries juga dinaikkan dari `neutral-300` ke `neutral-400`; temuan Lighthouse contrast terakhir hilang.

### Bukti visual/behavioral

- 60/60 route/viewport tidak memiliki horizontal overflow.
- Setiap kombinasi memiliki tepat satu H1 yang terlihat.
- Light default, dark toggle, dan dark persistence lulus tanpa console/page error.
- Follow-up surface audit menambah 40 kombinasi route × theme pada desktop 1440×900 dan mobile 390×844; seluruhnya memiliki satu background section publik, bookend header/footer yang benar, satu H1 terlihat, dan overflow 0.
- Screenshot admin menunjukkan border kontrol tetap jelas tanpa berubah menjadi outline berat.

---

## 3. Aksesibilitas

### Metodologi

- Static audit landmark, heading, form label, ARIA, live region, focus style, dan reduced motion.
- Keyboard test nyata: skip link, mobile drawer, Escape, focus return, FAQ via Space, login, filter, detail, update, dan logout.
- Playwright semantic probe untuk seluruh 8 item FAQ.
- Lighthouse mobile pada homepage dan service detail.

### High-impact yang diperbaiki

1. Form publik/admin memakai border dan placeholder semantic yang lolos kontras.
2. Loading admin tidak lagi membuat `<main>` bersarang; root diganti menjadi `<section>` dan status/busy semantics dipertahankan.
3. FAQ sekarang:
   - menempatkan setiap pertanyaan dalam `h3`;
   - memberi ID tombol;
   - mempertahankan region jawaban di DOM;
   - menghubungkan panel dengan `aria-labelledby`;
   - menyelaraskan `aria-expanded` dan `aria-hidden`;
   - tetap mempertahankan animasi height/opacity.
4. Theme toggle mempertahankan action label dan menghapus `aria-pressed` yang sebelumnya ambigu.

Perbaikan kecil yang ikut masuk:

- Footer memakai heading level konsisten dan landmark `nav aria-labelledby`.
- Live-region ancestor ganda pada form admin disederhanakan.
- Skip-link memakai outline khusus dark surface.
- Ikon dekoratif Footer diberi `aria-hidden` eksplisit.

### Bukti akhir

- Lighthouse homepage: **Accessibility 100**.
- Lighthouse service detail: **Accessibility 100**.
- FAQ: 8/8 tombol berada dalam H3; 8/8 panel punya role, label, dan node yang stabil.
- FAQ keyboard Space mengubah expanded state.
- Drawer: fokus ke tombol tutup, main menjadi inert, Escape menutup, fokus kembali, inert dibersihkan.
- Skip link adalah fokus pertama dan memindahkan fokus ke `#main-content`.
- `prefers-reduced-motion` terdeteksi dan dihormati.
- Console warnings/errors: 0 pada interaction dan responsive pass.

### Nice-to-have tersisa

- Homepage masih memiliki dua tree hero responsif sehingga HTML memuat dua H1, tetapi salah satunya selalu `display:none`; 60/60 viewport membuktikan satu H1 terlihat. Ini bukan SEO/a11y failure modern, tetapi refactor satu tree akan mengurangi duplikasi DOM.
- Beberapa complementary `aside` publik dapat diberi accessible name eksplisit pada refactor konten berikutnya.

---

## 4. Performa

### Metodologi

- Production `next build` dan `next start`.
- Lighthouse 13.4.0 mobile pada `/` dan `/layanan/dokumen-kendaraan`.
- Memeriksa prerender manifest, cache header, static chunks, font preload, LCP asset, dan secret/Supabase marker di client bundle.
- Membandingkan environment benchmark dengan report baseline, bukan hanya angka score.

### Arsitektur dan bundle

- Semua 10 route publik, robots, sitemap, icon, OG, dan Twitter image tetap static/prerendered.
- Hanya admin dan API yang dynamic.
- Home response cache HIT/prerendered, gzip, dan server response sekitar **10 ms**.
- `.next/static`: 38 file; **1,278,917 byte** total raw, **890,795 byte JS**, **84,335 byte CSS** lintas seluruh chunk build.
- Transfer modern-browser audit tetap sekitar 212–215 KiB gzip JS per route; CSS global sekitar 13.8 KiB gzip.
- Supabase SDK marker tidak ada di client chunks.
- Dua font WOFF2 self-hosted/preloaded; total sekitar 75.7 KiB.
- Tidak ada raster LCP pada halaman publik; hero utama HTML/CSS.
- OG/Twitter PNG baru **1,157,129 byte** tidak berada pada critical page-load path; visual perizinan yang dipakai di halaman detail sudah dioptimalkan menjadi WebP **71,198 byte**.

### Lighthouse final

| Route | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS | Host benchmark |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home baseline 11 Jul | 94 | 100 | 100 | 100 | 0.94 s | 3.0 s | 46 ms | 0 | 2556.5 |
| Home final 14 Jul | 82 | 100 | 100 | 100 | 1.5 s | 3.7 s | 240 ms | 0 | 1892.0 |
| Service final 14 Jul | 84 | 100 | 100 | 100 | 1.1 s | 3.5 s | 290 ms | 0 | 2014.5 |

Penurunan score mentah **material tetapi tidak terbukti sebagai regresi kode**:

- host benchmark turun sekitar 26% dari baseline;
- pada pengamatan host yang dilakukan terpisah dari Lighthouse, beban CPU total sesaat berada sekitar 36–49%; angka ini hanya konteks lingkungan dan bukan bukti kausal penurunan score;
- server response tetap 7–10 ms;
- unused-JS estimate membaik sedikit dari 53,063 byte menjadi 52,632 byte;
- tidak ada dependency baru, SDK Supabase di client, raster LCP, atau layout shift.

Karena itu report final disimpan apa adanya dan tidak “dipoles” dengan throttling nonstandar. Rerun satu kali ketika host idle adalah release validation yang masih perlu dilakukan. Refactor Framer Motion/global chrome hanya layak dilakukan bila rerun idle tetap di bawah baseline; melakukan refactor besar sekarang akan berisiko mengganggu desain yang sudah disetujui tanpa bukti bundle regression.

### Nice-to-have

- Sekitar 52.6 KiB unused-JS estimate terutama berasal dari global chrome/Framer Motion. Pecah public/admin chrome atau lazy-load motion bila data real-user menunjukkan kebutuhan.
- Kompres aset OG/Twitter untuk distribusi sosial lebih cepat; ini bukan page-load blocker.

---

## 5. SEO dan metadata

### Metodologi

- Memeriksa output HTML nyata untuk 10 route publik, 404, admin, robots, sitemap, OG, Twitter, canonical, dan JSON-LD.
- Memastikan title unik, description, target blank, WhatsApp URL, dan klaim marketing terlarang.
- Memeriksa status/cache kedua social image.

### High-impact yang diperbaiki

1. Homepage sekarang menghasilkan title lengkap: `Biro Jasa Tiga Saudara | Pengurusan Dokumen dan Perizinan`.
2. Schema global `LocalBusiness` yang tidak memiliki address dihapus. Homepage sekarang memakai `Organization` dengan nested `OfferCatalog`/`Service`; schema tidak lagi muncul pada admin atau 404.
3. Fallback 404 dipindahkan ke konvensi eksperimental `global-not-found` Next.js 16. Output sekarang memberi HTTP 404, satu noindex otomatis, satu title khusus, dan satu description khusus tanpa mewarisi metadata halaman normal.

### Bukti akhir

- 10 route diuji; **10 unique title**.
- 10/10 metadata Open Graph dan Twitter lengkap.
- 3 katalog tepat: 15 dokumen kendaraan, 6 perizinan bangunan, 5 legalitas teknis.
- Sitemap tepat 10 route publik; admin/API/error tidak masuk.
- Robots mengizinkan publik dan memblokir `/admin` serta `/api`.
- Admin noindex/nofollow/noarchive/noimageindex.
- 404 noindex dan tidak memiliki schema Organization.
- OG/Twitter endpoint: 200 PNG, immutable.

### Release gate eksternal

Build preview sengaja menghasilkan canonical, `og:url`, robots Host, dan sitemap origin `http://localhost:3100`. Sebelum live, domain produksi harus diisi pada `NEXT_PUBLIC_SITE_URL`, Supabase Auth Site URL/redirect harus disamakan, lalu build dan smoke-test diulang. Jangan deploy artefak preview apa adanya.

### Nice-to-have

- `src/app/favicon.ico` default lama masih berdampingan dengan generated brand icon dari `icon.tsx`. Binary tidak dihapus dalam patch text-safe audit ini; ganti/hapus sebelum polish final browser tab.
- Bila alamat bisnis terverifikasi tersedia, schema dapat dinaikkan kembali dari Organization ke LocalBusiness lengkap. Alamat tidak boleh dikarang.

---

## 6. Tipografi, spacing, dan nada tulisan

### Metodologi

- Membaca seluruh copy publik, privacy, 404, form, WhatsApp, serta dashboard admin.
- Membandingkan skala heading, body, eyebrow, section rhythm, dan CTA pada semua route/viewport.

### Perbaikan

- Copy publik mengganti jargon campuran:
  - `inquiry` → `permintaan`/`kebutuhan`;
  - `website` → `situs web`;
  - `endpoint publik` → `jalur formulir publik`;
  - `form` → `formulir`;
  - `Update` → `Pembaruan`.
- Jam layanan dirapikan menjadi `Senin–Sabtu: 08.00–17.00 WIB`.
- Footer heading/navigation diselaraskan tanpa mengubah positioning atau CTA.
- Terminologi teknis `inquiry` tetap dipertahankan di dashboard internal, tempat istilah operasional memang sesuai.

### Hasil

- Plus Jakarta tetap konsisten untuk display/heading; Inter untuk body/UI.
- Section rhythm tetap terbagi jelas antara section utama dan section ringkas.
- Tidak ditemukan klaim seperti “pasti selesai”, “100% berhasil”, atau angka klien yang tidak terverifikasi.
- Privacy dan 404 sekarang terdengar sebagai bagian dari brand yang sama, bukan halaman utilitas generik.

### Nice-to-have

- `--spacing-section` dan `--spacing-section-sm` masih belum menjadi sumber tunggal seluruh spacing utility. Centralization dapat dilakukan saat refactor layout besar berikutnya, bukan sebagai patch mekanis sekarang.

---

## 7. Alur pengalaman pengguna end-to-end

### Metodologi

Browser QA memakai Chromium nyata pada mobile 390×844 dan desktop 1440×1000. Satu akun admin QA dibuat sementara, 25 fixture pagination disemai, dan satu inquiry dikirim melalui form publik. Setelah test, semua 26 row dan akun QA dihapus.

### Alur publik yang lulus

- Home → layanan → kontak dapat dinavigasi pada seluruh breakpoint.
- Form publik menerima nama, telepon, kategori, sub-layanan, wilayah, dan catatan.
- Submit sukses menulis inquiry dan membuka satu WhatsApp URL dengan seluruh ringkasan.
- Copy WhatsApp memakai terminologi baru `formulir kebutuhan` dan `situs web`.
- Fallback 503 disimulasikan tanpa menulis DB:
  - hanya satu navigasi WhatsApp;
  - nama, kategori, wilayah, dan catatan tetap utuh;
  - pesan dengan jujur menyatakan pencatatan situs web belum berhasil.

### Alur admin yang lulus

- Login dengan admin claim valid.
- Cookie aktual HttpOnly/Secure/Lax.
- Fixture terbaru tampil di dashboard.
- Pagination 1/2 dan 2/2 bekerja.
- Detail inquiry dapat dibuka.
- Status dapat diubah menjadi `diproses` dan catatan internal tersimpan.
- Stale update memberi 409; optimistic concurrency bekerja.
- Filter status+kategori menampilkan row yang benar.
- Mobile admin card tetap usable dan seluruh action terlihat.
- Logout menghapus akses; deep-link detail kembali ke login.
- Console error tidak terduga: 0; page error: 0.

### Artefak visual

- `output/playwright/release-final/admin-dashboard-1440.png`
- `output/playwright/release-final/admin-filter-mobile-390.png`

Artefak `output/` di-ignore dan hanya dipakai untuk QA lokal, bukan bundle produksi.

---

## Perintah verifikasi akhir

Semua berikut lulus pada source/build final:

```text
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev
npm audit
npm run verify:client-secrets
npm run verify:supabase   # dengan akun QA sementara; akun dan fixture dibersihkan
git diff --check
```

Browser evidence:

```text
10 route × 6 viewport = 60/60 pass
interaction/theme/drawer/skip-link/reduced-motion = pass
FAQ semantic + keyboard = pass
metadata/catalog/social image = pass
public success + WhatsApp fallback = pass
admin login/list/pagination/detail/update/conflict/filter/logout = pass
```

## Release gate wajib

Selesaikan ini sebelum menganggap situs production-ready tanpa syarat:

1. Tentukan domain produksi; sinkronkan `NEXT_PUBLIC_SITE_URL`, Supabase Auth Site URL/redirect, rebuild, lalu smoke-test canonical/robots/sitemap/login.
2. Putuskan paket Supabase Pro atau terima secara eksplisit residual risk leaked-password protection.
3. Implementasikan/enroll TOTP admin, enforce AAL2 pada admin, uji recovery, lalu cabut sesi AAL1 lama.
4. Jadwalkan dan aktifkan Postgres SSL enforcement.
5. Tentukan IP operator/deployment, lalu terapkan database network restriction tanpa memutus migration path.
6. Verifikasi reverse proxy membersihkan header alamat client, isi `RATE_LIMIT_TRUSTED_PROXY_HEADER`, dan gunakan store limiter terdistribusi bila production berjalan multi-instance.
7. Rerun Lighthouse mobile ketika host idle untuk perbandingan yang setara dengan baseline benchmark 2556.5.

## Penilaian akhir

**Kualitas produk/repo:** ya, sudah terasa seperti pekerjaan agency yang disiplin. Sistem visual, copy, semantics, build boundary, dan alur publik/admin kini konsisten serta memiliki bukti QA yang dapat diulang.

**Izin go-live tanpa syarat:** belum. Kekurangannya terlokalisasi dan jelas: kontrol Supabase/platform, domain produksi, dan satu validasi performance saat host idle. Tidak ada alasan untuk membuka ulang arah desain, arsitektur layanan, pembayaran, akun publik, upload dokumen, tracking, atau multirole admin.

## Referensi primer

- Supabase password security: https://supabase.com/docs/guides/auth/password-security
- Supabase MFA: https://supabase.com/docs/guides/auth/auth-mfa
- Supabase SSR advanced guide: https://supabase.com/docs/guides/auth/server-side/advanced-guide
- Supabase production checklist: https://supabase.com/docs/guides/deployment/going-into-prod
- Google LocalBusiness structured data: https://developers.google.com/search/docs/appearance/structured-data/local-business
- Schema.org `serviceType`: https://schema.org/serviceType
- Next.js 16 Proxy: https://nextjs.org/docs/app/getting-started/proxy
- Next.js response headers: https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
- Next.js global not-found: https://nextjs.org/docs/app/api-reference/file-conventions/not-found

Catatan Next.js: dokumentasi Markdown lokal pada `node_modules/next/dist/docs` telah dibaca untuk konvensi `global-not-found`. Implementasi juga diverifikasi terhadap type/source package Next 16.2.10 yang terpasang, build aktual, dan dokumentasi resmi Next.js 16.

# Biro Jasa Tiga Saudara

Website lead-generation untuk Biro Jasa Tiga Saudara. Situs menjelaskan pengurusan dokumen kendaraan, perizinan bangunan, dan legalitas teknis dengan posisi utama: **berkas dibaca dulu, proses dijalankan dengan rapi**.

## Stack

- Next.js 16 App Router dan React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Lucide React

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

Salin `.env.example` menjadi `.env.local`, lalu isi `NEXT_PUBLIC_SITE_URL`
dengan origin produksi asli. Nilai ini dipakai untuk canonical URL dan social
preview. Saat belum diisi, build lokal memakai `http://localhost:3000` hanya
sebagai basis preview lokal dan tidak menerbitkan canonical produksi.

## Struktur utama

- `src/app/` — route, metadata, dan style global
- `src/components/layout/` — navbar, footer, dan aksi WhatsApp global
- `src/components/page/` — pola hero dan halaman detail layanan
- `src/components/sections/` — section editorial yang dipakai lintas halaman
- `src/lib/constants.ts` — sumber data company, katalog layanan, FAQ, proses, dan prinsip

## Aturan konten

- Semua link WhatsApp dibuat melalui `COMPANY.whatsappUrl()`.
- Katalog layanan harus diperbarui di `SERVICE_CATEGORIES`, bukan di-hardcode pada komponen.
- Jangan menambahkan alamat, cakupan wilayah, testimoni, statistik, atau nomor legalitas tanpa sumber asli dari klien.
- URL produksi diperlukan sebelum canonical, sitemap absolut, dan `metadataBase` dapat ditetapkan.

## Catatan Next.js

Project menggunakan Next.js 16. Baca panduan lokal yang relevan di `node_modules/next/dist/docs/` sebelum mengubah API Next.js, routing, metadata, image, atau konfigurasi.

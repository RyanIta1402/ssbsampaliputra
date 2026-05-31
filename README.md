# 🏆 SSB Sampali Putra — Website Landing Page

Website resmi **Sekolah Sepak Bola (SSB) Sampali Putra** yang dibangun dengan
**Next.js 14 (App Router)** dan **Sanity CMS**. Tampilan landing page modern
bertema atletik, lengkap dengan panel admin (CMS) untuk mengelola seluruh
konten tanpa menyentuh kode.

---

## ✨ Fitur

- **Landing page bertema sepak bola** — Hero, Tentang, Program Latihan,
  Pelatih, Prestasi, Galeri, Testimoni, dan Kontak.
- **Sanity CMS terintegrasi** — kelola semua teks & gambar lewat `/studio`.
- **Formulir pendaftaran via WhatsApp** — calon siswa langsung terhubung ke
  WhatsApp admin dengan pesan terisi otomatis.
- **Rekap pendaftaran di CMS** — setiap pendaftaran tersimpan otomatis ke
  Sanity (menu *Pendaftaran Masuk*), lengkap dengan status (baru, dihubungi,
  diterima, ditolak) dan catatan admin.
- **Unduh formulir kosong (PDF)** — tombol unduh formulir pendaftaran resmi
  langsung dari website.
- **Responsif** — tampil rapi di HP, tablet, dan desktop.
- **Animasi halus** saat scroll, marquee, dan micro-interaction.
- **Jalan dengan data contoh** — bahkan sebelum Sanity dihubungkan, situs
  sudah tampil penuh dengan konten contoh.

---

## 🧱 Teknologi

| Bagian        | Teknologi                          |
| ------------- | ---------------------------------- |
| Framework     | Next.js 14 (App Router) + React 18 |
| Bahasa        | TypeScript                         |
| CMS           | Sanity v3 (embedded di `/studio`)  |
| Styling       | Tailwind CSS                       |
| Font          | Anton (display) + Archivo (body)   |

---

## 🚀 Cara Menjalankan (Langkah demi Langkah)

### 1. Prasyarat

Pastikan sudah terpasang **Node.js versi 18 atau lebih baru**. Cek dengan:

```bash
node -v
```

### 2. Install dependensi

Buka terminal di folder project ini, lalu jalankan:

```bash
npm install
```

### 3. Jalankan dalam mode pengembangan

```bash
npm run dev
```

Buka browser ke **http://localhost:3000** — situs sudah tampil lengkap dengan
data contoh. 🎉

> Pada tahap ini situs sudah bisa dilihat tanpa konfigurasi apa pun.

---

## 🔌 Menghubungkan ke Sanity CMS (agar konten bisa diedit)

Agar Anda bisa mengubah konten lewat panel admin, hubungkan ke project Sanity:

### 1. Buat project Sanity (gratis)

1. Daftar / masuk di **https://www.sanity.io**
2. Buka **https://www.sanity.io/manage** lalu klik **Create new project**
3. Catat **Project ID** yang muncul
4. Pastikan ada dataset bernama **production**

### 2. Buat file `.env.local`

Salin file contoh:

```bash
cp .env.local.example .env.local
```

Lalu buka `.env.local` dan isi:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID="project_id_anda_disini"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2024-10-01"
SANITY_API_WRITE_TOKEN="token_editor_anda_disini"
```

> **Token tulis (`SANITY_API_WRITE_TOKEN`)** dibutuhkan agar pendaftaran dari
> website tersimpan ke CMS. Buat di **Sanity Manage → API → Tokens → Add API
> token**, beri nama bebas, pilih izin **Editor**, lalu salin tokennya.
> Jaga kerahasiaan token ini dan jangan di-commit ke Git.

### 3. Izinkan domain (CORS)

Di **https://www.sanity.io/manage** → pilih project → **API** → **CORS Origins**
→ tambahkan:

- `http://localhost:3000`
- (nanti) domain produksi Anda, misal `https://sampaliputra.com`

Centang **Allow credentials**.

### 4. Jalankan ulang & buka Studio

```bash
npm run dev
```

Buka **http://localhost:3000/studio** → login dengan akun Sanity Anda → mulai
isi konten:

- **Pengaturan Situs** — nama klub, kontak, WhatsApp, sosial media, jadwal
- **Bagian Hero** — judul utama & statistik
- **Tentang Kami** — profil & keunggulan
- **Program Latihan** — kelas per kelompok usia
- **Pelatih**, **Galeri**, **Prestasi**, **Testimoni**

Setelah konten di-*publish*, situs di `localhost:3000` otomatis menampilkannya.

> **Nomor WhatsApp**: isi di *Pengaturan Situs → Nomor WhatsApp* dengan format
> `62812xxxxxxx` (tanpa tanda + atau spasi).

### Rekap Pendaftaran & Unduh Formulir

- **Rekap pendaftaran**: setiap kali pengunjung menekan *Kirim Pendaftaran*,
  datanya tersimpan ke Sanity dan muncul di menu **📥 Pendaftaran Masuk** pada
  Studio. Admin bisa mengubah status tiap pendaftar (baru → dihubungi →
  diterima/ditolak) dan menambah catatan. *(Memerlukan `SANITY_API_WRITE_TOKEN`.
  Bila token belum diisi, formulir tetap berfungsi mengirim via WhatsApp,
  hanya rekap CMS yang tidak aktif.)*
- **Unduh formulir kosong**: tombol *Unduh Formulir Pendaftaran (PDF)* di
  bagian Kontak mengunduh berkas `public/formulir-pendaftaran.pdf`. Untuk
  mengganti dengan versi terbaru, cukup timpa file tersebut dengan nama yang
  sama.

---

## 📦 Build untuk Produksi

```bash
npm run build
npm run start
```

---

## ☁️ Deploy (Rekomendasi: Vercel)

1. Push project ini ke GitHub.
2. Buka **https://vercel.com**, import repository.
3. Tambahkan Environment Variables yang sama seperti `.env.local`.
4. Klik **Deploy**.
5. Setelah dapat domain, tambahkan domain itu ke **CORS Origins** Sanity
   (langkah 3 di atas).

---

## 📁 Struktur Folder

```
ssb-sampali-putra/
├── app/
│   ├── layout.tsx          # Layout & font global
│   ├── page.tsx            # Halaman landing page utama
│   ├── globals.css         # Style global + utilities
│   └── studio/[[...tool]]/ # Sanity Studio (panel admin) di /studio
├── components/             # Komponen UI landing page
│   ├── Navbar.tsx  Hero.tsx  Marquee.tsx  About.tsx
│   ├── Programs.tsx  Coaches.tsx  Achievements.tsx
│   ├── Gallery.tsx  Testimonials.tsx  Contact.tsx  Footer.tsx
│   ├── Reveal.tsx          # Animasi muncul saat scroll
│   └── SanityImage.tsx     # Gambar Sanity + fallback
├── sanity/
│   ├── env.ts              # Konfigurasi environment
│   ├── lib/                # client, image, queries (GROQ)
│   ├── schemaTypes/        # Definisi struktur konten CMS
│   └── structure.ts        # Susunan menu Studio
├── sanity.config.ts        # Konfigurasi Sanity Studio
├── sanity.cli.ts           # Konfigurasi CLI Sanity
├── tailwind.config.ts      # Tema warna & animasi
├── .env.local.example      # Contoh environment variables
└── package.json
```

---

## 🎨 Mengubah Tampilan

- **Warna**: edit `tailwind.config.ts` bagian `colors` (pitch = hijau, gold = emas).
- **Font**: ganti di `app/layout.tsx` (import dari `next/font/google`).
- **Teks default**: setiap komponen punya data contoh; namun lebih baik isi
  lewat Studio agar mudah diubah tanpa kode.

---

## ❓ Bantuan Singkat

| Masalah                              | Solusi                                                       |
| ------------------------------------ | ------------------------------------------------------------ |
| Studio kosong / error project        | Pastikan `.env.local` benar & sudah `npm run dev` ulang      |
| Konten tidak muncul setelah diisi    | Pastikan dokumen sudah di-**Publish** di Studio              |
| Gambar tidak tampil                  | Tunggu beberapa detik (CDN) atau cek koneksi internet        |
| Tombol WhatsApp salah nomor          | Atur di *Pengaturan Situs → Nomor WhatsApp* (format 62...)   |

---

Dibuat untuk **SSB Sampali Putra** — *Mencetak Bibit Pesepak Bola Sejak Dini.* ⚽

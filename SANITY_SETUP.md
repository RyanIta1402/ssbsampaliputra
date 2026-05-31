# Panduan Setup Sanity untuk SSB Sampali Putra

Project ini sudah terintegrasi penuh dengan Sanity CMS. Ikuti langkah berikut untuk menghubungkannya ke project Sanity kamu sendiri.

## 1. Daftar / Login Sanity

Jika belum punya akun:
- Buka https://www.sanity.io dan daftar gratis (bisa pakai Google / GitHub).

Lalu login lewat CLI:

```bash
npm run sanity:login
```

## 2. Buat Project Sanity & Isi `.env.local`

Cara cepat (otomatis tulis `.env.local`):

```bash
npm run sanity:init
```

Pilihan saat ditanya:
- **Create new project** → beri nama "SSB Sampali Putra"
- **Dataset**: `production`
- **Use TypeScript schema?** → No (schema sudah ada)
- **Output path** → biarkan default
- Tekan Enter sampai selesai.

CLI akan otomatis mengisi `NEXT_PUBLIC_SANITY_PROJECT_ID` di `.env.local`.

**Atau manual:** buka https://www.sanity.io/manage → klik project kamu → salin **Project ID** → tempel ke `.env.local`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID="abc1234"
```

## 3. Buat API Token (untuk form pendaftaran)

1. Buka https://www.sanity.io/manage
2. Pilih project → tab **API** → **Tokens** → **Add API token**
3. Name: `Website Write Token`
4. Permissions: **Editor**
5. Salin token → tempel ke `.env.local`:

```
SANITY_API_WRITE_TOKEN="sk..."
```

> Token tidak akan ditampilkan lagi setelah halaman ditutup — simpan baik-baik.

## 4. Tambah CORS Origin (agar Studio bisa diakses dari Next.js)

```bash
npm run sanity:cors -- http://localhost:3000 --credentials
```

Untuk production, ulangi dengan domain aslinya:

```bash
npm run sanity:cors -- https://domain-kamu.com --credentials
```

## 5. Jalankan Project

```bash
npm run dev
```

- Website: http://localhost:3000
- Studio (CMS): http://localhost:3000/studio

Login ke Studio dengan akun Sanity yang sama. Sekarang kamu bisa mengelola: Site Settings, Hero, About, Program, Pelatih, Galeri, Achievement, Testimoni, dan melihat Pendaftaran masuk.

## 6. (Opsional) Deploy Studio Terpisah

Selain via `/studio` di website, Studio bisa di-host di `<nama>.sanity.studio` gratis:

```bash
npm run sanity:deploy
```

CLI minta nama subdomain. Studio bisa diakses di mana saja tanpa harus deploy Next.js.

## 7. Upload Project ke Repo (Git/GitHub)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <URL_REPO_KAMU>
git push -u origin main
```

`.env.local` otomatis tidak ikut commit (sudah ada di `.gitignore`).

## 8. Deploy Website ke Vercel (Rekomendasi)

1. Push repo ke GitHub.
2. Buka https://vercel.com → New Project → import repo-mu.
3. Di Environment Variables tambahkan semua isi `.env.local`:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `NEXT_PUBLIC_SANITY_API_VERSION`
   - `SANITY_API_WRITE_TOKEN`
4. Deploy. Jangan lupa tambah domain Vercel ke CORS Sanity (langkah 4).

---

## Script Sanity yang Tersedia

| Perintah | Fungsi |
|----------|--------|
| `npm run sanity:login` | Login akun Sanity |
| `npm run sanity:init` | Buat / link project + tulis `.env.local` |
| `npm run sanity:manage` | Buka halaman manage project di browser |
| `npm run sanity:cors -- <url> --credentials` | Tambah origin yang diizinkan |
| `npm run sanity:deploy` | Deploy Studio ke `<nama>.sanity.studio` |
| `npm run sanity:dataset` | Kelola dataset (export/import/list) |
| `npm run typegen` | Generate TypeScript types dari schema |

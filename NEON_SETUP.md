# Setup Database Neon + Login

Panduan menyiapkan penyimpanan data dengan **Neon** (PostgreSQL serverless,
ada paket gratis) dan fitur **login** (admin & member) untuk SSB Sampali Putra.

Hasil akhir:

- Tombol **Masuk** di samping **Daftar** pada navbar.
- Halaman `/login`, `/daftar-akun`, `/akun` (member), `/dashboard` (admin).
- Tabel `users` (akun) dan `pendaftaran` tersimpan di Neon.
- Setiap pendaftaran dari website tetap terkirim ke WhatsApp **dan** ikut
  tersimpan ke Neon (serta Sanity, jika masih aktif).

---

## 1. Buat database di Neon

1. Buka <https://neon.tech> lalu daftar / login (bisa pakai akun Google/GitHub).
2. Klik **Create project**.
   - **Name**: bebas, mis. `ssb-sampali-putra`.
   - **Region**: pilih yang terdekat, mis. **Singapore (ap-southeast-1)**.
3. Setelah project dibuat, buka **Connection string** (Dashboard → Connect).
   - Pilih opsi **Pooled connection** (ada kata `-pooler` pada host).
   - Salin string-nya, bentuknya seperti:
     ```
     postgresql://USER:PASSWORD@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
     ```

## 2. Isi `.env.local`

Buka file `.env.local` di root proyek, isi `DATABASE_URL` dengan string tadi:

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
AUTH_SECRET="<sudah terisi otomatis — biarkan saja>"
```

> `AUTH_SECRET` sudah dibuatkan nilai acak. Untuk produksi, sebaiknya pakai
> nilai acak baru: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 3. Jalankan skema (buat tabel)

1. Di Neon, buka menu **SQL Editor**.
2. Buka file [`db/schema.sql`](db/schema.sql) di proyek ini, salin **seluruh** isinya.
3. Tempel ke SQL Editor, klik **Run**.

Ini membuat tabel `users` dan `pendaftaran`. Aman dijalankan ulang.

## 4. Restart server dev

```bash
npm run dev
```

Variabel `.env.local` hanya dibaca saat server start, jadi wajib restart
setelah mengisi `DATABASE_URL`.

## 5. Buat akun admin pertama

1. Buka <http://localhost:3000/daftar-akun>, buat akun dengan **Nama User**
   (untuk login, harus unik). Akun baru otomatis berperan **member**.
2. Jadikan akun itu **admin**: di Neon **SQL Editor**, jalankan (ganti nama user):
   ```sql
   update users set role = 'admin' where username = 'namauser-anda';
   ```
3. **Logout lalu login lagi** agar peran admin termuat ke sesi.
   Setelah login, admin diarahkan ke `/dashboard`, member ke `/akun`.

---

## Alur penggunaan

| Peran      | Setelah login | Bisa apa                                            |
| ---------- | ------------- | --------------------------------------------------- |
| **Member** | `/akun`       | Lihat status pendaftaran miliknya sendiri.          |
| **Admin**  | `/dashboard`  | Lihat semua pendaftaran & ubah statusnya.           |

Status pendaftaran: `baru` → `dihubungi` → `diterima` / `ditolak`.

## Catatan

- Jika `DATABASE_URL` kosong, situs tetap berjalan normal; hanya fitur login
  & penyimpanan ke Neon yang nonaktif (degrade dengan rapi).
- Kata sandi disimpan sebagai hash **scrypt** (tidak pernah disimpan polos).
- Sesi login berupa cookie **httpOnly** ber-tanda-tangan JWT (lib `jose`),
  berlaku 7 hari.
- File `.env.local` sudah masuk `.gitignore` — jangan commit kredensial.

## Deploy (mis. Vercel)

Tambahkan environment variable yang sama di dashboard hosting:

- `DATABASE_URL` — connection string Neon (pooled).
- `AUTH_SECRET` — string acak panjang.
- (Sanity tetap seperti sebelumnya, jika dipakai.)

-- ============================================================
--  SSB Sampali Putra — Skema Database (Neon / PostgreSQL)
--  Cara pakai: buka Neon SQL Editor, tempel SELURUH isi file ini,
--  lalu klik Run. Aman dijalankan berulang (pakai IF NOT EXISTS).
--  Panduan lengkap ada di NEON_SETUP.md
-- ============================================================

-- ------------------------------------------------------------
--  Tabel akun login (admin & member)
-- ------------------------------------------------------------
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  nama          text        not null,
  username      text        not null unique,  -- dipakai untuk LOGIN (unik, tak boleh sama)
  email         text        unique,           -- opsional (arsip/kontak), tak lagi untuk login
  password_hash text        not null,
  no_hp         text,
  role          text        not null default 'member',  -- diisi dari tabel master `role` (lookup)
  created_at    timestamptz not null default now()
);

-- Migrasi untuk database yang tabel users-nya sudah dibuat sebelumnya.
-- Aman dijalankan ulang (IF NOT EXISTS). Login kini pakai `username`,
-- `email` menjadi opsional.
alter table users add column if not exists username text;
create unique index if not exists users_username_key on users (username);
alter table users alter column email drop not null;

-- Role kini mengacu ke tabel master `role` (lookup), bukan lagi daftar tetap.
-- Hapus CHECK lama (users_role_check) agar nilai role bisa berupa entri apa pun
-- dari tabel role. Aman dijalankan ulang; mencari nama constraint secara dinamis.
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'users'::regclass and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute 'alter table users drop constraint ' || quote_ident(c.conname);
  end loop;
end $$;

-- ------------------------------------------------------------
--  Tabel master role (data acuan peran)
--  Kolom `role` menyimpan nama peran; `deskripsi` opsional.
-- ------------------------------------------------------------
create table if not exists role (
  id          uuid primary key default gen_random_uuid(),
  role        text        not null,
  deskripsi   text,
  created_at  timestamptz not null default now()
);

-- Migrasi kolom deskripsi untuk tabel role yang sudah dibuat sebelumnya.
-- Aman dijalankan ulang (IF NOT EXISTS).
alter table role add column if not exists deskripsi text;

-- Pastikan created_at punya default (untuk tabel yang dibuat tanpa default).
alter table role alter column created_at set default now();

-- Nama role unik tanpa memandang huruf besar/kecil (mis. "Pelatih" == "pelatih").
create unique index if not exists role_nama_key on role (lower(role));
create index if not exists idx_role_created on role (created_at desc);

-- Seed peran dasar yang dibutuhkan sistem. "admin" adalah satu-satunya peran
-- istimewa (akses admin); peran lain diperlakukan sebagai pengguna biasa.
-- Idempoten: hanya menambah bila belum ada (tanpa memandang huruf besar/kecil).
insert into role (role, deskripsi)
select v.nama, v.desk from (values
  ('admin',  'Akses penuh (administrator)'),
  ('member', 'Akun anggota biasa')
) as v(nama, desk)
where not exists (select 1 from role r where lower(r.role) = lower(v.nama));

-- ------------------------------------------------------------
--  Tabel pendaftaran calon siswa
--  (mengikuti formulir pendaftaran di website)
-- ------------------------------------------------------------
create table if not exists pendaftaran (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references users(id) on delete set null,
  nama_lengkap   text        not null,
  nama_panggilan text,
  jenis_kelamin  text,
  tempat_lahir   text,
  tanggal_lahir  date,
  no_hp          text        not null,
  nama_sekolah   text,
  kelas          text,
  berat_badan    text,
  tinggi_badan   text,
  golongan_darah text,
  nama_orang_tua text,
  foto           text,        -- foto siswa (data URL base64, hasil kompres di browser)
  status         text        not null default 'baru'
                   check (status in ('baru', 'dihubungi', 'diterima', 'ditolak')),
  created_at     timestamptz not null default now()
);

-- Migrasi kolom foto untuk database yang tabelnya sudah dibuat sebelumnya.
-- Aman dijalankan ulang (IF NOT EXISTS).
alter table pendaftaran add column if not exists foto text;

-- Migrasi tipe kolom tanggal_lahir: dari text (format "dd-mm-yyyy") menjadi date.
-- Aman & idempoten: hanya berjalan bila kolom masih bertipe text, dan mengonversi
-- data lama dengan benar (nilai tak valid menjadi NULL).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'pendaftaran'
      and column_name = 'tanggal_lahir'
      and data_type <> 'date'
  ) then
    alter table pendaftaran
      alter column tanggal_lahir type date
      using (
        case
          when tanggal_lahir ~ '^\d{2}-\d{2}-\d{4}$'
            then to_date(tanggal_lahir, 'DD-MM-YYYY')
          else null
        end
      );
  end if;
end $$;

create index if not exists idx_pendaftaran_status  on pendaftaran (status);
create index if not exists idx_pendaftaran_user    on pendaftaran (user_id);
create index if not exists idx_pendaftaran_created on pendaftaran (created_at desc);

-- ------------------------------------------------------------
--  Tabel siswa (siswa yang sudah diterima/aktif)
--  Kolomnya sama dengan `pendaftaran`; status: aktif/nonaktif/lulus.
-- ------------------------------------------------------------
create table if not exists siswa (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references users(id) on delete set null,
  nama_lengkap   text        not null,
  nama_panggilan text,
  jenis_kelamin  text,
  tempat_lahir   text,
  tanggal_lahir  date,
  no_hp          text        not null,
  nama_sekolah   text,
  kelas          text,
  berat_badan    text,
  tinggi_badan   text,
  golongan_darah text,
  nama_orang_tua text,
  status         text        not null default 'aktif',
  created_at     timestamptz not null default now(),
  foto           text         -- foto siswa (data URL base64, hasil kompres di browser)
);

-- Migrasi untuk tabel siswa yang sudah dibuat sebelumnya tanpa default.
-- Aman dijalankan ulang.
alter table siswa alter column created_at set default now();
alter table siswa alter column status set default 'aktif';

-- Tautan ke pendaftaran asal: pendaftaran berstatus 'diterima' otomatis
-- disalin ke siswa (status 'siswa'). Unique index mencegah satu pendaftaran
-- tersalin dua kali (NULL boleh banyak — siswa yang ditambah manual).
alter table siswa add column if not exists
  pendaftaran_id uuid references pendaftaran(id) on delete set null;
create unique index if not exists siswa_pendaftaran_key on siswa (pendaftaran_id);

-- NIS (Nomor Induk Siswa): terisi OTOMATIS saat baris siswa dibuat, berformat
-- 4 digit berurutan dengan nol di depan (0001, 0002, ...). Nilai berikutnya =
-- NIS numerik terbesar yang ada + 1, dihitung atomik di dalam INSERT (lihat
-- app/api/siswa/route.ts & lib/siswaTransfer.ts). Unique index mencegah NIS
-- ganda (NULL boleh banyak — untuk data lama sebelum kolom ini ada).
alter table siswa add column if not exists nis text;
create unique index if not exists siswa_nis_key on siswa (nis);

create index if not exists idx_siswa_status  on siswa (status);
create index if not exists idx_siswa_created on siswa (created_at desc);

-- ------------------------------------------------------------
--  Keuangan: SPP, Penerimaan, Pengeluaran
--  Tabel dibuat langsung di Neon; didokumentasikan di sini agar setup baru
--  lengkap. Aman dijalankan ulang (IF NOT EXISTS / SET DEFAULT).
-- ------------------------------------------------------------

-- Pembayaran SPP siswa. `userid` = id user (admin) yang mencatat.
create table if not exists spp (
  id         uuid        primary key default gen_random_uuid(),
  tglbayar   date,
  bulan      date,       -- bulan yang dibayar, disimpan sebagai tanggal (mis. 2026-01-01)
  iuran      numeric,
  userid     text,
  created_at timestamptz not null default now()
);
alter table spp alter column created_at set default now();
create index if not exists idx_spp_tgl on spp (tglbayar desc);

-- Tautan ke siswa pembayar SPP. Nullable (data lama tanpa siswa). FK sengaja
-- TANPA cascade: siswa yang punya riwayat SPP tak bisa dihapus (juga dijaga di
-- route API DELETE /api/siswa/[id] dengan pesan yang jelas). Aman dijalankan
-- ulang (IF NOT EXISTS).
alter table spp add column if not exists siswa_id uuid references siswa(id);
create index if not exists idx_spp_siswa on spp (siswa_id);

-- Penerimaan (kas masuk). Baris yang berasal dari SPP ditandai `spp_id`;
-- baris tsb tidak boleh diedit/dihapus langsung — dikelola lewat menu SPP.
create table if not exists penerimaan (
  id         uuid        primary key default gen_random_uuid(),
  tgl        date,
  keterangan text,
  nominal    numeric,
  userid     text,
  created_at timestamptz not null default now()
);
alter table penerimaan alter column created_at set default now();
-- Tautan ke SPP asal: menghapus SPP otomatis menghapus baris penerimaannya.
alter table penerimaan add column if not exists
  spp_id uuid references spp(id) on delete cascade;
create unique index if not exists penerimaan_spp_key on penerimaan (spp_id);
create index if not exists idx_penerimaan_tgl on penerimaan (tgl desc);

-- Pengeluaran (kas keluar).
create table if not exists pengeluaran (
  id         uuid        primary key default gen_random_uuid(),
  tgl        date,
  keterangan text,
  nominal    numeric,
  userid     text,
  created_at timestamptz not null default now()
);
alter table pengeluaran alter column created_at set default now();
create index if not exists idx_pengeluaran_tgl on pengeluaran (tgl desc);

-- ============================================================
--  VIEW LAPORAN (dibuat dengan CREATE OR REPLACE — aman dijalankan ulang)
-- ============================================================

-- ------------------------------------------------------------
--  v_rekap_spp_tahunan — rekap pembayaran SPP per tahun, dengan tiap
--  bulan sebagai kolom (Januari..Desember) + kolom total.
--  Satu baris per tahun. Nilai = jumlah `iuran` untuk bulan tsb, DIHITUNG
--  DARI kolom `bulan` (bertipe date — bulan/tahun diambil dari tanggalnya),
--  bukan dari `tglbayar`. Bulan tanpa pembayaran bernilai 0.
-- ------------------------------------------------------------
create or replace view v_rekap_spp_tahunan as
select
  extract(year from bulan)::int as tahun,
  coalesce(sum(iuran) filter (where extract(month from bulan) = 1),  0) as januari,
  coalesce(sum(iuran) filter (where extract(month from bulan) = 2),  0) as februari,
  coalesce(sum(iuran) filter (where extract(month from bulan) = 3),  0) as maret,
  coalesce(sum(iuran) filter (where extract(month from bulan) = 4),  0) as april,
  coalesce(sum(iuran) filter (where extract(month from bulan) = 5),  0) as mei,
  coalesce(sum(iuran) filter (where extract(month from bulan) = 6),  0) as juni,
  coalesce(sum(iuran) filter (where extract(month from bulan) = 7),  0) as juli,
  coalesce(sum(iuran) filter (where extract(month from bulan) = 8),  0) as agustus,
  coalesce(sum(iuran) filter (where extract(month from bulan) = 9),  0) as september,
  coalesce(sum(iuran) filter (where extract(month from bulan) = 10), 0) as oktober,
  coalesce(sum(iuran) filter (where extract(month from bulan) = 11), 0) as november,
  coalesce(sum(iuran) filter (where extract(month from bulan) = 12), 0) as desember,
  coalesce(sum(iuran), 0) as total
from spp
where bulan is not null
group by extract(year from bulan)
order by tahun desc;

-- ------------------------------------------------------------
--  v_rekap_spp_siswa — rekap pembayaran SPP per SISWA per tahun, tiap
--  bulan sebagai kolom (Januari..Desember) + kolom total. Satu baris per
--  (tahun, siswa). Sama seperti v_rekap_spp_tahunan tetapi dipecah per
--  siswa dan menambah kolom nis + nama. Nilai dihitung DARI kolom `bulan`
--  (bertipe date), bukan `tglbayar`. Hanya SPP yang punya siswa (inner join).
-- ------------------------------------------------------------
create or replace view v_rekap_spp_siswa as
select
  extract(year from s.bulan)::int as tahun,
  sw.id   as siswa_id,
  sw.nis  as nis,
  sw.nama_lengkap as nama,
  coalesce(sum(s.iuran) filter (where extract(month from s.bulan) = 1),  0) as januari,
  coalesce(sum(s.iuran) filter (where extract(month from s.bulan) = 2),  0) as februari,
  coalesce(sum(s.iuran) filter (where extract(month from s.bulan) = 3),  0) as maret,
  coalesce(sum(s.iuran) filter (where extract(month from s.bulan) = 4),  0) as april,
  coalesce(sum(s.iuran) filter (where extract(month from s.bulan) = 5),  0) as mei,
  coalesce(sum(s.iuran) filter (where extract(month from s.bulan) = 6),  0) as juni,
  coalesce(sum(s.iuran) filter (where extract(month from s.bulan) = 7),  0) as juli,
  coalesce(sum(s.iuran) filter (where extract(month from s.bulan) = 8),  0) as agustus,
  coalesce(sum(s.iuran) filter (where extract(month from s.bulan) = 9),  0) as september,
  coalesce(sum(s.iuran) filter (where extract(month from s.bulan) = 10), 0) as oktober,
  coalesce(sum(s.iuran) filter (where extract(month from s.bulan) = 11), 0) as november,
  coalesce(sum(s.iuran) filter (where extract(month from s.bulan) = 12), 0) as desember,
  coalesce(sum(s.iuran), 0) as total
from spp s
join siswa sw on sw.id = s.siswa_id
where s.bulan is not null
group by extract(year from s.bulan), sw.id, sw.nis, sw.nama_lengkap
order by tahun desc, sw.nis asc nulls last, sw.nama_lengkap asc;

-- ------------------------------------------------------------
--  view_status_pembayaran_spp — status pembayaran SPP per BULAN untuk
--  setiap siswa AKTIF. Untuk tiap bulan yang pernah tercatat di tabel
--  `spp`, tiap siswa aktif muncul satu baris dengan `status_pembayaran`:
--    'Sudah Bayar' bila ada pembayaran SPP untuk bulan itu, atau
--    'Belum Bayar' bila tidak ada.
--  `bulan_tagihan` = kolom `bulan` apa adanya (bertipe date, mis.
--  2026-07-01); `tanggal_bayar` = `tglbayar` (NULL bila belum bayar);
--  `jumlah_bayar` = `iuran` yang dibayar bulan itu (NULL bila belum bayar).
--  Kolom: siswa_id, nama_lengkap, kelas, no_hp, bulan_tagihan,
--  tanggal_bayar, jumlah_bayar, status_pembayaran.
-- ------------------------------------------------------------
create or replace view view_status_pembayaran_spp as
with daftar_bulan as (
  select distinct bulan
  from spp
  where bulan is not null
),
data_siswa as (
  select id, nama_lengkap, kelas, no_hp, status
  from siswa
  where status = 'aktif'
)
select
  ds.id as siswa_id,
  ds.nama_lengkap,
  ds.kelas,
  ds.no_hp,
  db.bulan as bulan_tagihan,
  s.tglbayar as tanggal_bayar,
  s.iuran as jumlah_bayar,
  case when s.id is not null then 'Sudah Bayar' else 'Belum Bayar' end as status_pembayaran
from data_siswa ds
cross join daftar_bulan db
left join spp s on ds.id = s.siswa_id and db.bulan = s.bulan;

-- ------------------------------------------------------------
--  v_transaksi_keuangan — buku kas gabungan penerimaan + pengeluaran
--  dengan SALDO BERJALAN (running balance). Penerimaan menambah saldo
--  (`masuk`), pengeluaran mengurangi (`keluar`). Diurutkan berdasarkan
--  `tgl` (fallback ke created_at bila tgl NULL), lalu created_at, lalu id
--  sebagai tie-breaker agar saldo deterministik.
--  Kolom: id, tgl, created_at, jenis, keterangan, masuk, keluar, saldo.
-- ------------------------------------------------------------
create or replace view v_transaksi_keuangan as
with tx as (
  select id, tgl, created_at, 'Penerimaan' as jenis, keterangan,
         coalesce(nominal, 0) as masuk, 0::numeric as keluar
  from penerimaan
  union all
  select id, tgl, created_at, 'Pengeluaran' as jenis, keterangan,
         0::numeric as masuk, coalesce(nominal, 0) as keluar
  from pengeluaran
)
select
  id, tgl, created_at, jenis, keterangan, masuk, keluar,
  sum(masuk - keluar) over (
    order by coalesce(tgl, created_at::date), created_at, id
    rows between unbounded preceding and current row
  ) as saldo
from tx
order by coalesce(tgl, created_at::date), created_at, id;

-- ============================================================
--  BOOTSTRAP ADMIN
--  1) Daftarkan akun lewat halaman  /daftar-akun  (otomatis jadi 'member').
--  2) Naikkan akun itu menjadi admin dengan perintah berikut
--     (ganti nama user-nya), jalankan sekali di SQL Editor:
--
--       update users set role = 'admin'
--       where username = 'namauser-anda';
--
--  3) Cek hasilnya:
--       select username, role from users;
-- ============================================================

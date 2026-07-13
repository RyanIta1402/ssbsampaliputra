import type { NeonQueryFunction } from "@neondatabase/serverless";

/**
 * MEMINDAHKAN satu baris pendaftaran ke tabel siswa: menyalin datanya ke
 * `siswa` (status 'aktif') LALU MENGHAPUS baris pendaftaran asalnya. Dipanggil
 * saat status pendaftaran menjadi 'diterima' — baik lewat ubah status cepat di
 * dashboard, edit (PATCH /api/pendaftaran/[id]), maupun saat admin membuat
 * pendaftaran baru yang langsung berstatus diterima (POST /api/pendaftaran).
 *
 * Atomik: pemindahan (DELETE pendaftaran + INSERT siswa) dijalankan dalam SATU
 * statement lewat data-modifying CTE, sehingga tidak mungkin data hanya
 * setengah pindah bila salah satu langkah gagal.
 *
 * Aman untuk data lama & idempoten: bila sudah ada siswa yang tertaut ke
 * pendaftaran ini (hasil "salin" versi terdahulu), baris pendaftaran tetap
 * dihapus tetapi tidak disalin ulang (guard NOT EXISTS) sehingga tak terjadi
 * duplikat. Kolom `pendaftaran_id` sengaja dibiarkan NULL karena baris asalnya
 * dihapus — mengisinya akan melanggar foreign key.
 *
 * Modul server-only (dipakai route API & server action). Jangan diimpor ke
 * komponen client.
 */
export async function pindahkanPendaftaranKeSiswa(
  sql: NeonQueryFunction<false, false>,
  pendaftaranId: string
): Promise<void> {
  await sql`
    with dipindah as (
      delete from pendaftaran
      where id = ${pendaftaranId}
      returning id, user_id, nama_lengkap, nama_panggilan, jenis_kelamin,
                tempat_lahir, tanggal_lahir, no_hp, nama_sekolah, kelas,
                berat_badan, tinggi_badan, golongan_darah, nama_orang_tua, foto
    )
    insert into siswa (
      nis, user_id, nama_lengkap, nama_panggilan, jenis_kelamin, tempat_lahir,
      tanggal_lahir, no_hp, nama_sekolah, kelas, berat_badan, tinggi_badan,
      golongan_darah, nama_orang_tua, foto, status
    )
    select
           -- NIS otomatis: NIS numerik terbesar yang ada + 1, format 4 digit.
           (select lpad((coalesce(max(nis::int), 0) + 1)::text, 4, '0')
              from siswa where nis ~ '^[0-9]+$'),
           user_id, nama_lengkap, nama_panggilan, jenis_kelamin, tempat_lahir,
           tanggal_lahir, no_hp, nama_sekolah, kelas, berat_badan, tinggi_badan,
           golongan_darah, nama_orang_tua, foto, 'aktif'
    from dipindah
    where not exists (
      select 1 from siswa s where s.pendaftaran_id = dipindah.id
    )
  `;
}

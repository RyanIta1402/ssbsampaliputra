import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AccountHeader from "@/components/account/AccountHeader";
import SiswaGrid, { type SiswaRow } from "@/components/account/SiswaGrid";
import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";

export const metadata: Metadata = {
  title: "Siswa",
  robots: { index: false, follow: false },
};

export default async function SiswaPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!canManage(session.role)) redirect("/akun");

  let rows: SiswaRow[] = [];
  let dbError = false;
  if (isDbConfigured) {
    try {
      const sql = getSql();
      // Sumber data: view `v_siswa` (tabel siswa + kolom turunan).
      //
      // `bulan_tagihan_terakhir` datang dari view dan bersifat GLOBAL: nilainya
      // bulan tagihan terakhir yang ada di tabel spp, sama untuk semua siswa
      // aktif (null untuk siswa nonaktif). Jadi kolom itu HANYA untuk
      // ditampilkan, bukan penanda pembayaran per siswa.
      //
      // `spp_terakhir` tetap dihitung terpisah karena harus PER SISWA — dipakai
      // surat pemberitahuan iuran untuk menebak periode tunggakan.
      rows = (await sql`
        select v.id, v.nis, v.nama_lengkap, v.nama_panggilan, v.jenis_kelamin,
               v.tempat_lahir, v.tanggal_lahir, v.no_hp, v.nama_sekolah, v.kelas,
               v.berat_badan, v.tinggi_badan, v.golongan_darah, v.nama_orang_tua,
               v.foto, v.status, v.created_at, v.updated_at,
               v.bulan_tagihan_terakhir,
               (select max(p.bulan) from spp p where p.siswa_id = v.id) as spp_terakhir
        from v_siswa v
        order by v.created_at desc
      `) as SiswaRow[];
    } catch (err) {
      console.error("Gagal memuat siswa:", err);
      dbError = true;
    }
  }

  return (
    <main className="min-h-screen bg-ink">
      <AccountHeader role={session.role} userName={session.nama} />
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <p className="tag-label mb-3">Data Siswa</p>
        <h1 className="font-display text-3xl uppercase leading-tight text-bone sm:text-4xl">
          Daftar <span className="text-pitch">Siswa</span>
        </h1>

        {!isDbConfigured && (
          <p className="mt-8 border border-gold/30 bg-gold/10 p-4 text-sm text-gold">
            Database Neon belum dikonfigurasi. Isi DATABASE_URL di .env.local —
            lihat NEON_SETUP.md.
          </p>
        )}
        {dbError && (
          <p className="mt-8 border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            Gagal memuat data siswa. Pastikan tabel `siswa` sudah ada di
            database (db/schema.sql).
          </p>
        )}

        <div className="mt-8">
          <SiswaGrid rows={rows} />
        </div>
      </div>
    </main>
  );
}

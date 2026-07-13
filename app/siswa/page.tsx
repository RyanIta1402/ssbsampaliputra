import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AccountHeader from "@/components/account/AccountHeader";
import type { PesertaRow } from "@/components/account/PesertaForm";
import SiswaGrid from "@/components/account/SiswaGrid";
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

  let rows: PesertaRow[] = [];
  let dbError = false;
  if (isDbConfigured) {
    try {
      const sql = getSql();
      rows = (await sql`
        select id, nis, nama_lengkap, nama_panggilan, jenis_kelamin, tempat_lahir,
               tanggal_lahir, no_hp, nama_sekolah, kelas, berat_badan,
               tinggi_badan, golongan_darah, nama_orang_tua, foto, status,
               created_at, updated_at
        from siswa
        order by created_at desc
      `) as PesertaRow[];
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

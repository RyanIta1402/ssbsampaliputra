import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AccountHeader from "@/components/account/AccountHeader";
import PendaftaranGrid from "@/components/account/PendaftaranGrid";
import type { PesertaRow } from "@/components/account/PesertaForm";
import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";

export const metadata: Metadata = {
  title: "Pendaftaran",
  robots: { index: false, follow: false },
};

export default async function PendaftaranPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const bisaKelola = canManage(session.role);

  let rows: PesertaRow[] = [];
  let dbError = false;
  if (isDbConfigured) {
    try {
      const sql = getSql();
      // Pengelola melihat semua; member hanya pendaftaran miliknya sendiri.
      rows = (
        bisaKelola
          ? await sql`
              select id, nama_lengkap, nama_panggilan, jenis_kelamin,
                     tempat_lahir, tanggal_lahir, no_hp, nama_sekolah, kelas,
                     berat_badan, tinggi_badan, golongan_darah, nama_orang_tua,
                     foto, status, created_at, updated_at
              from pendaftaran
              order by created_at desc`
          : await sql`
              select id, nama_lengkap, nama_panggilan, jenis_kelamin,
                     tempat_lahir, tanggal_lahir, no_hp, nama_sekolah, kelas,
                     berat_badan, tinggi_badan, golongan_darah, nama_orang_tua,
                     foto, status, created_at, updated_at
              from pendaftaran
              where user_id = ${session.id}
              order by created_at desc`
      ) as PesertaRow[];
    } catch (err) {
      console.error("Gagal memuat pendaftaran:", err);
      dbError = true;
    }
  }

  return (
    <main className="min-h-screen bg-ink">
      <AccountHeader role={session.role} userName={session.nama} />
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <p className="tag-label mb-3">Data Pendaftaran</p>
        <h1 className="font-display text-3xl uppercase leading-tight text-bone sm:text-4xl">
          {bisaKelola ? "Kelola " : ""}
          <span className="text-pitch">Pendaftaran</span>
        </h1>

        {!isDbConfigured && (
          <p className="mt-8 border border-gold/30 bg-gold/10 p-4 text-sm text-gold">
            Database Neon belum dikonfigurasi. Isi DATABASE_URL di .env.local —
            lihat NEON_SETUP.md.
          </p>
        )}
        {dbError && (
          <p className="mt-8 border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            Gagal memuat data. Pastikan skema sudah dijalankan (db/schema.sql).
          </p>
        )}

        <div className="mt-8">
          <PendaftaranGrid rows={rows} isAdmin={bisaKelola} />
        </div>
      </div>
    </main>
  );
}

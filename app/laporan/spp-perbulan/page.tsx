import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AccountHeader from "@/components/account/AccountHeader";
import LaporanSppBulanGrid, {
  type StatusSppRow,
} from "@/components/account/LaporanSppBulanGrid";
import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";

export const metadata: Metadata = {
  title: "Laporan SPP Perbulan",
  robots: { index: false, follow: false },
};

export default async function LaporanSppPerbulanPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!canManage(session.role)) redirect("/akun");

  let rows: StatusSppRow[] = [];
  let dbError = false;
  if (isDbConfigured) {
    try {
      const sql = getSql();
      // Satu siswa bisa membayar >1 kali dalam bulan yang sama, jadi konsolidasi
      // per siswa-bulan: nominal DIJUMLAHKAN, tanggal bayar ambil yang TERBARU.
      rows = (await sql`
        select
          siswa_id,
          nama_lengkap,
          kelas,
          bulan_tagihan,
          case
            when bool_or(status_pembayaran = 'Sudah Bayar') then 'Sudah Bayar'
            else 'Belum Bayar'
          end as status_pembayaran,
          max(tanggal_bayar) as tanggal_bayar,
          sum(jumlah_bayar) as jumlah_bayar
        from view_status_pembayaran_spp
        group by siswa_id, nama_lengkap, kelas, bulan_tagihan
      `) as StatusSppRow[];
    } catch (err) {
      console.error("Gagal memuat laporan status SPP:", err);
      dbError = true;
    }
  }

  return (
    <main className="min-h-screen bg-ink">
      <AccountHeader role={session.role} userName={session.nama} />
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <p className="tag-label mb-3">Laporan</p>
        <h1 className="font-display text-3xl uppercase leading-tight text-bone sm:text-4xl">
          Laporan <span className="text-pitch">SPP Perbulan</span>
        </h1>

        {!isDbConfigured && (
          <p className="mt-8 border border-gold/30 bg-gold/10 p-4 text-sm text-gold">
            Database Neon belum dikonfigurasi. Isi DATABASE_URL di .env.local —
            lihat NEON_SETUP.md.
          </p>
        )}
        {dbError && (
          <p className="mt-8 border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            Gagal memuat laporan. Pastikan view `view_status_pembayaran_spp`
            sudah dibuat di database (db/schema.sql).
          </p>
        )}

        {isDbConfigured && !dbError && (
          <div className="mt-8">
            <LaporanSppBulanGrid rows={rows} />
          </div>
        )}
      </div>
    </main>
  );
}

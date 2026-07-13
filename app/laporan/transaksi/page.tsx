import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AccountHeader from "@/components/account/AccountHeader";
import LaporanTransaksiGrid, {
  type TransaksiRow,
} from "@/components/account/LaporanTransaksiGrid";
import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";

export const metadata: Metadata = {
  title: "Laporan Transaksi",
  robots: { index: false, follow: false },
};

export default async function LaporanTransaksiPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!canManage(session.role)) redirect("/akun");

  let rows: TransaksiRow[] = [];
  let dbError = false;
  if (isDbConfigured) {
    try {
      const sql = getSql();
      rows = (await sql`
        select id, tgl, jenis, keterangan, masuk, keluar, saldo
        from v_transaksi_keuangan
      `) as TransaksiRow[];
    } catch (err) {
      console.error("Gagal memuat laporan transaksi:", err);
      dbError = true;
    }
  }

  return (
    <main className="min-h-screen bg-ink">
      <AccountHeader role={session.role} userName={session.nama} />
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <p className="tag-label mb-3">Laporan</p>
        <h1 className="font-display text-3xl uppercase leading-tight text-bone sm:text-4xl">
          Laporan <span className="text-pitch">Transaksi</span>
        </h1>

        {!isDbConfigured && (
          <p className="mt-8 border border-gold/30 bg-gold/10 p-4 text-sm text-gold">
            Database Neon belum dikonfigurasi. Isi DATABASE_URL di .env.local —
            lihat NEON_SETUP.md.
          </p>
        )}
        {dbError && (
          <p className="mt-8 border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            Gagal memuat laporan. Pastikan view `v_transaksi_keuangan` sudah
            dibuat di database (db/schema.sql).
          </p>
        )}

        {isDbConfigured && !dbError && (
          <div className="mt-8">
            <LaporanTransaksiGrid rows={rows} />
          </div>
        )}
      </div>
    </main>
  );
}

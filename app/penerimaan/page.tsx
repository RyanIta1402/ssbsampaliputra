import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AccountHeader from "@/components/account/AccountHeader";
import { type KasRow } from "@/components/account/KasForm";
import PenerimaanGrid from "@/components/account/PenerimaanGrid";
import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";

export const metadata: Metadata = {
  title: "Penerimaan",
  robots: { index: false, follow: false },
};

export default async function PenerimaanPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!canManage(session.role)) redirect("/akun");

  let rows: KasRow[] = [];
  let dbError = false;
  if (isDbConfigured) {
    try {
      const sql = getSql();
      rows = (await sql`
        select id, tgl, keterangan, nominal, spp_id, created_at, updated_at
        from penerimaan
        order by tgl desc nulls last, created_at desc
      `) as KasRow[];
    } catch (err) {
      console.error("Gagal memuat penerimaan:", err);
      dbError = true;
    }
  }

  return (
    <main className="min-h-screen bg-ink">
      <AccountHeader role={session.role} userName={session.nama} />
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <p className="tag-label mb-3">Transaksi</p>
        <h1 className="font-display text-3xl uppercase leading-tight text-bone sm:text-4xl">
          Kas <span className="text-pitch">Penerimaan</span>
        </h1>

        {!isDbConfigured && (
          <p className="mt-8 border border-gold/30 bg-gold/10 p-4 text-sm text-gold">
            Database Neon belum dikonfigurasi. Isi DATABASE_URL di .env.local —
            lihat NEON_SETUP.md.
          </p>
        )}
        {dbError && (
          <p className="mt-8 border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            Gagal memuat data penerimaan. Pastikan tabel `penerimaan` ada di
            database.
          </p>
        )}

        <div className="mt-8">
          <PenerimaanGrid rows={rows} />
        </div>
      </div>
    </main>
  );
}

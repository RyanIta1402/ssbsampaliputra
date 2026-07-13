import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AccountHeader from "@/components/account/AccountHeader";
import SppGrid, {
  type SiswaOption,
  type SppRow,
} from "@/components/account/SppGrid";
import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";

export const metadata: Metadata = {
  title: "SPP",
  robots: { index: false, follow: false },
};

export default async function SppPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!canManage(session.role)) redirect("/akun");

  let rows: SppRow[] = [];
  let siswaList: SiswaOption[] = [];
  let dbError = false;
  if (isDbConfigured) {
    try {
      const sql = getSql();
      rows = (await sql`
        select s.id, s.tglbayar, s.bulan, s.iuran, s.created_at, s.updated_at, s.siswa_id,
               sw.nis as siswa_nis, sw.nama_lengkap as siswa_nama
        from spp s
        left join siswa sw on sw.id = s.siswa_id
        order by s.tglbayar desc nulls last, s.created_at desc
      `) as SppRow[];
      siswaList = (await sql`
        select id, nis, nama_lengkap, nama_sekolah, kelas, status
        from siswa
        order by nis asc nulls last, nama_lengkap asc
      `) as SiswaOption[];
    } catch (err) {
      console.error("Gagal memuat data SPP:", err);
      dbError = true;
    }
  }

  return (
    <main className="min-h-screen bg-ink">
      <AccountHeader role={session.role} userName={session.nama} />
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <p className="tag-label mb-3">Keuangan</p>
        <h1 className="font-display text-3xl uppercase leading-tight text-bone sm:text-4xl">
          Pembayaran <span className="text-pitch">SPP</span>
        </h1>

        {!isDbConfigured && (
          <p className="mt-8 border border-gold/30 bg-gold/10 p-4 text-sm text-gold">
            Database Neon belum dikonfigurasi. Isi DATABASE_URL di .env.local —
            lihat NEON_SETUP.md.
          </p>
        )}
        {dbError && (
          <p className="mt-8 border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            Gagal memuat data SPP. Pastikan tabel `spp` ada di database.
          </p>
        )}

        <div className="mt-8">
          <SppGrid rows={rows} siswaList={siswaList} />
        </div>
      </div>
    </main>
  );
}

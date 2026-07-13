import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AccountHeader from "@/components/account/AccountHeader";
import ListTurnamenGrid, {
  type ListTurnamenRow,
  type TurnamenOption,
} from "@/components/account/ListTurnamenGrid";
import { type SiswaOption } from "@/components/account/SppGrid";
import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";

export const metadata: Metadata = {
  title: "List Turnamen",
  robots: { index: false, follow: false },
};

export default async function ListTurnamenPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!canManage(session.role)) redirect("/akun");

  let rows: ListTurnamenRow[] = [];
  let siswaList: SiswaOption[] = [];
  let turnamenList: TurnamenOption[] = [];
  let dbError = false;
  if (isDbConfigured) {
    try {
      const sql = getSql();
      rows = (await sql`
        select lt.id, lt.turnamen_id, lt.siswa_id, lt.keterangan,
               lt.statusbayar, lt.created_at, lt.updated_at,
               sw.nis as siswa_nis, sw.nama_lengkap as siswa_nama,
               t.namaturnamen as turnamen_nama, t.tglturnamen as turnamen_tgl
        from listturnamen lt
        left join siswa sw on sw.id = lt.siswa_id
        left join turnamen t on t.id = lt.turnamen_id
        order by lt.created_at desc
      `) as ListTurnamenRow[];
      siswaList = (await sql`
        select id, nis, nama_lengkap, nama_sekolah, kelas, status
        from siswa
        order by nis asc nulls last, nama_lengkap asc
      `) as SiswaOption[];
      turnamenList = (await sql`
        select id, namaturnamen
        from turnamen
        order by tglturnamen desc nulls last, namaturnamen asc
      `) as TurnamenOption[];
    } catch (err) {
      console.error("Gagal memuat list turnamen:", err);
      dbError = true;
    }
  }

  return (
    <main className="min-h-screen bg-ink">
      <AccountHeader role={session.role} userName={session.nama} />
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <p className="tag-label mb-3">Data Siswa</p>
        <h1 className="font-display text-3xl uppercase leading-tight text-bone sm:text-4xl">
          List <span className="text-pitch">Turnamen</span>
        </h1>

        {!isDbConfigured && (
          <p className="mt-8 border border-gold/30 bg-gold/10 p-4 text-sm text-gold">
            Database Neon belum dikonfigurasi. Isi DATABASE_URL di .env.local —
            lihat NEON_SETUP.md.
          </p>
        )}
        {dbError && (
          <p className="mt-8 border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            Gagal memuat data list turnamen.
          </p>
        )}

        <div className="mt-8">
          <ListTurnamenGrid
            rows={rows}
            siswaList={siswaList}
            turnamenList={turnamenList}
          />
        </div>
      </div>
    </main>
  );
}

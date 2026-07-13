import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AccountHeader from "@/components/account/AccountHeader";
import RoleGrid, { type RoleRow } from "@/components/account/RoleGrid";
import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";

export const metadata: Metadata = {
  title: "Role",
  robots: { index: false, follow: false },
};

export default async function RolePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect(canManage(session.role) ? "/dashboard" : "/akun");

  let roles: RoleRow[] = [];
  let dbError = false;
  if (isDbConfigured) {
    try {
      const sql = getSql();
      roles = (await sql`
        select id, role as nama, deskripsi, created_at, updated_at
        from role
        order by created_at desc
      `) as RoleRow[];
    } catch (err) {
      console.error("Gagal memuat daftar role:", err);
      dbError = true;
    }
  }

  return (
    <main className="min-h-screen bg-ink">
      <AccountHeader role={session.role} userName={session.nama} />
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <p className="tag-label mb-3">Manajemen Master</p>
        <h1 className="font-display text-3xl uppercase leading-tight text-bone sm:text-4xl">
          Daftar <span className="text-pitch">Role</span>
        </h1>
        <p className="mt-3 max-w-lg text-bone/60">
          Kelola data master role SSB Sampali Putra ({roles.length}). Cari,
          urutkan, dan kelola role lewat tombol di grid.
        </p>

        {!isDbConfigured && (
          <p className="mt-8 border border-gold/30 bg-gold/10 p-4 text-sm text-gold">
            Database Neon belum dikonfigurasi. Isi DATABASE_URL di .env.local —
            lihat NEON_SETUP.md.
          </p>
        )}
        {dbError && (
          <p className="mt-8 border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            Gagal memuat data role.
          </p>
        )}

        <div className="mt-8">
          <RoleGrid roles={roles} />
        </div>
      </div>
    </main>
  );
}

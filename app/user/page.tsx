import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AccountHeader from "@/components/account/AccountHeader";
import UserGrid, { type UserRow } from "@/components/account/UserGrid";
import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";

export const metadata: Metadata = {
  title: "Daftar User",
  robots: { index: false, follow: false },
};

export default async function UserPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect(canManage(session.role) ? "/dashboard" : "/akun");

  let users: UserRow[] = [];
  let roles: string[] = [];
  let dbError = false;
  if (isDbConfigured) {
    try {
      const sql = getSql();
      users = (await sql`
        select id, nama, username, email, no_hp, role, created_at, updated_at
        from users
        order by created_at desc
      `) as UserRow[];
      const roleRows = (await sql`
        select role from role order by role
      `) as { role: string }[];
      roles = roleRows.map((r) => r.role);
    } catch (err) {
      console.error("Gagal memuat daftar user:", err);
      dbError = true;
    }
  }

  return (
    <main className="min-h-screen bg-ink">
      <AccountHeader role={session.role} userName={session.nama} />
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <p className="tag-label mb-3">Manajemen Akun</p>
        <h1 className="font-display text-3xl uppercase leading-tight text-bone sm:text-4xl">
          Daftar <span className="text-pitch">User</span>
        </h1>
        <p className="mt-3 max-w-lg text-bone/60">
          Kelola akun login SSB Sampali Putra ({users.length}). Cari, filter
          role, urutkan, dan kelola user lewat tombol di grid.
        </p>

        {!isDbConfigured && (
          <p className="mt-8 border border-gold/30 bg-gold/10 p-4 text-sm text-gold">
            Database Neon belum dikonfigurasi. Isi DATABASE_URL di .env.local —
            lihat NEON_SETUP.md.
          </p>
        )}
        {dbError && (
          <p className="mt-8 border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            Gagal memuat data user.
          </p>
        )}

        <div className="mt-8">
          <UserGrid users={users} currentUserId={session.id} roles={roles} />
        </div>
      </div>
    </main>
  );
}

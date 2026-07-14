import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import AccountMenu from "@/components/account/AccountMenu";
import LogoutButton from "@/components/auth/LogoutButton";
import StatusBadge from "@/components/auth/StatusBadge";
import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";
import { pindahkanPendaftaranKeSiswa } from "@/lib/siswaTransfer";

export const metadata: Metadata = {
  title: "Dashboard Admin",
  robots: { index: false, follow: false },
};

const STATUSES = ["baru", "dihubungi", "diterima", "ditolak"] as const;
const STATUS_LABEL: Record<string, string> = {
  baru: "Baru",
  dihubungi: "Dihubungi",
  diterima: "Diterima",
  ditolak: "Ditolak",
};

type Row = {
  id: string;
  nama_lengkap: string;
  nama_panggilan: string | null;
  jenis_kelamin: string | null;
  no_hp: string;
  nama_sekolah: string | null;
  kelas: string | null;
  foto: string | null;
  status: string;
  created_at: string;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Server action: ubah status pendaftaran (admin saja).
async function updateStatus(formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session || !canManage(session.role)) return;

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !(STATUSES as readonly string[]).includes(status)) return;
  if (!isDbConfigured) return;

  const sql = getSql();
  // Status 'diterima' → pindahkan ke tabel siswa & hapus dari pendaftaran.
  if (status === "diterima") {
    await pindahkanPendaftaranKeSiswa(sql, id);
  } else {
    await sql`update pendaftaran set status = ${status} where id = ${id}`;
  }
  revalidatePath("/dashboard");
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!canManage(session.role)) redirect("/akun");

  let rows: Row[] = [];
  let siswaCount = 0;
  let dbError = false;
  if (isDbConfigured) {
    try {
      const sql = getSql();
      rows = (await sql`
        select id, nama_lengkap, nama_panggilan, jenis_kelamin, no_hp,
               nama_sekolah, kelas, foto, status, created_at
        from pendaftaran
        order by created_at desc
      `) as Row[];
      const siswaRows = (await sql`
        select count(*)::int as n from siswa
      `) as { n: number }[];
      siswaCount = siswaRows[0]?.n ?? 0;
    } catch (err) {
      console.error("Gagal memuat pendaftaran:", err);
      dbError = true;
    }
  }

  const counts = {
    total: rows.length,
    baru: rows.filter((r) => r.status === "baru").length,
    dihubungi: rows.filter((r) => r.status === "dihubungi").length,
    ditolak: rows.filter((r) => r.status === "ditolak").length,
  };

  return (
    <main className="min-h-screen bg-ink">
      <header className="border-b border-bone/10 bg-coal/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image
              src="/logo.png"
              alt="Logo SSB Sampali Putra"
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 object-contain"
            />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="font-display text-sm uppercase tracking-tight text-bone md:text-lg md:tracking-wide">
                SSB Sampali Putra System
              </span>
              <span className="truncate font-body text-[11px] font-semibold text-pitch md:text-xs">
                {session.nama}
              </span>
            </span>
          </Link>
          <AccountMenu role={session.role} />
          {/* Di HP tombol keluar ada di dalam drawer AccountMenu. */}
          <div className="hidden md:block">
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <p className="tag-label mb-3">Data Pendaftaran</p>
        <h1 className="font-display text-3xl uppercase leading-tight text-bone sm:text-4xl">
          Kelola <span className="text-pitch">Pendaftaran</span>
        </h1>

        {/* Ringkasan */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(
            [
              ["Total", counts.total],
              ["Baru", counts.baru],
              ["Dihubungi", counts.dihubungi],
              ["Ditolak", counts.ditolak],
              ["Siswa", siswaCount],
            ] as const
          ).map(([label, val]) => (
            <div key={label} className="card-edge p-4">
              <div className="font-display text-3xl text-bone">{val}</div>
              <div className="mt-1 font-body text-xs font-bold uppercase tracking-widest text-bone/40">
                {label}
              </div>
            </div>
          ))}
        </div>

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

        {/* Tabel */}
        <div className="mt-8 overflow-x-auto border border-bone/10">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-bone/10 bg-coal/60 font-body text-xs font-bold uppercase tracking-widest text-bone/40">
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">No. WhatsApp</th>
                <th className="px-4 py-3">Sekolah / Kelas</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ubah Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone/5">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-bone/40">
                    Belum ada data pendaftaran.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="text-sm text-bone/80">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {r.foto ? (
                          <a href={r.foto} target="_blank" rel="noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={r.foto}
                              alt={`Foto ${r.nama_lengkap}`}
                              className="h-10 w-10 shrink-0 rounded object-cover ring-1 ring-bone/15 transition-transform hover:scale-105"
                            />
                          </a>
                        ) : (
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-coal text-bone/30 ring-1 ring-bone/10">
                            —
                          </span>
                        )}
                        <div>
                          <div className="font-semibold text-bone">
                            {r.nama_lengkap}
                          </div>
                          <div className="text-xs text-bone/40">
                            {[r.nama_panggilan, r.jenis_kelamin]
                              .filter(Boolean)
                              .join(" · ") || "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://wa.me/${r.no_hp.replace(/\D/g, "").replace(/^0/, "62")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="transition-colors hover:text-pitch"
                      >
                        {r.no_hp}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      {[r.nama_sekolah, r.kelas].filter(Boolean).join(" · ") ||
                        "—"}
                    </td>
                    <td className="px-4 py-3 text-bone/50">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      <form action={updateStatus} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={r.id} />
                        <select
                          name="status"
                          defaultValue={r.status}
                          className="border border-bone/15 bg-coal px-2 py-1.5 text-xs text-bone outline-none focus:border-pitch"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          title="Simpan"
                          aria-label="Simpan"
                          className="border border-pitch/40 p-1.5 text-pitch transition-colors hover:bg-pitch hover:text-ink"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
                            <path d="M17 21v-8H7v8" />
                            <path d="M7 3v5h8" />
                          </svg>
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

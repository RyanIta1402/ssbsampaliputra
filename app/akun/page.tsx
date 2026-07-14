import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import AccountMenu from "@/components/account/AccountMenu";
import LogoutButton from "@/components/auth/LogoutButton";
import StatusBadge from "@/components/auth/StatusBadge";
import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";

export const metadata: Metadata = {
  title: "Akun Saya",
  robots: { index: false, follow: false },
};

type Row = {
  id: string;
  nama_lengkap: string;
  no_hp: string;
  nama_sekolah: string | null;
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

export default async function AkunPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (canManage(session.role)) redirect("/dashboard");

  let pendaftaran: Row[] = [];
  if (isDbConfigured) {
    try {
      const sql = getSql();
      pendaftaran = (await sql`
        select id, nama_lengkap, no_hp, nama_sekolah, foto, status, created_at
        from pendaftaran
        where user_id = ${session.id}
        order by created_at desc
      `) as Row[];
    } catch (err) {
      console.error("Gagal memuat pendaftaran member:", err);
    }
  }

  return (
    <main className="min-h-screen bg-ink">
      <header className="border-b border-bone/10 bg-coal/40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 lg:px-8">
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

      <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
        <p className="tag-label mb-3">Halo, {session.nama} 👋</p>
        <h1 className="font-display text-3xl uppercase leading-tight text-bone sm:text-4xl">
          Pendaftaran <span className="text-pitch">Saya</span>
        </h1>
        <p className="mt-3 max-w-lg text-bone/60">
          Pantau status pendaftaran yang Anda kirim. Pendaftaran yang dikirim
          saat sedang login akan otomatis tercatat di sini.
        </p>

        <div className="mt-10">
          {pendaftaran.length === 0 ? (
            <div className="card-edge p-8 text-center">
              <p className="text-bone/70">
                Belum ada pendaftaran. Lengkapi formulir pendaftaran untuk
                mendaftar.
              </p>
              <Link
                href="/#kontak"
                className="btn-primary mt-6 inline-flex"
              >
                Isi Formulir Pendaftaran
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {pendaftaran.map((p) => (
                <div
                  key={p.id}
                  className="card-edge flex flex-wrap items-center justify-between gap-4 p-6"
                >
                  <div className="flex items-center gap-4">
                    {p.foto ? (
                      <a href={p.foto} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.foto}
                          alt={`Foto ${p.nama_lengkap}`}
                          className="h-16 w-16 shrink-0 rounded object-cover ring-1 ring-bone/15"
                        />
                      </a>
                    ) : null}
                    <div>
                      <div className="font-display text-lg uppercase tracking-wide text-bone">
                        {p.nama_lengkap}
                      </div>
                      <div className="mt-1 text-sm text-bone/50">
                        {p.no_hp}
                        {p.nama_sekolah ? ` · ${p.nama_sekolah}` : ""}
                      </div>
                      <div className="mt-1 text-xs text-bone/40">
                        Dikirim {formatDate(p.created_at)}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";

import AccountMenu from "@/components/account/AccountMenu";
import LogoutButton from "@/components/auth/LogoutButton";

/**
 * Header seragam untuk halaman area akun/pengelolaan: logo (menuju beranda
 * area sesuai role), menu navigasi (AccountMenu, tersaring per-role), dan
 * tombol keluar. Dipakai oleh halaman Ubah Password, Daftar User, Siswa,
 * dan Pendaftaran agar navigasi konsisten di semua halaman.
 */
export default function AccountHeader({
  role,
  userName,
}: {
  role: "admin" | "pelatih" | "member";
  userName?: string;
}) {
  return (
    <header className="border-b border-bone/10 bg-coal/40">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4 lg:px-8">
        <Link
          href={role === "member" ? "/akun" : "/dashboard"}
          className="flex min-w-0 items-center gap-3"
        >
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
            {userName ? (
              <span className="truncate font-body text-[11px] font-semibold text-pitch md:text-xs">
                {userName}
              </span>
            ) : null}
          </span>
        </Link>
        <AccountMenu role={role} />
        {/* Di HP tombol keluar ada di dalam drawer AccountMenu; tampilkan yang
            standalone hanya di desktop. */}
        <div className="hidden md:block">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

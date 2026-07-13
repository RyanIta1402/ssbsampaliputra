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
          className="flex items-center gap-3"
        >
          <Image
            src="/logo.png"
            alt="Logo SSB Sampali Putra"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg uppercase tracking-wide text-bone">
              SSB Sampali Putra System
            </span>
            {userName ? (
              <span className="font-body text-xs font-semibold text-pitch">
                {userName}
              </span>
            ) : null}
          </span>
        </Link>
        <AccountMenu role={role} />
        <LogoutButton />
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Menu navigasi dropdown untuk area akun/pengelolaan.
 * Grup: "Master" (Role, Turnamen, Ubah Password, Daftar User), "Siswa"
 * (Siswa, List Turnamen, SPP, Pendaftaran), "Transaksi" (Penerimaan,
 * Pengeluaran), dan "Laporan"
 * (Laporan Transaksi, Laporan SPP, Laporan SPP Perbulan). Klik untuk
 * membuka; menutup saat klik
 * di luar, menekan Escape, atau memilih salah satu item.
 *
 * Visibilitas tiap item ditentukan `access`:
 * - "all"     : semua peran (Ubah Password, Pendaftaran).
 * - "manager" : admin & pelatih (Siswa, SPP, Transaksi, Laporan).
 * - "admin"   : admin saja (Role, Daftar User — kontrol akses).
 * Jadi pelatih melihat semua menu KECUALI Role & Daftar User; member hanya
 * Ubah Password & Pendaftaran. Catatan: menyembunyikan item di sini bersifat
 * kosmetik — tiap halaman tetap dijaga di server.
 */

type Role = "admin" | "pelatih" | "member";
type Access = "all" | "manager" | "admin";
type MenuItem = { label: string; href: string; access: Access };
type MenuGroup = { label: string; items: MenuItem[] };

const MENUS: MenuGroup[] = [
  {
    label: "Master",
    items: [
      { label: "Role", href: "/role", access: "admin" },
      { label: "Turnamen", href: "/turnamen", access: "manager" },
      { label: "Ubah Password", href: "/ubah-password", access: "all" },
      { label: "Daftar User", href: "/user", access: "admin" },
    ],
  },
  {
    label: "Siswa",
    items: [
      { label: "Siswa", href: "/siswa", access: "manager" },
      { label: "List Turnamen", href: "/list-turnamen", access: "manager" },
      { label: "SPP", href: "/spp", access: "manager" },
      { label: "Pendaftaran", href: "/pendaftaran", access: "all" },
    ],
  },
  {
    label: "Transaksi",
    items: [
      { label: "Penerimaan", href: "/penerimaan", access: "manager" },
      { label: "Pengeluaran", href: "/pengeluaran", access: "manager" },
    ],
  },
  {
    label: "Laporan",
    items: [
      { label: "Laporan Transaksi", href: "/laporan/transaksi", access: "manager" },
      { label: "Laporan SPP", href: "/laporan/spp", access: "manager" },
      { label: "Laporan SPP Perbulan", href: "/laporan/spp-perbulan", access: "manager" },
    ],
  },
];

/** Apakah `role` boleh melihat item dengan tingkat `access` tertentu. */
function canSee(access: Access, role: Role): boolean {
  if (access === "all") return true;
  if (access === "admin") return role === "admin";
  return role === "admin" || role === "pelatih"; // "manager"
}

export default function AccountMenu({ role }: { role: Role }) {
  const [open, setOpen] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Saring item sesuai role; grup yang jadi kosong tidak ditampilkan.
  const menus = MENUS.map((g) => ({
    ...g,
    items: g.items.filter((it) => canSee(it.access, role)),
  })).filter((g) => g.items.length > 0);

  useEffect(() => {
    if (open === null) return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <nav ref={navRef} className="flex items-center gap-1">
      {menus.map((menu, i) => {
        const isOpen = open === i;
        return (
          <div key={menu.label} className="relative">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-haspopup="true"
              className={`flex items-center gap-1.5 px-4 py-2 font-body text-xs font-bold uppercase tracking-widest transition-colors ${
                isOpen ? "text-pitch" : "text-bone/70 hover:text-pitch"
              }`}
            >
              {menu.label}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-3 w-3 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-[180px] border border-bone/10 bg-coal py-1 shadow-xl shadow-black/40">
                {menu.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(null)}
                    className="block px-4 py-2.5 font-body text-xs font-semibold uppercase tracking-wider text-bone/70 transition-colors hover:bg-ink hover:text-pitch"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

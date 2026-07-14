"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import LogoutButton from "@/components/auth/LogoutButton";

/**
 * Menu navigasi area akun/pengelolaan — responsif.
 *
 * Desktop (md ke atas): bilah horizontal dengan dropdown per-grup. Klik untuk
 * membuka; menutup saat klik di luar, menekan Escape, atau memilih item.
 *
 * HP (di bawah md): tombol hamburger yang membuka drawer geser dari kanan
 * (backdrop blur, ikon per-grup, sorotan halaman aktif, dan tombol Keluar di
 * bagian bawah). Ini menggantikan bilah horizontal yang dulu meluber &
 * terpotong di layar sempit.
 *
 * Grup: "Master" (Role, Turnamen, Ubah Password, Daftar User), "Siswa"
 * (Siswa, List Turnamen, SPP, Pendaftaran), "Transaksi" (Penerimaan,
 * Pengeluaran), dan "Laporan" (Laporan Transaksi, Laporan SPP, Laporan SPP
 * Perbulan).
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
type IconKey = "master" | "siswa" | "transaksi" | "laporan";
type MenuItem = { label: string; href: string; access: Access };
type MenuGroup = { label: string; icon: IconKey; items: MenuItem[] };

const MENUS: MenuGroup[] = [
  {
    label: "Master",
    icon: "master",
    items: [
      { label: "Role", href: "/role", access: "admin" },
      { label: "Turnamen", href: "/turnamen", access: "manager" },
      { label: "Ubah Password", href: "/ubah-password", access: "all" },
      { label: "Daftar User", href: "/user", access: "admin" },
    ],
  },
  {
    label: "Siswa",
    icon: "siswa",
    items: [
      { label: "Siswa", href: "/siswa", access: "manager" },
      { label: "List Turnamen", href: "/list-turnamen", access: "manager" },
      { label: "SPP", href: "/spp", access: "manager" },
      { label: "Pendaftaran", href: "/pendaftaran", access: "all" },
    ],
  },
  {
    label: "Transaksi",
    icon: "transaksi",
    items: [
      { label: "Penerimaan", href: "/penerimaan", access: "manager" },
      { label: "Pengeluaran", href: "/pengeluaran", access: "manager" },
    ],
  },
  {
    label: "Laporan",
    icon: "laporan",
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

/** Ikon garis per-grup untuk drawer HP. */
function GroupIcon({ name, className }: { name: IconKey; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "master":
      return (
        <svg {...common}>
          <rect width="7" height="7" x="3" y="3" rx="1.5" />
          <rect width="7" height="7" x="14" y="3" rx="1.5" />
          <rect width="7" height="7" x="14" y="14" rx="1.5" />
          <rect width="7" height="7" x="3" y="14" rx="1.5" />
        </svg>
      );
    case "siswa":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "transaksi":
      return (
        <svg {...common}>
          <path d="m8 3-4 4 4 4" />
          <path d="M4 7h16" />
          <path d="m16 21 4-4-4-4" />
          <path d="M20 17H4" />
        </svg>
      );
    case "laporan":
      return (
        <svg {...common}>
          <path d="M3 3v16a2 2 0 0 0 2 2h16" />
          <path d="M18 17V9" />
          <path d="M13 17V5" />
          <path d="M8 17v-3" />
        </svg>
      );
  }
}

export default function AccountMenu({ role }: { role: Role }) {
  const [open, setOpen] = useState<number | null>(null); // dropdown desktop
  const [mobileOpen, setMobileOpen] = useState(false); // drawer HP
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  // Saring item sesuai role; grup yang jadi kosong tidak ditampilkan.
  const menus = MENUS.map((g) => ({
    ...g,
    items: g.items.filter((it) => canSee(it.access, role)),
  })).filter((g) => g.items.length > 0);

  // Tutup dropdown desktop saat klik di luar / tekan Escape.
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

  // Kunci scroll body & tutup dengan Escape saat drawer HP terbuka.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ===== Desktop: bilah horizontal + dropdown ===== */}
      <nav ref={navRef} className="hidden items-center gap-1 md:flex">
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

      {/* ===== HP: tombol hamburger ===== */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu navigasi"
          aria-expanded={mobileOpen}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-bone/15 bg-bone/5 text-bone transition-all hover:border-pitch/50 hover:text-pitch active:scale-95"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* ===== HP: drawer geser + backdrop ===== */}
      <div
        className={`fixed inset-0 z-[60] overflow-hidden md:hidden ${
          mobileOpen ? "" : "pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop */}
        <button
          type="button"
          tabIndex={mobileOpen ? 0 : -1}
          aria-label="Tutup menu"
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 h-full w-full cursor-default bg-ink/70 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Panel */}
        <aside
          className={`absolute right-0 top-0 flex h-full w-[82%] max-w-[340px] flex-col border-l border-bone/10 bg-coal shadow-2xl shadow-black/60 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header drawer */}
          <div className="flex items-center justify-between border-b border-bone/10 px-5 py-4">
            <span className="tag-label">Navigasi</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-bone/15 text-bone/70 transition-colors hover:border-pitch/50 hover:text-pitch"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Daftar menu */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {menus.map((menu) => (
              <div key={menu.label} className="mb-5 last:mb-0">
                <div className="mb-1.5 flex items-center gap-2 px-3 text-bone/40">
                  <GroupIcon name={menu.icon} className="h-4 w-4" />
                  <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em]">
                    {menu.label}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {menu.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`group flex items-center justify-between gap-3 rounded-xl px-3 py-3 font-body text-sm font-semibold transition-colors ${
                          active
                            ? "bg-pitch/10 text-pitch"
                            : "text-bone/70 hover:bg-bone/5 hover:text-bone"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className={`h-1.5 w-1.5 rounded-full transition-colors ${
                              active
                                ? "bg-pitch"
                                : "bg-bone/25 group-hover:bg-bone/50"
                            }`}
                          />
                          {item.label}
                        </span>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`h-4 w-4 transition-all ${
                            active
                              ? "text-pitch"
                              : "text-bone/30 group-hover:translate-x-0.5 group-hover:text-bone/60"
                          }`}
                          aria-hidden="true"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer: keluar */}
          <div className="border-t border-bone/10 p-3">
            <LogoutButton className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 px-4 py-3 font-body text-sm font-bold uppercase tracking-wider text-red-400 transition-colors hover:border-red-500/60 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40" />
          </div>
        </aside>
      </div>
    </>
  );
}

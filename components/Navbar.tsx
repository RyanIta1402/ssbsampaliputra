"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const links = [
  { label: "Event", href: "#event" },
  { label: "Tentang", href: "#tentang" },
  { label: "Program", href: "#program" },
  { label: "Pelatih", href: "#pelatih" },
  { label: "Pengurus", href: "#pengurus" },
  { label: "Galeri", href: "#galeri" },
  { label: "FAQ", href: "#faq" },
  { label: "Kontak", href: "#kontak" },
];

export default function Navbar({ namaKlub }: { namaKlub: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-bone/10 bg-ink/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <a href="#" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Logo SSB Sampali Putra"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
            priority
          />
          <span className="font-display text-lg uppercase leading-none tracking-wide text-bone">
            {namaKlub}
          </span>
        </a>

        <ul className="hidden items-center gap-4 md:flex lg:gap-6">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="font-body text-xs font-semibold uppercase tracking-wider text-bone/70 transition-colors hover:text-pitch lg:text-sm lg:tracking-widest"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li className="ml-2">
            <a href="#kontak" className="btn-primary !px-4 !py-2 lg:!px-5 lg:!py-2.5">
              Daftar
            </a>
          </li>
        </ul>

        <button
          aria-label="Buka menu"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col gap-1.5 md:hidden"
        >
          <span
            className={`h-0.5 w-7 bg-bone transition-transform ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`h-0.5 w-7 bg-bone transition-opacity ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-0.5 w-7 bg-bone transition-transform ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* Menu mobile */}
      {open && (
        <div className="border-t border-bone/10 bg-ink/95 backdrop-blur-md md:hidden">
          <ul className="flex flex-col px-5 py-4">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-bone/5 py-3 font-body text-sm font-semibold uppercase tracking-widest text-bone/80"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-4">
              <a
                href="#kontak"
                onClick={() => setOpen(false)}
                className="btn-primary w-full"
              >
                Daftar Sekarang
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

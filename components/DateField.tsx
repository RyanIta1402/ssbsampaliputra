"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { idDateToIso, maskDmy } from "@/lib/date";

/** Ikon kalender kecil (mewarisi warna lewat currentColor). */
function CalendarIcon() {
  return (
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
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M8 2v4M16 2v4M3 10h18" />
    </svg>
  );
}

// Nama bulan & label hari (Minggu di kolom pertama, sesuai kalender lokal).
const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const DOW = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const pad = (n: number) => String(n).padStart(2, "0");
/** Format bagian tanggal menjadi string `dd-mm-yyyy`. */
const toDmy = (y: number, m: number, d: number) => `${pad(d)}-${pad(m)}-${y}`;

type Cell = { y: number; m: number; d: number; cur: boolean };

/** Membangun 42 sel (6 minggu) untuk kalender bulan `m`/`y` (1-indexed). */
function buildCells(y: number, m: number): Cell[] {
  const firstDow = new Date(y, m - 1, 1).getDay(); // 0 = Minggu
  const daysInMonth = new Date(y, m, 0).getDate();
  const prevDays = new Date(y, m - 1, 0).getDate();
  const cells: Cell[] = [];

  // Hari bulan sebelumnya (mengisi kolom sebelum tanggal 1).
  for (let i = firstDow - 1; i >= 0; i--) {
    const pm = m === 1 ? 12 : m - 1;
    const py = m === 1 ? y - 1 : y;
    cells.push({ y: py, m: pm, d: prevDays - i, cur: false });
  }
  // Hari bulan ini.
  for (let d = 1; d <= daysInMonth; d++) cells.push({ y, m, d, cur: true });
  // Hari bulan berikutnya (melengkapi ke 42 sel).
  let nd = 1;
  while (cells.length < 42) {
    const nm = m === 12 ? 1 : m + 1;
    const ny = m === 12 ? y + 1 : y;
    cells.push({ y: ny, m: nm, d: nd++, cur: false });
  }
  return cells;
}

/**
 * Field tanggal: input teks format Indonesia `dd-mm-yyyy` plus kalender kustom.
 *
 * Mengetik tetap memakai masking `dd-mm-yyyy` sehingga validasi form pemanggil
 * (lewat `idDateToIso`) tidak berubah. Tombol kalender membuka kalender kustom
 * (bukan date picker native) agar tampilannya bisa distyle — khususnya hari
 * MINGGU diberi warna merah, baik di header maupun tiap tanggalnya. Karena
 * `value`/`onChange` selalu berupa string `dd-mm-yyyy`, komponen ini bisa
 * langsung menggantikan input teks tanggal yang sudah ada tanpa mengubah
 * state atau logika simpan form.
 */
export default function DateField({
  value,
  onChange,
  className,
  wrapperClassName = "relative",
  placeholder = "dd-mm-yyyy",
  id,
  name,
  required = false,
  ariaLabel,
}: {
  /** Nilai tanggal dalam format `dd-mm-yyyy` (kosong = belum diisi). */
  value: string;
  /** Dipanggil dengan nilai `dd-mm-yyyy` baru (sudah termask). */
  onChange: (value: string) => void;
  /** Kelas untuk input teks (mis. `fieldClass`). */
  className: string;
  /** Kelas pembungkus; default `relative` agar tombol kalender ter-posisi. */
  wrapperClassName?: string;
  placeholder?: string;
  id?: string;
  name?: string;
  required?: boolean;
  ariaLabel?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // Nilai terpilih (bila valid) dalam bagian y/m/d.
  const selected = useMemo(() => {
    const iso = idDateToIso(value);
    if (!iso) return null;
    return { y: +iso.slice(0, 4), m: +iso.slice(5, 7), d: +iso.slice(8, 10) };
  }, [value]);

  const isSunday = selected
    ? new Date(selected.y, selected.m - 1, selected.d).getDay() === 0
    : false;

  // Bulan yang sedang ditampilkan di kalender.
  const today = new Date();
  const [view, setView] = useState(() =>
    selected
      ? { y: selected.y, m: selected.m }
      : { y: today.getFullYear(), m: today.getMonth() + 1 }
  );

  const openCalendar = () => {
    // Selaraskan bulan yang tampil dengan nilai teks saat ini.
    setView(
      selected
        ? { y: selected.y, m: selected.m }
        : { y: today.getFullYear(), m: today.getMonth() + 1 }
    );
    setOpen(true);
  };

  // Tutup saat klik di luar atau menekan Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const shiftMonth = (delta: number) =>
    setView((v) => {
      const idx = v.m - 1 + delta;
      return { y: v.y + Math.floor(idx / 12), m: ((idx % 12) + 12) % 12 + 1 };
    });

  const pick = (c: Cell) => {
    onChange(toDmy(c.y, c.m, c.d));
    setOpen(false);
  };

  const cells = useMemo(() => buildCells(view.y, view.m), [view]);

  return (
    <div ref={wrapRef} className={wrapperClassName}>
      <input
        id={id}
        name={name}
        required={required}
        aria-label={ariaLabel}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(maskDmy(e.target.value))}
        placeholder={placeholder}
        className={`${className}${isSunday ? " !text-red-500" : ""}`}
        // Sisakan ruang untuk tombol kalender; inline style dipakai agar tak
        // bentrok dengan padding (px-*) dari kelas pemanggil.
        style={{ paddingRight: "2.5rem" }}
      />
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openCalendar())}
        aria-label="Pilih dari kalender"
        aria-expanded={open}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-bone/40 transition-colors hover:text-pitch"
      >
        <CalendarIcon />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 border border-bone/10 bg-coal p-3 shadow-xl shadow-black/40">
          {/* Header: navigasi bulan */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Bulan sebelumnya"
              className="flex h-7 w-7 items-center justify-center text-bone/60 transition-colors hover:text-pitch"
            >
              ‹
            </button>
            <span className="font-body text-sm font-bold text-bone">
              {MONTHS[view.m - 1]} {view.y}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Bulan berikutnya"
              className="flex h-7 w-7 items-center justify-center text-bone/60 transition-colors hover:text-pitch"
            >
              ›
            </button>
          </div>

          {/* Label hari — Minggu (kolom pertama) merah */}
          <div className="grid grid-cols-7 gap-0.5">
            {DOW.map((d, i) => (
              <div
                key={d}
                className={`py-1 text-center text-[11px] font-bold uppercase tracking-wide ${
                  i === 0 ? "text-red-500" : "text-bone/40"
                }`}
              >
                {d}
              </div>
            ))}

            {/* Tanggal */}
            {cells.map((c) => {
              const dow = new Date(c.y, c.m - 1, c.d).getDay();
              const sunday = dow === 0;
              const isSel =
                selected != null &&
                selected.y === c.y &&
                selected.m === c.m &&
                selected.d === c.d;
              const isToday =
                c.y === today.getFullYear() &&
                c.m === today.getMonth() + 1 &&
                c.d === today.getDate();

              // Warna teks: prioritas terpilih → merah (Minggu) → normal, dan
              // diredupkan bila tanggal milik bulan lain.
              let text: string;
              if (isSel) text = "text-ink";
              else if (sunday) text = c.cur ? "text-red-500" : "text-red-500/40";
              else text = c.cur ? "text-bone/80" : "text-bone/25";

              return (
                <button
                  key={`${c.y}-${c.m}-${c.d}`}
                  type="button"
                  onClick={() => pick(c)}
                  className={`flex h-8 w-full items-center justify-center text-sm transition-colors ${text} ${
                    isSel
                      ? "bg-pitch font-bold"
                      : `hover:bg-bone/10 ${
                          isToday ? "border border-pitch/50" : ""
                        }`
                  }`}
                >
                  {c.d}
                </button>
              );
            })}
          </div>

          {/* Aksi: Bersihkan & Hari ini */}
          <div className="mt-2 flex items-center justify-between border-t border-bone/10 pt-2">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="text-xs font-bold uppercase tracking-wider text-bone/50 transition-colors hover:text-bone"
            >
              Bersihkan
            </button>
            <button
              type="button"
              onClick={() =>
                pick({
                  y: today.getFullYear(),
                  m: today.getMonth() + 1,
                  d: today.getDate(),
                  cur: true,
                })
              }
              className="text-xs font-bold uppercase tracking-wider text-pitch transition-colors hover:text-pitch/80"
            >
              Hari Ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

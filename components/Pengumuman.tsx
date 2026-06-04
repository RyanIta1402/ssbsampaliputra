"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SanityImage from "./SanityImage";
import Reveal from "./Reveal";

type Hadiah = { juara?: string; hadiah?: string };
type PengumumanData = {
  _id?: string;
  judul?: string;
  kategori?: string;
  deskripsiSingkat?: string;
  poster?: import("sanity").Image;
  tanggal?: string;
  hari?: string;
  lokasi?: string;
  format?: string;
  persyaratan?: string[];
  biayaPendaftaran?: string;
  hadiah?: Hadiah[];
  kontak?: string;
  teksTombolUtama?: string;
  linkTombol?: string;
};

// Fallback jika Sanity belum punya data
const fallbackList: PengumumanData[] = [
  {
    _id: "fallback-1",
    judul: "Trophy Wali Kota Medan 20th Anniversary",
    kategori: "Sepakbola Anak Usia Dini U11 - Kelahiran 2015/2016",
    deskripsiSingkat:
      "Buruan daftar! Memperebutkan Trophy Wali Kota Medan dalam rangka 20th Anniversary.",
    tanggal: "27 - 28 Juni 2026",
    hari: "Sabtu - Minggu",
    lokasi: "SSB Patriot Medan, Jln. Air Bersih Medan Kota",
    format: 'Format 8 vs 8 • 12 Pemain • Durasi 2 x 10"',
    persyaratan: ["Raport", "Kartu Keluarga", "Akte Kelahiran"],
    biayaPendaftaran: "350K",
    hadiah: [
      { juara: "Juara 1", hadiah: "Trophy + Medali + Rp 2.000.000" },
      { juara: "Juara 2", hadiah: "Trophy + Medali + Rp 1.500.000" },
      { juara: "Juara 3", hadiah: "Trophy + Medali + Rp 800.000" },
      { juara: "Juara 4", hadiah: "Trophy + Medali + Rp 500.000" },
    ],
    kontak: "081375284462",
    teksTombolUtama: "Daftar via WhatsApp",
  },
];

function waLink(phone?: string, pesan?: string) {
  if (!phone) return "#";
  const clean = phone.replace(/[^0-9]/g, "");
  const num = clean.startsWith("0") ? "62" + clean.slice(1) : clean;
  const text = encodeURIComponent(pesan || "Halo, saya ingin mendaftar event.");
  return `https://wa.me/${num}?text=${text}`;
}

export default function Pengumuman({ data }: { data?: PengumumanData[] }) {
  const list = data && data.length > 0 ? data : fallbackList;
  const [active, setActive] = useState<PengumumanData | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const frameRef = useRef<number>();
  const isPausedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const didDragRef = useRef(false);

  // Auto-scroll/loop hanya bila poster benar-benar melebihi lebar layar.
  // Jika muat (mis. hanya 1-2 event), tampilkan apa adanya tanpa duplikat.
  const [canLoop, setCanLoop] = useState(false);
  const loopList = useMemo(
    () => (canLoop ? [...list, ...list, ...list] : list),
    [list, canLoop],
  );

  // Ukur apakah konten meluap; jalankan ulang saat jumlah event / ukuran berubah
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => {
      const singleWidth = el.scrollWidth / (canLoop ? 3 : 1);
      setCanLoop(singleWidth > el.clientWidth + 8);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [list.length, canLoop]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !canLoop) return;

    const third = () => el.scrollWidth / 3;
    posRef.current = third();
    el.scrollLeft = posRef.current;

    const tick = () => {
      if (!isPausedRef.current && !isDraggingRef.current) {
        posRef.current += 0.5;
        const t = third();
        if (posRef.current >= t * 2) posRef.current -= t;
        el.scrollLeft = posRef.current;
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [canLoop, loopList]);

  const onScroll = () => {
    if (isDraggingRef.current || !canLoop) return;
    const el = scrollRef.current;
    if (!el) return;
    posRef.current = el.scrollLeft;
    const t = el.scrollWidth / 3;
    if (el.scrollLeft >= t * 2) {
      posRef.current -= t;
      el.scrollLeft = posRef.current;
    }
    if (el.scrollLeft < 0) {
      posRef.current += t;
      el.scrollLeft = posRef.current;
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    didDragRef.current = false;
    dragStartXRef.current = e.clientX;
    scrollStartRef.current = scrollRef.current?.scrollLeft ?? 0;
    posRef.current = scrollStartRef.current;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    const delta = dragStartXRef.current - e.clientX;
    if (Math.abs(delta) > 4) didDragRef.current = true;
    const next = scrollStartRef.current + delta;
    scrollRef.current.scrollLeft = next;
    posRef.current = next;
  };
  const onMouseUp = () => {
    isDraggingRef.current = false;
  };
  const onTouchStart = (e: React.TouchEvent) => {
    didDragRef.current = false;
    dragStartXRef.current = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const delta = dragStartXRef.current - e.touches[0].clientX;
    if (Math.abs(delta) > 4) didDragRef.current = true;
  };

  const close = useCallback(() => setActive(null), []);

  // Esc untuk tutup modal + lock body scroll
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [active, close]);

  return (
    <section id="event" className="relative overflow-hidden bg-ink py-20 lg:py-28">
      {/* Latar aurora */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full bg-pitch/20 blur-[120px] animate-glow" />
        <div className="absolute -right-20 bottom-0 h-[24rem] w-[24rem] rounded-full bg-gold/20 blur-[120px] animate-glow [animation-delay:1.2s]" />
        <div className="absolute inset-0 bg-grid-faint [background-size:48px_48px] opacity-30" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        {/* Header */}
        <Reveal className="mb-12 lg:mb-16">
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-pitch/40 bg-pitch/10 px-4 py-1.5 font-body text-xs font-bold uppercase tracking-[0.25em] text-pitch backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pitch opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-pitch" />
                </span>
                Pendaftaran Dibuka
              </span>
              <h2 className="mt-5 font-display text-4xl uppercase leading-[1.05] text-bone sm:text-5xl lg:text-6xl">
                Event{" "}
                <span className="bg-gradient-to-r from-pitch via-pitch to-gold bg-clip-text text-transparent">
                  Terbaru
                </span>
              </h2>
              <p className="mt-4 max-w-xl font-body text-base leading-relaxed text-bone/60">
                Klik poster untuk melihat detail event dan informasi pendaftaran.
              </p>
            </div>
            <div className="font-body text-bone/40">
              <div className="font-display text-5xl leading-none text-pitch">
                {list.length.toString().padStart(2, "0")}
              </div>
              <div className="mt-1 text-xs uppercase tracking-widest">Event Aktif</div>
            </div>
          </div>
        </Reveal>

      </div>

      {/* Strip Poster Horizontal */}
      <div className="relative mt-2">
        {/* Fade tepi */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent sm:w-24" />

        <div
          ref={scrollRef}
          onMouseEnter={() => {
            isPausedRef.current = true;
          }}
          onMouseLeave={() => {
            isPausedRef.current = false;
            isDraggingRef.current = false;
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onScroll={onScroll}
          className={`flex gap-5 overflow-x-auto px-5 py-4 select-none lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            canLoop ? "cursor-grab active:cursor-grabbing" : "justify-center"
          }`}
          style={{ scrollBehavior: "auto" }}
        >
          {loopList.map((ev, i) => {
            const handleOpen = () => {
              if (!didDragRef.current) setActive(ev);
            };
            return (
              <button
                key={`${ev._id || "ev"}-${i}`}
                onMouseUp={handleOpen}
                onTouchEnd={handleOpen}
                className="group relative h-[26rem] w-72 shrink-0 overflow-hidden rounded-3xl border border-bone/10 bg-coal text-left ring-1 ring-bone/10 transition-all duration-300 hover:ring-pitch/60 hover:scale-[1.02] sm:w-80"
              >
                {/* Animated conic glow border */}
                <div className="pointer-events-none absolute -inset-px overflow-hidden rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute -inset-1/2 animate-conic bg-[conic-gradient(from_0deg,transparent_0deg,#16f04a_60deg,transparent_140deg,#f5c542_220deg,transparent_300deg)] opacity-40" />
                </div>

                <div className="relative h-full overflow-hidden rounded-[1.3rem]">
                  <SanityImage
                    image={ev.poster}
                    alt={ev.judul || "Poster event"}
                    width={600}
                    height={800}
                    className="h-full w-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-105"
                    fallbackLabel="Poster Event"
                  />

                  {/* Badge biaya */}
                  {ev.biayaPendaftaran && (
                    <div className="absolute left-4 top-4 animate-float">
                      <div className="flex items-center gap-1.5 rounded-full bg-gold/95 px-3 py-1.5 font-display text-xs font-black uppercase tracking-widest text-ink shadow-[0_8px_30px_-5px_rgba(245,197,66,0.6)]">
                        Rp {ev.biayaPendaftaran} / Tim
                      </div>
                    </div>
                  )}

                  {/* Hint klik */}
                  <div className="absolute right-4 top-4 flex h-9 w-9 -translate-y-1 items-center justify-center rounded-full bg-ink/70 text-bone opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3M11 8v6M8 11h6" />
                    </svg>
                  </div>

                  {/* Bottom overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/80 to-transparent p-5 pt-16">
                    <div className="font-display text-xs uppercase tracking-[0.25em] text-pitch">
                      {ev.kategori}
                    </div>
                    <div className="mt-1 font-display text-xl uppercase leading-tight text-bone sm:text-2xl">
                      {ev.judul}
                    </div>
                    {ev.tanggal && (
                      <div className="mt-2 flex items-center gap-1.5 font-body text-xs text-bone/50">
                        <IconCalendar />
                        {ev.hari} · {ev.tanggal}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Hint scroll */}
        {canLoop && (
          <div className="mt-4 flex items-center justify-center gap-3 text-bone/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="font-body text-[11px] uppercase tracking-widest">Geser untuk menjelajah event</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
        )}
      </div>

      {/* Modal Detail */}
      {active && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-md sm:p-6"
          onClick={close}
        >
          <div
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-bone/10 bg-coal shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol tutup */}
            <button
              onClick={close}
              aria-label="Tutup"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-bone/20 bg-ink/60 text-bone backdrop-blur transition-all hover:border-pitch hover:bg-pitch hover:text-ink"
            >
              <IconClose />
            </button>

            <div className="grid gap-0 lg:grid-cols-[2fr_3fr]">
              {/* Poster */}
              <div className="relative overflow-hidden rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none">
                <SanityImage
                  image={active.poster}
                  alt={active.judul || "Poster"}
                  width={600}
                  height={800}
                  className="aspect-[3/4] w-full object-cover"
                  fallbackLabel="Poster Event"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/60 to-transparent p-6 pt-20">
                  <div className="font-display text-xs uppercase tracking-[0.25em] text-pitch">{active.kategori}</div>
                  <div className="mt-1 font-display text-2xl uppercase leading-tight text-bone">{active.judul}</div>
                </div>
              </div>

              {/* Detail */}
              <div className="space-y-5 p-6 lg:p-8">
                {active.deskripsiSingkat && (
                  <p className="font-body text-sm leading-relaxed text-bone/70">{active.deskripsiSingkat}</p>
                )}

                {/* Info cards */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {active.tanggal && (
                    <div className="flex items-start gap-3 rounded-xl border border-bone/10 bg-ink/50 p-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-pitch/15 text-pitch"><IconCalendar /></span>
                      <div>
                        <div className="font-display text-[10px] uppercase tracking-[0.25em] text-bone/40">{active.hari || "Tanggal"}</div>
                        <div className="mt-0.5 font-body text-sm font-semibold text-bone">{active.tanggal}</div>
                      </div>
                    </div>
                  )}
                  {active.lokasi && (
                    <div className="flex items-start gap-3 rounded-xl border border-bone/10 bg-ink/50 p-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold"><IconPin /></span>
                      <div>
                        <div className="font-display text-[10px] uppercase tracking-[0.25em] text-bone/40">Lokasi</div>
                        <div className="mt-0.5 font-body text-sm font-semibold text-bone">{active.lokasi}</div>
                      </div>
                    </div>
                  )}
                  {active.format && (
                    <div className="flex items-start gap-3 rounded-xl border border-bone/10 bg-ink/50 p-4 sm:col-span-2">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-bone/10 text-bone"><IconWhistle /></span>
                      <div>
                        <div className="font-display text-[10px] uppercase tracking-[0.25em] text-bone/40">Format</div>
                        <div className="mt-0.5 font-body text-sm font-semibold text-bone">{active.format}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hadiah */}
                {active.hadiah && active.hadiah.length > 0 && (
                  <div className="rounded-xl border border-bone/10 bg-ink/50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold/15 text-gold"><IconTrophy /></span>
                      <div className="font-display text-xs uppercase tracking-[0.25em] text-bone/60">Total Reward</div>
                    </div>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {active.hadiah.map((h, i) => (
                        <li key={i} className="flex items-center gap-3 rounded-lg border border-bone/5 bg-coal/60 p-2.5">
                          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg font-display text-xs font-black ${i === 0 ? "bg-gold text-ink" : i === 1 ? "bg-bone/80 text-ink" : i === 2 ? "bg-[#cd7f32]/80 text-ink" : "bg-bone/10 text-bone"}`}>{i + 1}</span>
                          <div>
                            <div className="font-body text-[10px] uppercase tracking-widest text-bone/40">{h.juara}</div>
                            <div className="font-body text-xs font-semibold text-bone">{h.hadiah}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Persyaratan */}
                {active.persyaratan && active.persyaratan.length > 0 && (
                  <div className="rounded-xl border border-bone/10 bg-ink/50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-pitch/15 text-pitch"><IconCheck /></span>
                      <div className="font-display text-xs uppercase tracking-[0.25em] text-bone/60">Persyaratan</div>
                    </div>
                    <ul className="space-y-1.5">
                      {active.persyaratan.map((p, i) => (
                        <li key={i} className="flex items-center gap-2 font-body text-sm text-bone">
                          <span className="h-1.5 w-1.5 rotate-45 bg-pitch shrink-0" />{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA */}
                <div className="flex items-center gap-3 rounded-xl border border-pitch/40 bg-gradient-to-br from-pitch/10 to-transparent p-4">
                  <div className="flex-1">
                    <div className="font-display text-xs uppercase tracking-[0.25em] text-pitch">Biaya Pendaftaran</div>
                    <div className="mt-0.5 font-display text-3xl text-bone">
                      {active.biayaPendaftaran}
                      <span className="ml-1.5 text-sm font-normal text-bone/50">/tim</span>
                    </div>
                    {active.kontak && (
                      <div className="mt-0.5 font-body text-xs text-bone/50">Hubungi: {active.kontak}</div>
                    )}
                  </div>
                  <a
                    href={active.linkTombol || waLink(active.kontak, `Halo, saya ingin mendaftarkan tim untuk ${active.judul}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-pitch px-5 py-3 font-body text-sm font-bold uppercase tracking-widest text-ink transition-all hover:bg-gold"
                  >
                    <IconWhatsApp />
                    {active.teksTombolUtama || "Daftar"}
                  </a>
                </div>

                <p className="text-center font-body text-[11px] uppercase tracking-widest text-bone/30">
                  Tekan Esc atau klik di luar untuk menutup
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------- Icons ---------- */

function IconCalendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function IconPin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconWhistle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="14" r="6" /><path d="M15 11l7-4-2 6" />
    </svg>
  );
}
function IconTrophy() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V4h12v5a6 6 0 0 1-12 0Z" /><path d="M4 6H2a2 2 0 0 0 2 4M20 6h2a2 2 0 0 1-2 4" /><path d="M10 21h4M12 17v4" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
function IconWhatsApp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5 3.5A11 11 0 0 0 3.6 17l-1.5 5.5 5.6-1.5A11 11 0 1 0 20.5 3.5Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-3.3.9.9-3.2-.2-.3A9 9 0 1 1 12 20.5Zm5-6.7c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1l-.8 1c-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.5-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5-.1-.1-.6-1.5-.9-2-.2-.5-.5-.5-.6-.5h-.6c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 1.8.7 2.5.8 3.4.7.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.1-.6-.3Z" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

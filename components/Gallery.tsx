"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Reveal from "./Reveal";

type GalleryItem = {
  _id?: string;
  judul?: string;
  kategori?: string;
  gambar?: import("sanity").Image;
};

type LocalMedia = {
  _id: string;
  judul: string;
  kategori: string;
  tipe: "gambar" | "video";
  src: string;
  poster?: string;
  fit?: "cover" | "contain";
  landscape?: boolean;
};

const localGallery: LocalMedia[] = [
  { _id: "foto-1",  judul: "Sesi Latihan Tim",        kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-1.jpg" },
  { _id: "video-1", judul: "Cuplikan Lapangan",        kategori: "pertandingan", tipe: "video",  src: "/gallery/video-1.mp4",  poster: "/gallery/foto-3.jpg" },
  { _id: "foto-3",  judul: "Kebersamaan Tim",          kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-3.jpg",  fit: "contain" },
  { _id: "foto-4",  judul: "Momen Persiapan",          kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-4.jpg" },
  { _id: "foto-2",  judul: "Aksi di Lapangan",         kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-2.jpg" },
  { _id: "video-2", judul: "Drill Teknik",             kategori: "pertandingan", tipe: "video",  src: "/gallery/video-2.mp4",  poster: "/gallery/foto-5.jpg" },
  { _id: "foto-5",  judul: "Semangat Pemain",          kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-5.jpg" },
  { _id: "foto-6",  judul: "Selebrasi",                kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-6.jpg" },
  { _id: "video-3", judul: "Aksi Latihan",             kategori: "pertandingan", tipe: "video",  src: "/gallery/video-3.mp4",  poster: "/gallery/foto-7.jpg" },
  { _id: "foto-7",  judul: "Latihan Bersama",          kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-7.jpg" },
  { _id: "foto-8",  judul: "Tim Solid",                kategori: "prestasi",     tipe: "gambar", src: "/gallery/foto-8.jpg" },
  { _id: "foto-9",  judul: "Momen Tim",                kategori: "prestasi",     tipe: "gambar", src: "/gallery/foto-9.jpg",  fit: "contain" },
  { _id: "foto-10", judul: "Briefing Tim",             kategori: "latihan",      tipe: "gambar", src: "/gallery/foto-10.jpg" },
  { _id: "foto-11", judul: "Momen Latihan",            kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-11.jpg" },
  { _id: "foto-12", judul: "Strategi Pelatih",         kategori: "latihan",      tipe: "gambar", src: "/gallery/foto-12.jpg" },
  { _id: "foto-13", judul: "Diskusi Tim",              kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-13.jpg" },
  { _id: "foto-14", judul: "Wasit & Pemain",           kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-14.jpg" },
  { _id: "foto-15", judul: "Persiapan Pertandingan",   kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-15.jpg" },
  { _id: "foto-16", judul: "Kebersamaan",              kategori: "latihan",      tipe: "gambar", src: "/gallery/foto-16.jpg", fit: "contain" },
  { _id: "foto-17", judul: "Sesi Lapangan",            kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-17.jpg", fit: "contain" },
  { _id: "foto-18", judul: "Latihan Pagi",             kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-18.jpg", fit: "contain" },
  { _id: "foto-19", judul: "Aksi Pemain",              kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-19.jpg" },
  { _id: "foto-20", judul: "Momen Bertanding",         kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-20.jpg" },
  { _id: "foto-21", judul: "Semangat Tim",             kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-21.jpg" },
  { _id: "foto-22", judul: "Drill Bersama",            kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-22.jpg" },
  { _id: "foto-23", judul: "Strategi Lapangan",        kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-23.jpg" },
  { _id: "foto-24", judul: "Kebersamaan Pemain",       kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-24.jpg" },
  { _id: "foto-25", judul: "Sesi Latihan",             kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-25.jpg" },
  { _id: "foto-26", judul: "Outing Tim",               kategori: "rekreasi",     tipe: "gambar", src: "/gallery/foto-26.jpg" },
  { _id: "foto-27", judul: "Keceriaan Bersama",        kategori: "rekreasi",     tipe: "gambar", src: "/gallery/foto-27.jpg" },
  { _id: "video-4", judul: "Momen Santai Tim",         kategori: "rekreasi",     tipe: "video",  src: "/gallery/video-4.mp4",  poster: "/gallery/foto-26.jpg" },
  { _id: "video-5", judul: "Aksi Pertandingan",        kategori: "pertandingan", tipe: "video",  src: "/gallery/video-5.mp4",  poster: "/gallery/foto-19.jpg" },
  { _id: "latihan-1", judul: "Sesi Latihan",           kategori: "latihan",      tipe: "video",  src: "/gallery/latihan-1.mp4", poster: "/gallery/foto-10.jpg", fit: "contain" },
  { _id: "latihan-2", judul: "Drill Latihan",          kategori: "latihan",      tipe: "video",  src: "/gallery/latihan-2.mp4", poster: "/gallery/foto-12.jpg", fit: "contain" },
  // Foto & Video Pertandingan 25-06-2026
  { _id: "foto-28",   judul: "Aksi Pertandingan",      kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-28.jpeg" },
  { _id: "foto-29",   judul: "Momen Bertanding",       kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-29.jpeg" },
  { _id: "foto-30",   judul: "Semangat di Lapangan",   kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-30.jpeg" },
  { _id: "foto-31",   judul: "Duel Pemain",            kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-31.jpeg" },
  { _id: "foto-32",   judul: "Pressing Ketat",         kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-32.jpeg" },
  { _id: "ptg-v1",    judul: "Video Pertandingan 1",   kategori: "pertandingan", tipe: "video",  src: "/gallery/ptg-v1.mp4",  poster: "/gallery/foto-28.jpeg", landscape: true },
  { _id: "foto-33",   judul: "Serangan Balik",         kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-33.jpeg" },
  { _id: "foto-34",   judul: "Peluang Emas",           kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-34.jpeg" },
  { _id: "foto-35",   judul: "Blok Pertahanan",        kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-35.jpeg" },
  { _id: "ptg-v2",    judul: "Video Pertandingan 2",   kategori: "pertandingan", tipe: "video",  src: "/gallery/ptg-v2.mp4",  poster: "/gallery/foto-33.jpeg", landscape: true },
  { _id: "foto-36",   judul: "Gol Spektakuler",        kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-36.jpeg" },
  { _id: "foto-37",   judul: "Selebrasi Kemenangan",   kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-37.jpeg" },
  { _id: "foto-38",   judul: "Kerjasama Tim",          kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-38.jpeg" },
  { _id: "ptg-v3",    judul: "Video Pertandingan 3",   kategori: "pertandingan", tipe: "video",  src: "/gallery/ptg-v3.mp4",  poster: "/gallery/foto-36.jpeg", landscape: true },
  { _id: "foto-39",   judul: "Strategi Matang",        kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-39.jpeg" },
  { _id: "foto-40",   judul: "Pemanasan Pra Tanding",  kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-40.jpeg" },
  { _id: "ptg-v4",    judul: "Video Pertandingan 4",   kategori: "pertandingan", tipe: "video",  src: "/gallery/ptg-v4.mp4",  poster: "/gallery/foto-40.jpeg" },
  { _id: "foto-41",   judul: "Kepala Bertemu Bola",    kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-41.jpeg" },
  { _id: "foto-42",   judul: "Momen Terakhir",         kategori: "pertandingan", tipe: "gambar", src: "/gallery/foto-42.jpeg" },
  { _id: "ptg-v5",    judul: "Video Pertandingan 5",   kategori: "pertandingan", tipe: "video",  src: "/gallery/ptg-v5.mp4",  poster: "/gallery/foto-41.jpeg" },
];

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-6 w-6">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ArrowIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      {dir === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

export default function Gallery({ items: _ }: { items?: GalleryItem[] }) {
  const [filter, setFilter] = useState<string>("semua");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const frameRef = useRef<number>();
  const isPausedRef = useRef(false);  // hover
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const didDragRef = useRef(false);   // untuk bedain klik vs drag

  const data = useMemo(() => {
    if (filter === "semua") return localGallery;
    return localGallery.filter((m) => m.kategori.toLowerCase() === filter);
  }, [filter]);

  const kategoriList = useMemo(() => {
    const set = new Set(localGallery.map((m) => m.kategori.toLowerCase()));
    return ["semua", ...Array.from(set)];
  }, []);

  // Loop data — duplikat untuk seamless infinite scroll
  const loopData = useMemo(() => [...data, ...data, ...data], [data]);

  // Auto-scroll via rAF
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Reset posisi ke tengah (satu salinan)
    const resetPos = () => {
      const third = el.scrollWidth / 3;
      posRef.current = third;
      el.scrollLeft = third;
    };
    resetPos();

    const tick = () => {
      if (!isPausedRef.current && !isDraggingRef.current) {
        posRef.current += 0.6;
        const third = el.scrollWidth / 3;
        // Setelah melewati satu salinan, loncat balik ke tengah (seamless)
        if (posRef.current >= third * 2) posRef.current -= third;
        el.scrollLeft = posRef.current;
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [data]);

  // Sync posRef saat scroll manual (touch/scrollbar)
  const onScroll = () => {
    if (isDraggingRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    posRef.current = el.scrollLeft;
    // Seamless wrap saat scroll manual
    const third = el.scrollWidth / 3;
    if (el.scrollLeft >= third * 2) { posRef.current -= third; el.scrollLeft = posRef.current; }
    if (el.scrollLeft < 0) { posRef.current += third; el.scrollLeft = posRef.current; }
  };

  // Mouse drag
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

  const onMouseUp = () => { isDraggingRef.current = false; };

  // Touch drag
  const onTouchStart = (e: React.TouchEvent) => {
    didDragRef.current = false;
    dragStartXRef.current = e.touches[0].clientX;
    scrollStartRef.current = scrollRef.current?.scrollLeft ?? 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const delta = dragStartXRef.current - e.touches[0].clientX;
    if (Math.abs(delta) > 4) didDragRef.current = true;
  };

  // Lightbox nav
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const next = useCallback(() => setLightboxIndex((i) => i === null ? null : (i + 1) % data.length), [data.length]);
  const prev = useCallback(() => setLightboxIndex((i) => i === null ? null : (i - 1 + data.length) % data.length), [data.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIndex, closeLightbox, next, prev]);

  // Reset lightbox index saat filter berubah
  useEffect(() => {
    setLightboxIndex(null);
  }, [filter]);

  const aktif = lightboxIndex !== null ? data[lightboxIndex] : null;

  return (
    <section id="galeri" className="relative bg-ink py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(57,255,20,0.06),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="tag-label mb-5">Galeri</p>
            <h2 className="font-display text-4xl uppercase leading-tight text-bone sm:text-5xl">
              Momen di Lapangan
            </h2>
            <p className="mt-4 font-body text-base text-bone/60">
              Geser untuk menjelajah atau klik gambar untuk melihat lebih besar.
            </p>
          </div>
          <div className="text-bone/40">
            <div className="font-display text-5xl leading-none text-pitch">
              {data.length.toString().padStart(2, "0")}
            </div>
            <div className="mt-1 font-body text-xs uppercase tracking-widest">Media Ditampilkan</div>
          </div>
        </Reveal>

        {/* Filter chips */}
        <Reveal className="mb-8 flex flex-wrap gap-2">
          {kategoriList.map((k) => {
            const active = filter === k;
            return (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={[
                  "rounded-full border px-4 py-2 font-body text-xs font-bold uppercase tracking-widest transition-all",
                  active
                    ? "border-pitch bg-pitch text-ink"
                    : "border-bone/15 bg-bone/5 text-bone/70 hover:border-pitch/60 hover:text-bone",
                ].join(" ")}
              >
                {k}
              </button>
            );
          })}
        </Reveal>
      </div>

      {/* Horizontal scroll strip — full width tanpa padding samping */}
      <div className="relative">
        {/* Fade edge kiri */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent sm:w-24" />
        {/* Fade edge kanan */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent sm:w-24" />

        <div
          ref={scrollRef}
          onMouseEnter={() => { isPausedRef.current = true; }}
          onMouseLeave={() => { isPausedRef.current = false; isDraggingRef.current = false; }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onScroll={onScroll}
          className="flex gap-3 overflow-x-auto py-4 select-none cursor-grab active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollBehavior: "auto" }}
        >
          {loopData.map((m, i) => {
            // Index sebenarnya dalam data asli (untuk lightbox)
            const realIndex = i % data.length;
            return (
              <button
                key={`${m._id}-${i}`}
                onMouseUp={() => {
                  if (!didDragRef.current) setLightboxIndex(realIndex);
                }}
                onTouchEnd={() => {
                  if (!didDragRef.current) setLightboxIndex(realIndex);
                }}
                className="group relative h-64 w-48 shrink-0 overflow-hidden rounded-2xl bg-coal ring-1 ring-bone/10 transition-all duration-300 hover:ring-pitch/60 hover:scale-[1.03] sm:h-72 sm:w-56"
              >
                {m.tipe === "video" ? (
                  <video
                    src={m.src}
                    poster={m.poster}
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="metadata"
                    className={`h-full w-full object-cover pointer-events-none${m.landscape ? " -rotate-90 scale-[1.334]" : ""}`}
                  />
                ) : (
                  <Image
                    src={m.src}
                    alt={m.judul}
                    width={400}
                    height={600}
                    draggable={false}
                    className={`h-full w-full pointer-events-none ${m.fit === "contain" ? "object-contain" : "object-cover transition-transform duration-500 group-hover:scale-110"}`}
                  />
                )}

                {/* Video badge */}
                {m.tipe === "video" && (
                  <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-pitch/95 px-2 py-1 font-body text-[10px] font-bold uppercase tracking-widest text-ink">
                    <PlayIcon /> Video
                  </span>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Caption */}
                <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="font-body text-[9px] font-bold uppercase tracking-widest text-pitch">{m.kategori}</span>
                  <h3 className="mt-0.5 line-clamp-2 font-display text-xs uppercase leading-tight text-bone">{m.judul}</h3>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hint scroll */}
      <Reveal className="mt-4 flex items-center justify-center gap-3 text-bone/30">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
          <path d="m15 18-6-6 6-6" />
        </svg>
        <span className="font-body text-[11px] uppercase tracking-widest">Geser untuk menjelajah</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </Reveal>

      {/* Lightbox */}
      {aktif && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 backdrop-blur-md"
          onClick={closeLightbox}
        >
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 sm:p-6">
            <div>
              <p className="font-body text-xs font-bold uppercase tracking-widest text-pitch">{aktif.kategori}</p>
              <h3 className="mt-1 font-display text-lg uppercase tracking-wide text-bone sm:text-xl">{aktif.judul}</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-body text-sm font-bold tracking-widest text-bone/60">
                {(lightboxIndex! + 1).toString().padStart(2, "0")}
                <span className="text-bone/30"> / {data.length.toString().padStart(2, "0")}</span>
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                aria-label="Tutup"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-bone/20 text-bone transition-all hover:border-pitch hover:bg-pitch hover:text-ink"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Sebelumnya"
            className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-bone/20 bg-ink/60 text-bone transition-all hover:border-pitch hover:bg-pitch hover:text-ink sm:left-6"
          >
            <ArrowIcon dir="left" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Berikutnya"
            className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-bone/20 bg-ink/60 text-bone transition-all hover:border-pitch hover:bg-pitch hover:text-ink sm:right-6"
          >
            <ArrowIcon dir="right" />
          </button>

          <div
            className="relative mx-auto flex max-h-[85vh] max-w-6xl items-center justify-center px-16"
            onClick={(e) => e.stopPropagation()}
          >
            {aktif.tipe === "video" ? (
              <video key={aktif._id} src={aktif.src} poster={aktif.poster} controls autoPlay className={`rounded-lg${aktif.landscape ? " -rotate-90 max-h-[60vw] w-auto" : " max-h-[85vh] w-auto"}`} />
            ) : (
              <Image key={aktif._id} src={aktif.src} alt={aktif.judul} width={1920} height={1280} className="max-h-[85vh] w-auto rounded-lg object-contain" priority />
            )}
          </div>

          <div className="absolute inset-x-0 bottom-4 text-center font-body text-[11px] uppercase tracking-widest text-bone/40 sm:bottom-6">
            Klik di luar untuk menutup · ← →
          </div>
        </div>
      )}
    </section>
  );
}

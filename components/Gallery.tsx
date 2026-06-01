"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

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
};

// Galeri terkini berdasarkan file di folder photo
// (disalin ke public/gallery dengan nama yang lebih ringkas).
const localGallery: LocalMedia[] = [
  {
    _id: "foto-1",
    judul: "Sesi Latihan Tim",
    kategori: "pertandingan",
    tipe: "gambar",
    src: "/gallery/foto-1.jpg",
  },
  {
    _id: "video-1",
    judul: "Cuplikan Lapangan",
    kategori: "pertandingan",
    tipe: "video",
    src: "/gallery/video-1.mp4",
    poster: "/gallery/foto-3.jpg",
  },
  {
    _id: "foto-3",
    judul: "Kebersamaan Tim",
    kategori: "pertandingan",
    tipe: "gambar",
    src: "/gallery/foto-3.jpg",
    fit: "contain",
  },
  {
    _id: "foto-4",
    judul: "Momen Persiapan",
    kategori: "pertandingan",
    tipe: "gambar",
    src: "/gallery/foto-4.jpg",
  },
  {
    _id: "foto-2",
    judul: "Aksi di Lapangan",
    kategori: "pertandingan",
    tipe: "gambar",
    src: "/gallery/foto-2.jpg",
  },
  {
    _id: "video-2",
    judul: "Drill Teknik",
    kategori: "pertandingan",
    tipe: "video",
    src: "/gallery/video-2.mp4",
    poster: "/gallery/foto-5.jpg",
  },
  {
    _id: "foto-5",
    judul: "Semangat Pemain",
    kategori: "pertandingan",
    tipe: "gambar",
    src: "/gallery/foto-5.jpg",
  },
  {
    _id: "foto-6",
    judul: "Selebrasi",
    kategori: "pertandingan",
    tipe: "gambar",
    src: "/gallery/foto-6.jpg",
  },
  {
    _id: "video-3",
    judul: "Aksi Latihan",
    kategori: "pertandingan",
    tipe: "video",
    src: "/gallery/video-3.mp4",
    poster: "/gallery/foto-7.jpg",
  },
  {
    _id: "foto-7",
    judul: "Latihan Bersama",
    kategori: "pertandingan",
    tipe: "gambar",
    src: "/gallery/foto-7.jpg",
  },
  {
    _id: "foto-8",
    judul: "Tim Solid",
    kategori: "prestasi",
    tipe: "gambar",
    src: "/gallery/foto-8.jpg",
  },
  {
    _id: "foto-9",
    judul: "Momen Tim",
    kategori: "prestasi",
    tipe: "gambar",
    src: "/gallery/foto-9.jpg",
    fit: "contain",
  },
  {
    _id: "foto-10",
    judul: "Briefing Tim",
    kategori: "latihan",
    tipe: "gambar",
    src: "/gallery/foto-10.jpg",
  },
  {
    _id: "foto-11",
    judul: "Momen Latihan",
    kategori: "pertandingan",
    tipe: "gambar",
    src: "/gallery/foto-11.jpg",
  },
  {
    _id: "foto-12",
    judul: "Strategi Pelatih",
    kategori: "latihan",
    tipe: "gambar",
    src: "/gallery/foto-12.jpg",
  },
  {
    _id: "foto-13",
    judul: "Diskusi Tim",
    kategori: "pertandingan",
    tipe: "gambar",
    src: "/gallery/foto-13.jpg",
  },
  {
    _id: "foto-14",
    judul: "Wasit & Pemain",
    kategori: "pertandingan",
    tipe: "gambar",
    src: "/gallery/foto-14.jpg",
  },
  {
    _id: "foto-15",
    judul: "Persiapan Pertandingan",
    kategori: "pertandingan",
    tipe: "gambar",
    src: "/gallery/foto-15.jpg",
  },
  {
    _id: "foto-16",
    judul: "Kebersamaan",
    kategori: "latihan",
    tipe: "gambar",
    src: "/gallery/foto-16.jpg",
    fit: "contain",
  },
  {
    _id: "foto-17",
    judul: "Sesi Lapangan",
    kategori: "pertandingan",
    tipe: "gambar",
    src: "/gallery/foto-17.jpg",
    fit: "contain",
  },
  {
    _id: "foto-18",
    judul: "Latihan Pagi",
    kategori: "pertandingan",
    tipe: "gambar",
    src: "/gallery/foto-18.jpg",
    fit: "contain",
  },
  {
    _id: "foto-19",
    judul: "Aksi Pemain",
    kategori: "pertandingan",
    tipe: "gambar",
    src: "/gallery/foto-19.jpg",
  },
  {
    _id: "foto-20",
    judul: "Momen Bertanding",
    kategori: "pertandingan",
    tipe: "gambar",
    src: "/gallery/foto-20.jpg",
  },
  {
    _id: "foto-21",
    judul: "Semangat Tim",
    kategori: "pertandingan",
    tipe: "gambar",
    src: "/gallery/foto-21.jpg",
  },
  {
    _id: "foto-22",
    judul: "Drill Bersama",
    kategori: "pertandingan",
    tipe: "gambar",
    src: "/gallery/foto-22.jpg",
  },
  {
    _id: "foto-23",
    judul: "Strategi Lapangan",
    kategori: "pertandingan",
    tipe: "gambar",
    src: "/gallery/foto-23.jpg",
  },
  {
    _id: "foto-24",
    judul: "Kebersamaan Pemain",
    kategori: "pertandingan",
    tipe: "gambar",
    src: "/gallery/foto-24.jpg",
  },
  {
    _id: "foto-25",
    judul: "Sesi Latihan",
    kategori: "pertandingan",
    tipe: "gambar",
    src: "/gallery/foto-25.jpg",
  },
  {
    _id: "foto-26",
    judul: "Outing Tim",
    kategori: "rekreasi",
    tipe: "gambar",
    src: "/gallery/foto-26.jpg",
  },
  {
    _id: "foto-27",
    judul: "Keceriaan Bersama",
    kategori: "rekreasi",
    tipe: "gambar",
    src: "/gallery/foto-27.jpg",
  },
  {
    _id: "video-4",
    judul: "Momen Santai Tim",
    kategori: "rekreasi",
    tipe: "video",
    src: "/gallery/video-4.mp4",
    poster: "/gallery/foto-26.jpg",
  },
  {
    _id: "video-5",
    judul: "Aksi Pertandingan",
    kategori: "pertandingan",
    tipe: "video",
    src: "/gallery/video-5.mp4",
    poster: "/gallery/foto-19.jpg",
  },
  {
    _id: "latihan-1",
    judul: "Sesi Latihan",
    kategori: "latihan",
    tipe: "video",
    src: "/gallery/latihan-1.mp4",
    poster: "/gallery/foto-10.jpg",
    fit: "contain",
  },
  {
    _id: "latihan-2",
    judul: "Drill Latihan",
    kategori: "latihan",
    tipe: "video",
    src: "/gallery/latihan-2.mp4",
    poster: "/gallery/foto-12.jpg",
    fit: "contain",
  },
];

// Pola bento — masing-masing tile dapat span sesuai indeks (siklus 12)
const bentoSpan = [
  "col-span-2 row-span-2", // 0  big
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-2", // 3  tall
  "col-span-1 row-span-1",
  "col-span-2 row-span-1", // 5  wide
  "col-span-1 row-span-1",
  "col-span-1 row-span-2", // 7  tall
  "col-span-2 row-span-2", // 8  big
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1", // 11 wide
];

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-6 w-6"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ArrowIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      {dir === "left" ? (
        <path d="m15 18-6-6 6-6" />
      ) : (
        <path d="m9 18 6-6-6-6" />
      )}
    </svg>
  );
}

export default function Gallery({ items: _ }: { items?: GalleryItem[] }) {
  const [filter, setFilter] = useState<string>("semua");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Sumber data — tetap LocalMedia. Sanity bisa dipasang nanti tanpa
  // mengubah UI ini selama bentuknya disesuaikan.
  const sumber = localGallery;

  // Daftar kategori unik untuk filter chips
  const kategoriList = useMemo(() => {
    const set = new Set(sumber.map((m) => m.kategori.toLowerCase()));
    return ["semua", ...Array.from(set)];
  }, [sumber]);

  // Data setelah filter
  const data = useMemo(() => {
    if (filter === "semua") return sumber;
    return sumber.filter((m) => m.kategori.toLowerCase() === filter);
  }, [filter, sumber]);

  // Reset lightbox jika filter berubah & index keluar batas
  useEffect(() => {
    if (lightboxIndex !== null && lightboxIndex >= data.length) {
      setLightboxIndex(null);
    }
  }, [data.length, lightboxIndex]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const next = useCallback(
    () =>
      setLightboxIndex((i) =>
        i === null ? null : (i + 1) % data.length,
      ),
    [data.length],
  );
  const prev = useCallback(
    () =>
      setLightboxIndex((i) =>
        i === null ? null : (i - 1 + data.length) % data.length,
      ),
    [data.length],
  );

  // Keyboard: Esc / arrow keys + lock body scroll saat lightbox terbuka
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

  const aktif = lightboxIndex !== null ? data[lightboxIndex] : null;

  return (
    <section id="galeri" className="relative bg-ink py-24 lg:py-32">
      {/* Aksen latar */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(57,255,20,0.06),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="tag-label mb-5">Galeri</p>
            <h2 className="font-display text-4xl uppercase leading-tight text-bone sm:text-5xl">
              Momen di Lapangan
            </h2>
            <p className="mt-4 font-body text-base text-bone/60">
              Klik tiap kartu untuk melihat lebih besar. Geser dengan{" "}
              <kbd className="rounded border border-bone/20 px-1.5 py-0.5 text-xs text-bone/80">
                ←
              </kbd>{" "}
              <kbd className="rounded border border-bone/20 px-1.5 py-0.5 text-xs text-bone/80">
                →
              </kbd>{" "}
              atau tekan{" "}
              <kbd className="rounded border border-bone/20 px-1.5 py-0.5 text-xs text-bone/80">
                Esc
              </kbd>{" "}
              untuk menutup.
            </p>
          </div>

          <div className="text-bone/40">
            <div className="font-display text-5xl leading-none text-pitch">
              {data.length.toString().padStart(2, "0")}
            </div>
            <div className="mt-1 font-body text-xs uppercase tracking-widest">
              Media Ditampilkan
            </div>
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

        {/* Bento masonry grid */}
        <div className="grid auto-rows-[140px] grid-cols-2 gap-3 [grid-auto-flow:dense] sm:auto-rows-[160px] sm:grid-cols-3 sm:gap-4 lg:auto-rows-[180px] lg:grid-cols-4">
          {data.map((m, i) => {
            const span = bentoSpan[i % bentoSpan.length];
            const isBig =
              span.includes("col-span-2") && span.includes("row-span-2");
            const useContain = m.fit === "contain" || isBig;
            return (
              <Reveal key={m._id} delay={(i % 8) * 50}>
                <button
                  onClick={() => setLightboxIndex(i)}
                  className={`group relative h-full w-full overflow-hidden rounded-xl bg-coal text-left ring-1 ring-bone/10 transition-all duration-500 hover:ring-pitch/60 ${span}`}
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
                      className={
                        m.fit === "contain"
                          ? "h-full w-full object-contain"
                          : "h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      }
                    />
                  ) : (
                    <Image
                      src={m.src}
                      alt={m.judul}
                      width={span.includes("col-span-2") ? 1200 : 700}
                      height={span.includes("row-span-2") ? 1200 : 700}
                      className={
                        useContain
                          ? "h-full w-full object-contain"
                          : "h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      }
                    />
                  )}

                  {/* Badge tipe */}
                  {m.tipe === "video" && (
                    <span className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-pitch/95 px-2.5 py-1 font-body text-[10px] font-bold uppercase tracking-widest text-ink backdrop-blur">
                      <PlayIcon />
                      Video
                    </span>
                  )}

                  {/* Hover overlay glassmorphism */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  {/* Caption + zoom hint */}
                  <div className="absolute inset-x-0 bottom-0 translate-y-3 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="font-body text-[10px] font-bold uppercase tracking-widest text-pitch">
                      {m.kategori}
                    </span>
                    <h3 className="mt-0.5 line-clamp-2 font-display text-sm uppercase tracking-wide text-bone sm:text-base">
                      {m.judul}
                    </h3>
                  </div>

                  {/* Ikon zoom kanan-atas saat hover */}
                  <span className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 -translate-y-1 items-center justify-center rounded-full bg-ink/70 text-bone opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    {m.tipe === "video" ? null : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <circle cx="11" cy="11" r="7" />
                        <path d="m21 21-4.3-4.3M11 8v6M8 11h6" />
                      </svg>
                    )}
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>

        {/* Empty state */}
        {data.length === 0 && (
          <div className="rounded-xl border border-bone/10 bg-coal/40 py-16 text-center">
            <p className="font-display text-lg uppercase tracking-widest text-bone/40">
              Belum ada media di kategori ini
            </p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {aktif && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 backdrop-blur-md"
          onClick={closeLightbox}
        >
          {/* Header */}
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 sm:p-6">
            <div>
              <p className="font-body text-xs font-bold uppercase tracking-widest text-pitch">
                {aktif.kategori}
              </p>
              <h3 className="mt-1 font-display text-lg uppercase tracking-wide text-bone sm:text-xl">
                {aktif.judul}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-body text-sm font-bold tracking-widest text-bone/60">
                {(lightboxIndex! + 1).toString().padStart(2, "0")}
                <span className="text-bone/30"> / {data.length.toString().padStart(2, "0")}</span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeLightbox();
                }}
                aria-label="Tutup"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-bone/20 text-bone transition-all hover:border-pitch hover:bg-pitch hover:text-ink"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Tombol navigasi */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Sebelumnya"
            className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-bone/20 bg-ink/60 text-bone transition-all hover:border-pitch hover:bg-pitch hover:text-ink sm:left-6"
          >
            <ArrowIcon dir="left" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Berikutnya"
            className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-bone/20 bg-ink/60 text-bone transition-all hover:border-pitch hover:bg-pitch hover:text-ink sm:right-6"
          >
            <ArrowIcon dir="right" />
          </button>

          {/* Konten */}
          <div
            className="relative mx-auto flex max-h-[85vh] max-w-6xl items-center justify-center px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {aktif.tipe === "video" ? (
              <video
                key={aktif._id}
                src={aktif.src}
                poster={aktif.poster}
                controls
                autoPlay
                className="max-h-[85vh] w-auto rounded-lg"
              />
            ) : (
              <Image
                key={aktif._id}
                src={aktif.src}
                alt={aktif.judul}
                width={1920}
                height={1280}
                className="max-h-[85vh] w-auto rounded-lg object-contain"
                priority
              />
            )}
          </div>

          {/* Hint bawah */}
          <div className="absolute inset-x-0 bottom-4 text-center font-body text-[11px] uppercase tracking-widest text-bone/40 sm:bottom-6">
            Klik di luar gambar untuk menutup
          </div>
        </div>
      )}
    </section>
  );
}

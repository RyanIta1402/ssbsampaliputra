import Image from "next/image";

import Reveal from "./Reveal";
import SanityImage from "./SanityImage";

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
    kategori: "latihan",
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
    kategori: "latihan",
    tipe: "gambar",
    src: "/gallery/foto-3.jpg",
  },
  {
    _id: "foto-4",
    judul: "Momen Persiapan",
    kategori: "latihan",
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
    kategori: "latihan",
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
    kategori: "latihan",
    tipe: "video",
    src: "/gallery/video-3.mp4",
    poster: "/gallery/foto-7.jpg",
  },
  {
    _id: "foto-7",
    judul: "Latihan Bersama",
    kategori: "latihan",
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
    kategori: "Prestasi",
    tipe: "gambar",
    src: "/gallery/foto-9.jpg",
    fit: "contain",
  },
];

export default function Gallery({ items }: { items?: GalleryItem[] }) {
  const useSanity = items && items.length > 0;

  return (
    <section id="galeri" className="relative bg-ink py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mb-14 max-w-2xl">
          <p className="tag-label mb-5">Galeri</p>
          <h2 className="font-display text-4xl uppercase leading-tight text-bone sm:text-5xl">
            Momen di Lapangan
          </h2>
          <p className="mt-4 font-body text-base text-bone/60">
            Kumpulan foto dan video terkini dari latihan, pertandingan, dan
            kebersamaan tim SSB Sampali Putra.
          </p>
        </Reveal>

        <div className="grid auto-rows-[220px] grid-cols-2 gap-4 lg:grid-cols-4">
          {useSanity
            ? items!.map((g, i) => {
                const big = i === 0 || i === 3;
                return (
                  <Reveal
                    key={g._id || i}
                    delay={i * 60}
                    className={big ? "col-span-2 row-span-2" : ""}
                  >
                    <div className="group relative h-full w-full overflow-hidden">
                      <SanityImage
                        image={g.gambar}
                        alt={g.judul || "Galeri"}
                        width={big ? 800 : 500}
                        height={big ? 800 : 500}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        fallbackLabel={g.judul}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-60 transition-opacity group-hover:opacity-90" />
                      <div className="absolute inset-x-0 bottom-0 translate-y-2 p-5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        {g.kategori && (
                          <span className="font-body text-xs font-bold uppercase tracking-widest text-pitch">
                            {g.kategori}
                          </span>
                        )}
                        <h3 className="font-display text-lg uppercase tracking-wide text-bone">
                          {g.judul}
                        </h3>
                      </div>
                    </div>
                  </Reveal>
                );
              })
            : localGallery.map((m, i) => {
                const big = i === 0 || i === 5;
                return (
                  <Reveal
                    key={m._id}
                    delay={i * 60}
                    className={big ? "col-span-2 row-span-2" : ""}
                  >
                    <div className="group relative h-full w-full overflow-hidden bg-coal">
                      {m.tipe === "video" ? (
                        <video
                          src={m.src}
                          poster={m.poster}
                          muted
                          loop
                          playsInline
                          autoPlay
                          preload="metadata"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <Image
                          src={m.src}
                          alt={m.judul}
                          width={big ? 1000 : 600}
                          height={big ? 1000 : 600}
                          className={
                            m.fit === "contain"
                              ? "h-full w-full object-contain"
                              : "h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          }
                        />
                      )}

                      {m.tipe === "video" && (
                        <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-pitch px-3 py-1 font-body text-[10px] font-bold uppercase tracking-widest text-ink">
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-3 w-3"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          Video
                        </span>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-60 transition-opacity group-hover:opacity-90" />
                      <div className="absolute inset-x-0 bottom-0 translate-y-2 p-5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <span className="font-body text-xs font-bold uppercase tracking-widest text-pitch">
                          {m.kategori}
                        </span>
                        <h3 className="font-display text-lg uppercase tracking-wide text-bone">
                          {m.judul}
                        </h3>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
        </div>
      </div>
    </section>
  );
}

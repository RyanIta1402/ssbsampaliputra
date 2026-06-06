import Image from "next/image";

import AnimatedCard from "./AnimatedCard";
import Reveal from "./Reveal";
import SanityImage from "./SanityImage";

type Poin = { judul?: string; deskripsi?: string };
type AboutData = {
  judul?: string;
  ringkasan?: string;
  tahunBerdiri?: string;
  gambar?: import("sanity").Image;
  poinKeunggulan?: Poin[];
};

const defaultPoin: Poin[] = [
  {
    judul: "Kurikulum Terstruktur",
    deskripsi:
      "Materi latihan disusun bertahap sesuai usia, dari teknik dasar hingga taktik bermain.",
  },
  {
    judul: "Pelatih Berpengalaman",
    deskripsi:
      "Dilatih oleh pelatih bersertifikat dengan pengalaman membina atlet muda.",
  },
  {
    judul: "Pembentukan Karakter",
    deskripsi:
      "Menanamkan disiplin, sportivitas, dan mental juara di setiap sesi latihan.",
  },
  {
    judul: "Jalur Kompetisi",
    deskripsi:
      "Kesempatan mengikuti turnamen antar-SSB untuk mengasah jam terbang.",
  },
];

export default function About({ data }: { data?: AboutData }) {
  const judul = data?.judul || "Tentang SSB Sampali Putra";
  const ringkasan =
    data?.ringkasan ||
    "SSB Sampali Putra adalah sekolah sepak bola anak usia dini di kawasan Sampali, Percut Sei Tuan, Deli Serdang, Sumatera Utara. Sebagai salah satu akademi sepak bola terdekat di Medan dan sekitarnya, kami membina anak SD hingga remaja (U-8, U-12, hingga U-15) dengan pelatih berpengalaman dan biaya iuran yang terjangkau. Kami percaya setiap anak punya potensi menjadi bintang — tugas kami mengasahnya melalui latihan terarah, lingkungan positif, dan bimbingan penuh dedikasi.";
  const tahun = data?.tahunBerdiri || "1995";
  const poin =
    data?.poinKeunggulan && data.poinKeunggulan.length > 0
      ? data.poinKeunggulan
      : defaultPoin;

  return (
    <section id="tentang" className="relative bg-ink py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Gambar */}
          <Reveal className="relative">
            <div className="relative aspect-[4/3] overflow-hidden">
              {data?.gambar ? (
                <SanityImage
                  image={data.gambar}
                  alt="Tim SSB Sampali Putra"
                  width={1200}
                  height={900}
                  className="h-full w-full object-contain"
                  fallbackLabel="Foto Tim"
                />
              ) : (
                <Image
                  src="/foto-tim.jpg"
                  alt="Tim SSB Sampali Putra"
                  width={1980}
                  height={1500}
                  className="h-full w-full object-contain"
                  priority
                />
              )}
            </div>
            {/* Badge tahun — di bawah foto, ukuran kecil */}
            <div className="mt-4 inline-flex items-center gap-3 bg-pitch px-4 py-2">
              <span className="font-display text-2xl leading-none text-ink">
                {tahun}
              </span>
              <span className="font-body text-[10px] font-bold uppercase tracking-widest text-ink/70">
                Tahun Berdiri
              </span>
            </div>
          </Reveal>

          {/* Teks */}
          <div>
            <Reveal>
              <p className="tag-label mb-5">Tentang Kami</p>
              <h2 className="font-display text-4xl uppercase leading-tight text-bone sm:text-5xl">
                {judul}
              </h2>
              <p className="mt-6 text-base leading-relaxed text-bone/70">
                {ringkasan}
              </p>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {poin.map((p, i) => (
                <Reveal key={i} delay={i * 80}>
                  <AnimatedCard>
                    <div className="mb-3 font-display text-2xl text-gold transition-transform duration-300 group-hover:scale-110 inline-block origin-left">
                      0{i + 1}
                    </div>
                    <h3 className="font-display text-lg uppercase tracking-wide text-bone transition-colors duration-300 group-hover:text-pitch">
                      {p.judul}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-bone/60">
                      {p.deskripsi}
                    </p>
                  </AnimatedCard>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

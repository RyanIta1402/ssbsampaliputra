import Image from "next/image";

import AnimatedCard from "./AnimatedCard";
import Reveal from "./Reveal";
import SanityImage from "./SanityImage";

type Coach = {
  _id?: string;
  nama?: string;
  jabatan?: string;
  lisensi?: string;
  bio?: string;
  foto?: import("sanity").Image;
  fotoLocal?: string;
};

const defaultCoaches: Coach[] = [
  {
    _id: "1",
    nama: "Coach Panji",
    jabatan: "Pelatih",
    lisensi: "",
    bio: "Berpengalaman lebih dari 12 tahun membina pemain muda di Sumatera Utara.",
    fotoLocal: "/coaches/panji.jpeg",
  },
  {
    _id: "2",
    nama: "Coach Iqbal",
    jabatan: "Pelatih Teknik",
    lisensi: "",
    bio: "Spesialis pengembangan teknik individu dan kontrol bola.",
    fotoLocal: "/coaches/iqbal.jpeg",
  },
  {
    _id: "3",
    nama: "Coach Ghalib",
    jabatan: "Pelatih Fisik",
    lisensi: "",
    bio: "Menangani program kebugaran dan pencegahan cedera pemain.",
    fotoLocal: "/coaches/ghalib.jpeg",
  },
];

export default function Coaches({ coaches }: { coaches?: Coach[] }) {
  const list = coaches && coaches.length > 0 ? coaches : defaultCoaches;

  return (
    <section id="pelatih" className="relative bg-ink py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mb-14 max-w-2xl">
          <p className="tag-label mb-5">Tim Pelatih</p>
          <h2 className="font-display text-4xl uppercase leading-tight text-bone sm:text-5xl">
            Dibimbing Tangan Ahli
          </h2>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c, i) => (
            <Reveal key={c._id || i} delay={i * 100}>
              <AnimatedCard padded={false}>
                <div className="relative aspect-[3/4] overflow-hidden">
                  {c.fotoLocal ? (
                    <Image
                      src={c.fotoLocal}
                      alt={c.nama || "Pelatih"}
                      width={600}
                      height={800}
                      className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                    />
                  ) : (
                    <SanityImage
                      image={c.foto}
                      alt={c.nama || "Pelatih"}
                      width={600}
                      height={800}
                      className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                      fallbackLabel="Foto Pelatih"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
                  {c.lisensi && (
                    <span className="absolute left-4 top-4 bg-pitch px-3 py-1 font-body text-xs font-bold uppercase tracking-wide text-ink">
                      {c.lisensi}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl uppercase tracking-wide text-bone transition-colors duration-300 group-hover:text-pitch">
                    {c.nama}
                  </h3>
                  <p className="mt-1 font-body text-sm font-semibold uppercase tracking-widest text-gold">
                    {c.jabatan}
                  </p>
                  {c.bio && (
                    <p className="mt-3 text-sm leading-relaxed text-bone/60">
                      {c.bio}
                    </p>
                  )}
                </div>
              </AnimatedCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

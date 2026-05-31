import Reveal from "./Reveal";

type Program = {
  _id?: string;
  nama?: string;
  kelompokUsia?: string;
  deskripsi?: string;
  hariLatihan?: string;
  biaya?: string;
  fitur?: string[];
};

const defaultPrograms: Program[] = [
  {
    _id: "1",
    nama: "Kelas Pemula",
    kelompokUsia: "U-6 s/d U-8",
    deskripsi:
      "Pengenalan dasar sepak bola lewat permainan menyenangkan dan koordinasi gerak.",
    hariLatihan: "Selasa, Kamis, Jumat",
    biaya: "Rp 25.000",
    fitur: ["Teknik dasar", "Permainan kelompok", "Jersey latihan"],
  },
  {
    _id: "2",
    nama: "Kelas Menengah",
    kelompokUsia: "U-9 s/d U-12",
    deskripsi:
      "Penguasaan teknik kontrol, passing, dribbling, dan pemahaman posisi.",
    hariLatihan: "Selasa, Kamis, Jumat",
    biaya: "Rp 25.000",
    fitur: ["Latihan taktik", "Uji tanding", "Evaluasi berkala"],
  },
  {
    _id: "3",
    nama: "Kelas Pra-Kompetisi",
    kelompokUsia: "U-13 s/d U-15",
    deskripsi:
      "Persiapan kompetisi dengan latihan intensif, strategi tim, dan fisik.",
    hariLatihan: "Selasa, Kamis, Jumat",
    biaya: "Rp 25.000",
    fitur: ["Program fisik", "Turnamen rutin", "Pemantauan scout"],
  },
];

export default function Programs({ programs }: { programs?: Program[] }) {
  const list = programs && programs.length > 0 ? programs : defaultPrograms;

  return (
    <section id="program" className="relative bg-coal py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mb-14 max-w-2xl">
          <p className="tag-label mb-5">Program Latihan</p>
          <h2 className="font-display text-4xl uppercase leading-tight text-bone sm:text-5xl">
            Jenjang Latihan Sesuai Usia
          </h2>
          <p className="mt-5 text-base leading-relaxed text-bone/70">
            Setiap kelompok usia memiliki kurikulum khusus agar perkembangan
            pemain berjalan optimal dan menyenangkan.
          </p>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-3">
          {list.map((p, i) => (
            <Reveal key={p._id || i} delay={i * 100}>
              <div className="card-edge group h-full p-8">
                {/* Aksen sudut */}
                <span className="absolute right-0 top-0 h-16 w-16 translate-x-8 -translate-y-8 rotate-45 bg-pitch/10 transition-transform duration-500 group-hover:translate-x-6 group-hover:-translate-y-6" />

                <span className="inline-block bg-gold/15 px-3 py-1 font-body text-xs font-bold uppercase tracking-widest text-gold">
                  {p.kelompokUsia}
                </span>

                <h3 className="mt-5 font-display text-2xl uppercase tracking-wide text-bone">
                  {p.nama}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-bone/60">
                  {p.deskripsi}
                </p>

                <div className="mt-6 space-y-2 border-t border-bone/10 pt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-bone/50">Jadwal</span>
                    <span className="font-semibold text-bone">
                      {p.hariLatihan}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-bone/50">Biaya / bulan</span>
                    <span className="font-display text-xl text-pitch">
                      {p.biaya}
                    </span>
                  </div>
                </div>

                {p.fitur && p.fitur.length > 0 && (
                  <ul className="mt-6 space-y-2">
                    {p.fitur.map((f, fi) => (
                      <li
                        key={fi}
                        className="flex items-center gap-3 text-sm text-bone/70"
                      >
                        <span className="h-1.5 w-1.5 rotate-45 bg-pitch" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                <a
                  href="#kontak"
                  className="mt-8 inline-flex items-center gap-2 font-body text-sm font-bold uppercase tracking-widest text-pitch transition-colors hover:text-gold"
                >
                  Daftar Kelas Ini →
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

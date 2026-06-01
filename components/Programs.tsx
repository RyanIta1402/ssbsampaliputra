import AnimatedCard from "./AnimatedCard";
import Reveal from "./Reveal";

type Program = {
  _id?: string;
  nama?: string;
  kelompokUsia?: string;
  deskripsi?: string;
  hariLatihan?: string;
  biaya?: string;
  uangKas?: string;
  fitur?: string[];
};

const defaultPrograms: Program[] = [
  {
    _id: "1",
    nama: "Kelas Pemula",
    kelompokUsia: "U-6 s/d U-8",
    deskripsi:
      "Pengenalan dasar sepak bola lewat permainan menyenangkan dan koordinasi gerak.",
    hariLatihan: "Selasa, Rabu, Jumat",
    biaya: "Rp 20.000",
    uangKas: "Rp 5.000",
    fitur: ["Teknik dasar", "Permainan kelompok", "Jersey latihan"],
  },
  {
    _id: "2",
    nama: "Kelas Menengah",
    kelompokUsia: "U-9 s/d U-12",
    deskripsi:
      "Penguasaan teknik kontrol, passing, dribbling, dan pemahaman posisi.",
    hariLatihan: "Selasa, Rabu, Jumat",
    biaya: "Rp 20.000",
    uangKas: "Rp 5.000",
    fitur: ["Latihan taktik", "Uji tanding", "Evaluasi berkala"],
  },
  {
    _id: "3",
    nama: "Kelas Pra-Kompetisi",
    kelompokUsia: "U-13 s/d U-15",
    deskripsi:
      "Persiapan kompetisi dengan latihan intensif, strategi tim, dan fisik.",
    hariLatihan: "Selasa, Rabu, Jumat",
    biaya: "Rp 20.000",
    uangKas: "Rp 5.000",
    fitur: ["Program fisik", "Turnamen rutin", "Pemantauan scout"],
  },
];

export default function Programs({ programs }: { programs?: Program[] }) {
  const list = programs && programs.length > 0 ? programs : defaultPrograms;

  return (
    <section
      id="program"
      className="relative overflow-hidden bg-coal py-24 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(22,240,74,0.06),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_100%,rgba(245,197,66,0.05),transparent_55%)]" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
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
            <Reveal key={p._id || i} delay={i * 120}>
              <AnimatedCard padded={false}>
                <div className="relative p-5 sm:p-8">
                  <span className="pointer-events-none absolute right-0 top-0 h-20 w-20 translate-x-10 -translate-y-10 rotate-45 bg-pitch/10 transition-all duration-500 group-hover:translate-x-7 group-hover:-translate-y-7 group-hover:bg-pitch/25" />

                  <span className="inline-flex animate-float items-center gap-1.5 bg-gold/15 px-3 py-1 font-body text-xs font-bold uppercase tracking-widest text-gold ring-1 ring-gold/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold animate-glow" />
                    {p.kelompokUsia}
                  </span>

                  <h3 className="mt-5 font-display text-2xl uppercase tracking-wide text-bone transition-colors duration-300 group-hover:text-pitch">
                    {p.nama}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-bone/60">
                    {p.deskripsi}
                  </p>

                  <div className="mt-6 flex flex-col gap-4 border-t border-bone/10 pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="font-body text-xs text-bone/60">
                        Jadwal
                      </div>
                      <div className="font-semibold leading-tight text-bone text-right">
                        {p.hariLatihan}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="font-body text-xs text-bone/60">
                        Iuran Orang Tua Siswa / bulan
                      </div>
                      <div className="whitespace-nowrap font-display text-xl text-pitch transition-transform duration-300 group-hover:scale-110 origin-right">
                        {p.biaya}
                      </div>
                    </div>
                    {p.uangKas && (
                      <div className="flex items-center justify-between gap-4">
                        <div className="font-body text-xs text-bone/60">
                          Uang Kas Siswa / bulan
                        </div>
                        <div className="whitespace-nowrap font-display text-xl text-gold transition-transform duration-300 [transition-delay:60ms] group-hover:scale-110 origin-right">
                          {p.uangKas}
                        </div>
                      </div>
                    )}
                  </div>

                  {p.fitur && p.fitur.length > 0 && (
                    <ul className="mt-6 space-y-2">
                      {p.fitur.map((f, fi) => (
                        <li
                          key={fi}
                          style={{ transitionDelay: `${fi * 70}ms` }}
                          className="flex items-center gap-3 text-sm text-bone/70 transition-all duration-300 group-hover:translate-x-1 group-hover:text-bone"
                        >
                          <span className="h-1.5 w-1.5 rotate-45 bg-pitch transition-transform duration-300 group-hover:scale-150" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  <a
                    href="#kontak"
                    className="group/btn mt-8 inline-flex items-center gap-2 font-body text-sm font-bold uppercase tracking-widest text-pitch transition-colors hover:text-gold"
                  >
                    Daftar Kelas Ini
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-2 group-hover/btn:translate-x-1">
                      →
                    </span>
                  </a>
                </div>
              </AnimatedCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

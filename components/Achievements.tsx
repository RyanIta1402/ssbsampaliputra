import Reveal from "./Reveal";

type Achievement = {
  _id?: string;
  judul?: string;
  tahun?: string;
  keterangan?: string;
};

const defaultAchievements: Achievement[] = [
  {
    _id: "1",
    judul: "Juara 1 Liga Pelajar U-12 Deli Serdang",
    tahun: "2024",
    keterangan: "Menjuarai turnamen antar-SSB se-kabupaten.",
  },
  {
    _id: "2",
    judul: "Runner-up Piala Danone U-15",
    tahun: "2023",
    keterangan: "Lolos hingga babak final tingkat regional.",
  },
  {
    _id: "3",
    judul: "3 Pemain Lolos Seleksi Akademi Klub Profesional",
    tahun: "2023",
    keterangan: "Bukti kualitas pembinaan jangka panjang.",
  },
  {
    _id: "4",
    judul: "Juara Festival Sepak Bola Usia Dini",
    tahun: "2022",
    keterangan: "Kategori U-10 tingkat kecamatan Percut Sei Tuan.",
  },
];

export default function Achievements({
  achievements,
}: {
  achievements?: Achievement[];
}) {
  const list =
    achievements && achievements.length > 0
      ? achievements
      : defaultAchievements;

  return (
    <section className="relative overflow-hidden bg-coal py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:48px_48px] opacity-30" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mb-14 max-w-2xl">
          <p className="tag-label mb-5">Rekam Jejak</p>
          <h2 className="font-display text-4xl uppercase leading-tight text-bone sm:text-5xl">
            Prestasi Yang <span className="text-gold">Membanggakan</span>
          </h2>
        </Reveal>

        <div className="grid gap-px bg-bone/10 md:grid-cols-2">
          {list.map((a, i) => (
            <Reveal key={a._id || i} delay={i * 80}>
              <div className="group flex h-full items-start gap-5 bg-coal p-8 transition-colors hover:bg-ink">
                <div className="shrink-0 font-display text-4xl text-pitch lg:text-5xl">
                  {a.tahun}
                </div>
                <div>
                  <h3 className="font-display text-lg uppercase leading-snug tracking-wide text-bone">
                    {a.judul}
                  </h3>
                  {a.keterangan && (
                    <p className="mt-2 text-sm leading-relaxed text-bone/60">
                      {a.keterangan}
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

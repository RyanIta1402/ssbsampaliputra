import SanityImage from "./SanityImage";

type Stat = { angka?: string; label?: string };
type HeroData = {
  judulBaris1?: string;
  judulBaris2?: string;
  subjudul?: string;
  teksTombolUtama?: string;
  teksTombolKedua?: string;
  gambarLatar?: import("sanity").Image;
  statistik?: Stat[];
};

const defaultStats: Stat[] = [
  { angka: "30+", label: "Tahun Pengalaman" },
  { angka: "50+", label: "Siswa Aktif" },
  { angka: "10+", label: "Trofi Juara" },
  { angka: "3+", label: "Pelatih Berpengalaman" },
];

export default function Hero({ data }: { data?: HeroData }) {
  const baris1 = data?.judulBaris1 || "LAHIRKAN";
  const baris2 = data?.judulBaris2 || "JUARA MASA DEPAN";
  const subjudul =
    data?.subjudul ||
    "Sekolah Sepak Bola Sampali Putra membina anak usia dini hingga remaja dengan kurikulum modern, pelatih berpengalaman, dan fasilitas terbaik di Sampali, Deli Serdang.";
  const stats =
    data?.statistik && data.statistik.length > 0
      ? data.statistik
      : defaultStats;

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-ink pt-24">
      {/* Latar belakang */}
      <div className="absolute inset-0">
        <SanityImage
          image={data?.gambarLatar}
          alt="Latihan SSB Sampali Putra"
          width={1920}
          height={1080}
          className="h-full w-full object-cover opacity-30"
          fallbackLabel=""
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
        <div className="absolute inset-0 bg-grid-faint [background-size:48px_48px] opacity-40" />
      </div>

      {/* Bola dekoratif */}
      <div className="pointer-events-none absolute -right-20 top-1/4 hidden h-72 w-72 rounded-full bg-pitch/10 blur-3xl lg:block" />

      <div className="relative mx-auto w-full max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <p className="tag-label mb-6 animate-fade-up">
            Sekolah Sepak Bola • Sampali, Deli Serdang
          </p>

          <h1 className="font-display text-5xl uppercase leading-[1.1] tracking-tight text-bone sm:text-7xl sm:leading-[0.95] lg:text-8xl lg:leading-[0.9]">
            <span className="block animate-fade-up pb-1 [animation-delay:120ms] opacity-0">
              {baris1}
            </span>
            <span className="block animate-fade-up pb-1 text-pitch [animation-delay:240ms] opacity-0">
              {baris2}
            </span>
          </h1>

          <p className="mt-7 max-w-xl animate-fade-up text-base leading-relaxed text-bone/70 [animation-delay:360ms] opacity-0 sm:text-lg">
            {subjudul}
          </p>

          <div className="mt-9 flex animate-fade-up flex-col gap-4 [animation-delay:480ms] opacity-0 sm:flex-row">
            <a href="#kontak" className="btn-primary">
              {data?.teksTombolUtama || "Daftar Sekarang"}
            </a>
            <a href="#program" className="btn-ghost">
              {data?.teksTombolKedua || "Lihat Program"}
            </a>
          </div>
        </div>

        {/* Statistik */}
        <div className="mt-16 grid grid-cols-2 gap-px border border-bone/10 bg-bone/10 sm:mt-20 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-ink p-6 lg:p-8">
              <div className="font-display text-4xl text-gold lg:text-5xl">
                {s.angka}
              </div>
              <div className="mt-2 font-body text-xs font-semibold uppercase tracking-widest text-bone/50">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

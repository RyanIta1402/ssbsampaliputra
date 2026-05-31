import AnimatedCard from "./AnimatedCard";
import Reveal from "./Reveal";

type Pengurus = {
  jabatan: string;
  nama: string[];
};

const susunan: Pengurus[] = [
  { jabatan: "Penasehat", nama: ["Hendrianto", "Ardy Syahputra", "Legimin"] },
  { jabatan: "Pembina", nama: ["Hari Syahputra", "Irwansyah"] },
  { jabatan: "Ketua", nama: ["Riyanto"] },
  { jabatan: "Wakil Ketua", nama: ["Khairul"] },
  { jabatan: "Sekretaris", nama: ["Dani"] },
  { jabatan: "Bendahara", nama: ["Susilawati"] },
  { jabatan: "Pelatih", nama: ["Panji", "Iqbal", "Ghalib"] },
  { jabatan: "Admin", nama: ["Ita Novita", "Ella"] },
  {
    jabatan: "Humas",
    nama: ["Frengki", "Reniramadani", "Hafis", "Gunawan"],
  },
  {
    jabatan: "Perlengkapan",
    nama: ["Wulan", "Bapak Andre", "Bapak Fiji", "Mamak Sastra", "Mamak Adam"],
  },
];

export default function Pengurus() {
  return (
    <section id="pengurus" className="relative bg-coal py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mb-14 max-w-2xl">
          <p className="tag-label mb-5">Kepengurusan</p>
          <h2 className="font-display text-4xl uppercase leading-tight text-bone sm:text-5xl">
            Susunan Pengurus
          </h2>
          <p className="mt-4 font-body text-base text-bone/60">
            Tim di balik layar yang menjaga roda kegiatan SSB Sampali Putra
            terus berjalan.
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {susunan.map((p, i) => (
            <Reveal key={p.jabatan} delay={i * 60}>
              <AnimatedCard>
                <div className="flex items-center gap-3">
                  <span className="inline-block h-2 w-2 rounded-full bg-pitch animate-glow" />
                  <h3 className="font-body text-xs font-bold uppercase tracking-widest text-gold">
                    {p.jabatan}
                  </h3>
                </div>
                <ul className="mt-4 space-y-1.5">
                  {p.nama.map((n, ni) => (
                    <li
                      key={n}
                      style={{ transitionDelay: `${ni * 40}ms` }}
                      className="font-display text-lg uppercase tracking-wide text-bone transition-all duration-300 group-hover:translate-x-1 group-hover:text-pitch"
                    >
                      {n}
                    </li>
                  ))}
                </ul>
              </AnimatedCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

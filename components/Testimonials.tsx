import Reveal from "./Reveal";
import SanityImage from "./SanityImage";

type Testimonial = {
  _id?: string;
  nama?: string;
  peran?: string;
  pesan?: string;
  foto?: import("sanity").Image;
};

const defaultTestimonials: Testimonial[] = [
  {
    _id: "1",
    nama: "Ibu Sari",
    peran: "Orang Tua Siswa U-10",
    pesan:
      "Anak saya jadi lebih disiplin dan percaya diri sejak ikut SSB Sampali Putra. Pelatihnya sabar dan telaten membimbing anak-anak.",
  },
  {
    _id: "2",
    nama: "Pak Hendra",
    peran: "Orang Tua Siswa U-13",
    pesan:
      "Program latihannya jelas dan terarah. Perkembangan teknik anak saya terlihat nyata dalam beberapa bulan saja.",
  },
  {
    _id: "3",
    nama: "Rafi",
    peran: "Alumni, kini di Akademi Klub",
    pesan:
      "Dari sini saya belajar dasar yang kuat. Berkat bimbingan coach, saya lolos seleksi akademi klub profesional.",
  },
];

export default function Testimonials({
  testimonials,
}: {
  testimonials?: Testimonial[];
}) {
  const list =
    testimonials && testimonials.length > 0
      ? testimonials
      : defaultTestimonials;

  return (
    <section className="relative bg-coal py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mb-14 max-w-2xl">
          <p className="tag-label mb-5">Testimoni</p>
          <h2 className="font-display text-4xl uppercase leading-tight text-bone sm:text-5xl">
            Kata Mereka
          </h2>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-3">
          {list.map((t, i) => (
            <Reveal key={t._id || i} delay={i * 100}>
              <figure className="card-edge flex h-full flex-col p-8">
                <span className="font-display text-6xl leading-none text-pitch/30">
                  &ldquo;
                </span>
                <blockquote className="-mt-4 flex-1 text-base leading-relaxed text-bone/80">
                  {t.pesan}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-4 border-t border-bone/10 pt-6">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-ink">
                    <SanityImage
                      image={t.foto}
                      alt={t.nama || "Testimoni"}
                      width={100}
                      height={100}
                      className="h-full w-full object-cover"
                      fallbackLabel=""
                    />
                  </div>
                  <div>
                    <div className="font-display text-base uppercase tracking-wide text-bone">
                      {t.nama}
                    </div>
                    <div className="font-body text-xs font-semibold uppercase tracking-widest text-gold">
                      {t.peran}
                    </div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

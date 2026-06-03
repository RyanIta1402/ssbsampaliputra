import SanityImage from "./SanityImage";
import Reveal from "./Reveal";

type Hadiah = { juara?: string; hadiah?: string };
type PengumumanData = {
  judul?: string;
  kategori?: string;
  deskripsiSingkat?: string;
  poster?: import("sanity").Image;
  tanggal?: string;
  hari?: string;
  lokasi?: string;
  format?: string;
  persyaratan?: string[];
  biayaPendaftaran?: string;
  hadiah?: Hadiah[];
  kontak?: string;
  teksTombolUtama?: string;
  linkTombol?: string;
};

const defaults: PengumumanData = {
  judul: "Trophy Wali Kota Medan 20th Anniversary",
  kategori: "Sepakbola Anak Usia Dini U11 - Kelahiran 2015/2016",
  deskripsiSingkat:
    "Buruan daftar! Memperebutkan Trophy Wali Kota Medan dalam rangka 20th Anniversary. Pesta liburan anak sekolah - bawa data pemain.",
  tanggal: "27 - 28 Juni 2026",
  hari: "Sabtu - Minggu",
  lokasi: "SSB Patriot Medan, Jln. Air Bersih Medan Kota",
  format: 'Format 8 vs 8 • 12 Pemain • Durasi 2 x 10"',
  persyaratan: ["Raport", "Kartu Keluarga", "Akte Kelahiran"],
  biayaPendaftaran: "350K",
  hadiah: [
    { juara: "Juara 1", hadiah: "Trophy + Medali + Rp 2.000.000" },
    { juara: "Juara 2", hadiah: "Trophy + Medali + Rp 1.500.000" },
    { juara: "Juara 3", hadiah: "Trophy + Medali + Rp 800.000" },
    { juara: "Juara 4", hadiah: "Trophy + Medali + Rp 500.000" },
  ],
  kontak: "081375284462",
  teksTombolUtama: "Daftar via WhatsApp",
};

function waLink(phone?: string, pesan?: string) {
  if (!phone) return "#";
  const clean = phone.replace(/[^0-9]/g, "");
  const num = clean.startsWith("0") ? "62" + clean.slice(1) : clean;
  const text = encodeURIComponent(pesan || "Halo, saya ingin mendaftar event.");
  return `https://wa.me/${num}?text=${text}`;
}

export default function Pengumuman({ data }: { data?: PengumumanData }) {
  const d = { ...defaults, ...(data || {}) };
  const ctaHref =
    d.linkTombol ||
    waLink(
      d.kontak,
      `Halo, saya ingin mendaftarkan tim untuk ${d.judul}.`,
    );

  return (
    <section
      id="event"
      className="relative overflow-hidden bg-ink py-20 lg:py-28"
    >
      {/* Aurora / mesh gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full bg-pitch/20 blur-[120px] animate-glow" />
        <div className="absolute -right-20 bottom-0 h-[24rem] w-[24rem] rounded-full bg-gold/20 blur-[120px] animate-glow [animation-delay:1.2s]" />
        <div className="absolute left-1/2 top-1/2 h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pitch/10 blur-[100px]" />
        <div className="absolute inset-0 bg-grid-faint [background-size:48px_48px] opacity-30" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        {/* Header */}
        <Reveal className="mb-12 lg:mb-16">
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-pitch/40 bg-pitch/10 px-4 py-1.5 font-body text-xs font-bold uppercase tracking-[0.25em] text-pitch backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pitch opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-pitch" />
                </span>
                Pendaftaran Dibuka
              </span>

              <h2 className="mt-5 font-display text-4xl uppercase leading-[1.05] text-bone sm:text-5xl lg:text-6xl">
                Event{" "}
                <span className="bg-gradient-to-r from-pitch via-pitch to-gold bg-clip-text text-transparent">
                  Terbaru
                </span>
              </h2>
              <p className="mt-4 max-w-xl font-body text-base leading-relaxed text-bone/60">
                Ikuti kompetisi sepak bola usia dini bergengsi dan rasakan
                pengalaman bertanding di event resmi.
              </p>
            </div>

            <div className="hidden lg:block">
              <div className="text-right">
                <div className="font-display text-xs uppercase tracking-[0.3em] text-bone/40">
                  Biaya Registrasi
                </div>
                <div className="mt-1 font-display text-5xl text-gold">
                  {d.biayaPendaftaran}
                </div>
                <div className="font-body text-xs uppercase tracking-widest text-bone/50">
                  Per Team
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Bento Grid */}
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Poster */}
          <Reveal className="lg:col-span-5">
            <div className="group relative h-full overflow-hidden rounded-3xl border border-bone/10 bg-coal p-1.5">
              {/* Animated conic glow border */}
              <div className="pointer-events-none absolute -inset-px overflow-hidden rounded-3xl">
                <div className="absolute -inset-1/2 animate-conic bg-[conic-gradient(from_0deg,transparent_0deg,#16f04a_60deg,transparent_140deg,#f5c542_220deg,transparent_300deg)] opacity-50" />
              </div>

              <div className="relative h-full overflow-hidden rounded-[1.3rem] bg-ink">
                <SanityImage
                  image={d.poster}
                  alt={d.judul || "Poster event"}
                  width={900}
                  height={1200}
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  fallbackLabel="Poster Event"
                />
                {/* Floating badge */}
                <div className="absolute left-4 top-4 animate-float">
                  <div className="flex items-center gap-2 rounded-full bg-gold/95 px-3 py-1.5 font-body text-[10px] font-black uppercase tracking-widest text-ink shadow-[0_8px_30px_-5px_rgba(245,197,66,0.6)]">
                    Memperebutkan Trophy
                  </div>
                </div>
                {/* Bottom gradient + title overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/80 to-transparent p-5 pt-16">
                  <div className="font-display text-xs uppercase tracking-[0.25em] text-pitch">
                    {d.kategori}
                  </div>
                  <div className="mt-1 font-display text-xl uppercase leading-tight text-bone sm:text-2xl">
                    {d.judul}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Info area */}
          <div className="grid gap-5 lg:col-span-7 lg:grid-cols-6">
            {/* Tanggal */}
            <Reveal delay={80} className="lg:col-span-3">
              <InfoCard
                icon={<IconCalendar />}
                label={d.hari || "Hari"}
                value={d.tanggal || "—"}
                accent="pitch"
              />
            </Reveal>

            {/* Lokasi */}
            <Reveal delay={120} className="lg:col-span-3">
              <InfoCard
                icon={<IconPin />}
                label="Lokasi"
                value={d.lokasi || "—"}
                accent="gold"
              />
            </Reveal>

            {/* Format */}
            <Reveal delay={160} className="lg:col-span-6">
              <InfoCard
                icon={<IconWhistle />}
                label="Format Pertandingan"
                value={d.format || "—"}
                accent="bone"
              />
            </Reveal>

            {/* Reward list */}
            <Reveal delay={200} className="lg:col-span-6">
              <div className="relative h-full overflow-hidden rounded-2xl border border-bone/10 bg-coal/70 p-6 backdrop-blur-xl transition-colors hover:border-pitch/40 lg:p-7">
                <div className="absolute right-0 top-0 h-32 w-32 -translate-y-10 translate-x-10 rounded-full bg-gold/20 blur-3xl" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gold/15 text-gold">
                        <IconTrophy />
                      </span>
                      <div>
                        <div className="font-display text-xs uppercase tracking-[0.25em] text-bone/40">
                          Hadiah
                        </div>
                        <div className="font-display text-lg uppercase tracking-wide text-bone">
                          Total Reward
                        </div>
                      </div>
                    </div>
                    <span className="hidden rounded-full border border-gold/30 bg-gold/10 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-widest text-gold sm:inline-block">
                      Cash Prize
                    </span>
                  </div>

                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {(d.hadiah || []).map((h, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 rounded-xl border border-bone/5 bg-ink/50 p-3 transition-colors hover:border-gold/30"
                      >
                        <span
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg font-display text-sm font-black ${
                            i === 0
                              ? "bg-gold text-ink"
                              : i === 1
                                ? "bg-bone/80 text-ink"
                                : i === 2
                                  ? "bg-[#cd7f32]/80 text-ink"
                                  : "bg-bone/10 text-bone"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <div>
                          <div className="font-body text-xs uppercase tracking-widest text-bone/40">
                            {h.juara}
                          </div>
                          <div className="font-body text-sm font-semibold text-bone">
                            {h.hadiah}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>

            {/* Persyaratan + Biaya Mobile */}
            <Reveal delay={240} className="lg:col-span-3">
              <div className="relative h-full overflow-hidden rounded-2xl border border-bone/10 bg-coal/70 p-6 backdrop-blur-xl transition-colors hover:border-pitch/40">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-pitch/15 text-pitch">
                    <IconCheck />
                  </span>
                  <div className="font-display text-xs uppercase tracking-[0.25em] text-bone/40">
                    Persyaratan
                  </div>
                </div>
                <ul className="mt-4 space-y-2">
                  {(d.persyaratan || []).map((p, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 font-body text-sm text-bone"
                    >
                      <span className="h-1.5 w-1.5 rotate-45 bg-pitch" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* CTA */}
            <Reveal delay={280} className="lg:col-span-3">
              <div className="group relative h-full overflow-hidden rounded-2xl border border-pitch/40 bg-gradient-to-br from-pitch/20 via-coal to-coal p-6 transition-all hover:border-pitch hover:shadow-[0_20px_60px_-15px_rgba(22,240,74,0.5)]">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-pitch/30 blur-3xl transition-all group-hover:bg-pitch/50" />
                <div className="relative flex h-full flex-col justify-between">
                  <div>
                    <div className="font-display text-xs uppercase tracking-[0.25em] text-pitch">
                      Registrasi Tim
                    </div>
                    <div className="mt-2 font-display text-3xl text-bone lg:text-4xl">
                      {d.biayaPendaftaran}
                      <span className="ml-2 text-sm font-normal text-bone/50">
                        /tim
                      </span>
                    </div>
                    <div className="mt-1 font-body text-xs text-bone/50">
                      Hubungi: {d.kontak}
                    </div>
                  </div>
                  <a
                    href={ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-pitch px-5 py-3 font-body text-sm font-bold uppercase tracking-widest text-ink transition-all hover:bg-gold"
                  >
                    <IconWhatsApp />
                    {d.teksTombolUtama || "Daftar Sekarang"}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Sub-components ---------- */

function InfoCard({
  icon,
  label,
  value,
  accent = "pitch",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: "pitch" | "gold" | "bone";
}) {
  const accentMap = {
    pitch: "bg-pitch/15 text-pitch",
    gold: "bg-gold/15 text-gold",
    bone: "bg-bone/10 text-bone",
  } as const;

  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-bone/10 bg-coal/70 p-6 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-pitch/40">
      <div className="flex items-start gap-4">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${accentMap[accent]}`}>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-xs uppercase tracking-[0.25em] text-bone/40">
            {label}
          </div>
          <div className="mt-1 font-body text-base font-semibold leading-snug text-bone">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Icons (inline SVG, no library) ---------- */

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function IconPin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconWhistle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="14" r="6" />
      <path d="M15 11l7-4-2 6" />
    </svg>
  );
}
function IconTrophy() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V4h12v5a6 6 0 0 1-12 0Z" />
      <path d="M4 6H2a2 2 0 0 0 2 4M20 6h2a2 2 0 0 1-2 4" />
      <path d="M10 21h4M12 17v4" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
function IconWhatsApp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5 3.5A11 11 0 0 0 3.6 17l-1.5 5.5 5.6-1.5A11 11 0 1 0 20.5 3.5Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-3.3.9.9-3.2-.2-.3A9 9 0 1 1 12 20.5Zm5-6.7c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1l-.8 1c-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.5-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5-.1-.1-.6-1.5-.9-2-.2-.5-.5-.5-.6-.5h-.6c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 1.8.7 2.5.8 3.4.7.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.1-.6-.3Z" />
    </svg>
  );
}

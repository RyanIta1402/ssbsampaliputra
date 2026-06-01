import Reveal from "./Reveal";

export default function Motto() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 lg:py-32">
      {/* Latar grid halus + glow */}
      <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:48px_48px] opacity-30" />
      <div className="pointer-events-none absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-pitch/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="tag-label mb-6">Motto Klub</p>

          <h2 className="font-display uppercase leading-[0.95] tracking-tight text-bone">
            <span className="block text-4xl text-bone/70 sm:text-6xl lg:text-7xl">
              Siapa Kita?
            </span>
            <span className="mt-3 block text-5xl text-pitch sm:text-7xl lg:text-8xl">
              Sampali Putra!
            </span>
          </h2>

          <p className="mx-auto mt-8 max-w-xl font-body text-base leading-relaxed text-bone/60 sm:text-lg">
            Semangat, kebanggaan, dan persaudaraan yang kami suarakan di setiap
            latihan dan pertandingan.
          </p>
        </Reveal>
      </div>

      {/* Garis aksen atas dan bawah */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pitch/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-pitch/40 to-transparent" />
    </section>
  );
}

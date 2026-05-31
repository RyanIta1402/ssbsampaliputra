const items = [
  "Disiplin",
  "Sportivitas",
  "Teknik Dasar",
  "Kerja Sama Tim",
  "Mental Juara",
  "Kebugaran",
  "Strategi",
  "Pembinaan Usia Dini",
];

export default function Marquee() {
  const loop = [...items, ...items];
  return (
    <div className="border-y border-bone/10 bg-pitch py-4">
      <div className="flex overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {loop.map((it, i) => (
            <span
              key={i}
              className="mx-6 flex items-center gap-6 font-display text-xl uppercase tracking-wide text-ink"
            >
              {it}
              <span className="text-ink/40">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

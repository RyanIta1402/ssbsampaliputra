const MAP: Record<string, { label: string; cls: string }> = {
  baru: { label: "Baru", cls: "bg-gold/15 text-gold border-gold/30" },
  dihubungi: {
    label: "Dihubungi",
    cls: "bg-bone/10 text-bone border-bone/25",
  },
  diterima: {
    label: "Diterima",
    cls: "bg-pitch/15 text-pitch border-pitch/40",
  },
  ditolak: {
    label: "Ditolak",
    cls: "bg-red-500/15 text-red-400 border-red-500/30",
  },
};

export default function StatusBadge({ status }: { status: string }) {
  const s =
    MAP[status] ?? {
      label: status,
      cls: "bg-bone/10 text-bone border-bone/25",
    };
  return (
    <span
      className={`inline-flex items-center border px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

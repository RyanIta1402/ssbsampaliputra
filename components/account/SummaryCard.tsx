import type { ReactNode } from "react";

/**
 * Kartu ringkasan angka untuk halaman laporan (mis. Total Masuk, Saldo
 * Akhir). Presentasional murni — aman dipakai di server component.
 */
export default function SummaryCard({
  label,
  value,
  tone = "text-bone",
  hint,
}: {
  label: string;
  value: ReactNode;
  tone?: string;
  hint?: string;
}) {
  return (
    <div className="border border-bone/10 bg-coal/40 p-5">
      <p className="font-body text-[11px] font-bold uppercase tracking-widest text-bone/40">
        {label}
      </p>
      <p className={`mt-2 font-display text-2xl ${tone}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-bone/40">{hint}</p>}
    </div>
  );
}

"use client";

/**
 * Tombol "Report" seragam untuk semua modul: membuka jendela laporan
 * bertema terang & rapi (judul, tanggal cetak, tabel, ringkasan opsional)
 * lalu memicu dialog cetak browser — pengguna memilih "Save as PDF".
 *
 * Tanpa dependency (memakai window.print). Bila kelak ingin unduh .pdf
 * langsung, cukup ganti isi handler di komponen ini — pemakaian di tiap
 * grid tidak berubah.
 */

export type ReportColumn<T> = {
  header: string;
  value: (row: T) => string;
  /** Rata kanan untuk kolom angka/uang. */
  align?: "right";
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function DocIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  );
}

const REPORT_CSS = `
* { box-sizing: border-box; }
body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #111; margin: 24px; }
.doc-head { border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 16px; }
.brand { font-size: 11px; letter-spacing: 2px; font-weight: 700; color: #15a34a; }
h1 { font-size: 22px; margin: 4px 0 2px; text-transform: uppercase; }
.sub { margin: 2px 0; color: #444; font-size: 13px; }
.meta { margin: 4px 0 0; color: #666; font-size: 11px; }
.summary { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.summary > div { border: 1px solid #ddd; padding: 8px 14px; min-width: 150px; }
.summary span { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #666; }
.summary strong { font-size: 16px; }
table { width: 100%; border-collapse: collapse; font-size: 12px; }
th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: top; }
td.r, th.r { text-align: right; white-space: nowrap; }
thead th { background: #f3f4f6; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
tbody tr:nth-child(even) { background: #fafafa; }
.empty { text-align: center; color: #888; padding: 24px; }
.doc-foot { margin-top: 16px; padding-top: 8px; border-top: 1px solid #ddd; font-size: 10px; color: #888; text-align: center; }
.toolbar { margin-bottom: 16px; }
.toolbar button { font: inherit; cursor: pointer; border: 1px solid #111; background: #111; color: #fff; padding: 9px 18px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
.toolbar button:hover { background: #15a34a; border-color: #15a34a; }
.toolbar .hint { margin-left: 12px; color: #666; font-size: 11px; }
@page { margin: 14mm; }
@media print { body { margin: 0; } thead { display: table-header-group; } .toolbar { display: none !important; } }
`;

function buildHtml<T>(
  title: string,
  subtitle: string | undefined,
  columns: ReportColumn<T>[],
  rows: T[],
  summary?: { label: string; value: string }[]
): string {
  const now = new Date().toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  });
  const thead = columns
    .map((c) => `<th class="${c.align === "right" ? "r" : ""}">${esc(c.header)}</th>`)
    .join("");
  const tbody = rows.length
    ? rows
        .map(
          (row) =>
            `<tr>${columns
              .map(
                (c) =>
                  `<td class="${c.align === "right" ? "r" : ""}">${esc(
                    c.value(row)
                  )}</td>`
              )
              .join("")}</tr>`
        )
        .join("")
    : `<tr><td class="empty" colspan="${columns.length}">Tidak ada data.</td></tr>`;
  const summaryHtml =
    summary && summary.length
      ? `<div class="summary">${summary
          .map(
            (s) =>
              `<div><span>${esc(s.label)}</span><strong>${esc(
                s.value
              )}</strong></div>`
          )
          .join("")}</div>`
      : "";

  return `<!DOCTYPE html><html lang="id"><head><meta charset="utf-8">
<title>${esc(title)}</title><style>${REPORT_CSS}</style></head><body>
<div class="toolbar">
  <button type="button" onclick="window.print()">Cetak / Simpan PDF</button>
  <span class="hint">Tinjau dulu, lalu tekan untuk mencetak atau menyimpan sebagai PDF.</span>
</div>
<header class="doc-head">
  <div class="brand">SSB SAMPALI PUTRA</div>
  <h1>${esc(title)}</h1>
  ${subtitle ? `<p class="sub">${esc(subtitle)}</p>` : ""}
  <p class="meta">Dicetak: ${esc(now)} &middot; ${rows.length} baris</p>
</header>
${summaryHtml}
<table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>
<footer class="doc-foot">SSB Sampali Putra &mdash; Laporan dibuat otomatis dari sistem</footer>
</body></html>`;
}

export default function ReportButton<T>({
  title,
  columns,
  rows,
  subtitle,
  summary,
  label = "Report",
}: {
  title: string;
  columns: ReportColumn<T>[];
  rows: T[];
  subtitle?: string;
  summary?: { label: string; value: string }[];
  label?: string;
}) {
  const handleClick = () => {
    const html = buildHtml(title, subtitle, columns, rows, summary);
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) {
      alert("Popup diblokir browser. Izinkan popup untuk membuat laporan PDF.");
      return;
    }
    w.document.write(html);
    w.document.close();
    w.focus();
    // Tidak auto-cetak: jendela hanya menampilkan pratinjau laporan. Pengguna
    // meninjau dulu lalu menekan tombol "Cetak / Simpan PDF" saat siap.
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Buat laporan PDF"
      className="inline-flex items-center gap-2 border border-bone/20 px-4 py-2.5 font-body text-xs font-bold uppercase tracking-widest text-bone/80 transition-colors hover:border-pitch hover:text-pitch"
    >
      <DocIcon /> {label}
    </button>
  );
}

"use client";

import { useMemo, useState } from "react";

import DataGrid, { type Column } from "@/components/account/DataGrid";
import ReportButton, { type ReportColumn } from "@/components/account/ReportButton";
import SummaryCard from "@/components/account/SummaryCard";
import { formatRupiah } from "@/lib/format";

/**
 * Baris rekap SPP per SISWA per tahun — bersumber dari view
 * `v_rekap_spp_siswa` (satu baris per siswa untuk tiap tahun, tiap bulan
 * sebagai kolom + total). Nilai bulan/total dikembalikan driver Neon sebagai
 * string (numeric).
 */
type MonthKey =
  | "januari"
  | "februari"
  | "maret"
  | "april"
  | "mei"
  | "juni"
  | "juli"
  | "agustus"
  | "september"
  | "oktober"
  | "november"
  | "desember";

export type RekapSppSiswaRow = {
  tahun: number;
  siswa_id: string;
  nis: string | null;
  nama: string;
  total: string | null;
} & { [K in MonthKey]: string | null };

const BULAN: { key: MonthKey; label: string }[] = [
  { key: "januari", label: "Jan" },
  { key: "februari", label: "Feb" },
  { key: "maret", label: "Mar" },
  { key: "april", label: "Apr" },
  { key: "mei", label: "Mei" },
  { key: "juni", label: "Jun" },
  { key: "juli", label: "Jul" },
  { key: "agustus", label: "Agu" },
  { key: "september", label: "Sep" },
  { key: "oktober", label: "Okt" },
  { key: "november", label: "Nov" },
  { key: "desember", label: "Des" },
];

const REPORT_COLUMNS: ReportColumn<RekapSppSiswaRow>[] = [
  { header: "NIS", value: (r) => r.nis || "-" },
  { header: "Nama Siswa", value: (r) => r.nama },
  ...BULAN.map<ReportColumn<RekapSppSiswaRow>>((b) => ({
    header: b.label,
    value: (r) => {
      const n = Number(r[b.key] ?? 0);
      return n ? n.toLocaleString("id-ID") : "-";
    },
    align: "right",
  })),
  { header: "Total", value: (r) => formatRupiah(r.total), align: "right" },
];

/**
 * Grid laporan rekap SPP per siswa (read-only). Pengguna memilih tahun lebih
 * dulu (default: tahun terbaru), lalu tabel menampilkan tiap siswa dengan
 * kolom NIS, Nama, Jan–Des (total iuran bulan itu, 0 → "—"), dan Total.
 */
export default function LaporanSppGrid({
  rows,
}: {
  rows: RekapSppSiswaRow[];
}) {
  // Daftar tahun yang tersedia dari data (urut terbaru dulu).
  const years = useMemo(
    () => Array.from(new Set(rows.map((r) => r.tahun))).sort((a, b) => b - a),
    [rows]
  );
  // Tahun terpilih — default ke tahun terbaru.
  const [tahun, setTahun] = useState<number | null>(years[0] ?? null);
  // Jaga-jaga bila data berubah & tahun terpilih tak ada lagi.
  const activeTahun =
    tahun != null && years.includes(tahun) ? tahun : years[0] ?? null;

  // Baris untuk tahun terpilih saja.
  const rowsTahun = useMemo(
    () =>
      activeTahun == null ? [] : rows.filter((r) => r.tahun === activeTahun),
    [rows, activeTahun]
  );
  const totalTahun = rowsTahun.reduce((s, r) => s + Number(r.total ?? 0), 0);

  const columns: Column<RekapSppSiswaRow>[] = [
    {
      key: "nis",
      header: "NIS",
      sortValue: (r) => r.nis ?? "",
      render: (r) => (
        <span className="font-mono text-bone/70">{r.nis || "—"}</span>
      ),
    },
    {
      key: "nama",
      header: "Nama Siswa",
      sortValue: (r) => r.nama,
      render: (r) => <span className="font-semibold text-bone">{r.nama}</span>,
    },
    ...BULAN.map<Column<RekapSppSiswaRow>>((b) => ({
      key: b.key,
      header: b.label,
      headerClassName: "text-right",
      cellClassName: "text-right",
      sortValue: (r) => Number(r[b.key] ?? 0),
      render: (r) => {
        const n = Number(r[b.key] ?? 0);
        return n ? (
          <span className="text-bone/80">{n.toLocaleString("id-ID")}</span>
        ) : (
          <span className="text-bone/20">—</span>
        );
      },
    })),
    {
      key: "total",
      header: "Total",
      headerClassName: "text-right",
      cellClassName: "text-right",
      sortValue: (r) => Number(r.total ?? 0),
      render: (r) => (
        <span className="font-bold text-pitch">{formatRupiah(r.total)}</span>
      ),
    },
  ];

  // Belum ada data sama sekali.
  if (years.length === 0) {
    return (
      <div className="border border-bone/10 bg-coal/40 p-10 text-center text-bone/50">
        <span className="mb-2 block text-2xl" aria-hidden="true">
          ⚽
        </span>
        Belum ada data SPP untuk direkap.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pilihan tahun — menentukan data yang ditampilkan di bawah. */}
      <div className="flex flex-wrap items-center gap-3 border border-bone/10 bg-coal/40 p-4">
        <label
          htmlFor="tahun-spp"
          className="font-body text-[11px] font-bold uppercase tracking-widest text-bone/40"
        >
          Tahun
        </label>
        <select
          id="tahun-spp"
          value={activeTahun ?? ""}
          onChange={(e) => setTahun(Number(e.target.value))}
          className="border border-pitch/50 bg-ink px-4 py-2.5 text-sm font-bold text-pitch outline-none transition-colors focus:border-pitch [color-scheme:dark]"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <span className="text-sm text-bone/50">
          Rekap SPP tahun{" "}
          <strong className="text-bone">{activeTahun}</strong> ({rowsTahun.length}{" "}
          siswa).
        </span>
      </div>

      {/* Ringkasan untuk tahun terpilih. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryCard label="Jumlah Siswa" value={rowsTahun.length} />
        <SummaryCard
          label={`Total SPP ${activeTahun ?? ""}`}
          value={formatRupiah(totalTahun)}
          tone="text-pitch"
        />
      </div>

      {/* Tabel rekap per siswa untuk tahun terpilih. */}
      <DataGrid
        rows={rowsTahun}
        columns={columns}
        getRowId={(r) => r.siswa_id}
        searchText={(r) => [r.nis ?? "", r.nama].join(" ")}
        searchPlaceholder="Cari NIS, nama siswa..."
        emptyText="Belum ada pembayaran SPP di tahun ini."
        minTableWidth="1200px"
        selectable
        action={(filtered) => (
          <ReportButton
            title={`Rekap SPP Siswa ${activeTahun ?? ""}`}
            subtitle="Nilai per bulan dalam Rupiah"
            columns={REPORT_COLUMNS}
            rows={filtered}
            summary={[
              { label: "Jumlah Siswa", value: String(filtered.length) },
              {
                label: `Total SPP ${activeTahun ?? ""}`,
                value: formatRupiah(
                  filtered.reduce((s, r) => s + Number(r.total ?? 0), 0)
                ),
              },
            ]}
          />
        )}
      />
    </div>
  );
}

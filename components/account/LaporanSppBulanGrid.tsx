"use client";

import { useMemo, useState } from "react";

import DataGrid, {
  type Column,
  type SelectFilter,
} from "@/components/account/DataGrid";
import ReportButton, {
  type ReportColumn,
} from "@/components/account/ReportButton";
import SummaryCard from "@/components/account/SummaryCard";
import WhatsAppButton from "@/components/account/WhatsAppButton";
import { bulanInput, bulanLabel } from "@/lib/date";
import { formatDate, formatRupiah } from "@/lib/format";

/**
 * Baris status pembayaran SPP per BULAN per siswa — bersumber dari view
 * `view_status_pembayaran_spp`, tapi sudah DIKONSOLIDASI di query halaman
 * menjadi satu baris per siswa-bulan (lihat app/laporan/spp-perbulan/page.tsx).
 * Bila siswa membayar >1 kali dalam bulan yang sama: `jumlah_bayar` = TOTAL
 * semua pembayaran dan `tanggal_bayar` = tanggal TERBARU. `status_pembayaran`
 * bernilai 'Sudah Bayar' atau 'Belum Bayar'. Driver Neon mengembalikan kolom
 * date sebagai objek Date.
 */
export type StatusSppRow = {
  siswa_id?: string;
  nama_lengkap: string;
  kelas: string | null;
  bulan_tagihan: string | Date;
  status_pembayaran: string; // 'Sudah Bayar' | 'Belum Bayar'
  tanggal_bayar: string | Date | null; // tanggal bayar terbaru bulan itu
  jumlah_bayar: string | number | null; // total iuran dibayar bulan itu
};

const SUDAH = "Sudah Bayar";
const BELUM = "Belum Bayar";

// Baris dengan kunci unik (nama bisa sama, jadi pakai indeks per bulan).
type Row = StatusSppRow & { _key: string };

/**
 * Susun isi pesan WhatsApp dari baris laporan (mengikuti hasil filter grid):
 * judul bulan berhias ikon dan garis pemisah, lalu daftar siswa bernomor
 * dengan nominal, status, dan tanggal bayar. Format *tebal* serta emoji
 * dikenali WhatsApp.
 */
function buildWaText(activeLabel: string, rows: Row[]): string {
  const divider = "━━━━━━━━━━━━━━━━";
  const lines = [
    `⚽ *STATUS PEMBAYARAN SPP ${activeLabel.toUpperCase()}*`,
    "🏆 _SSB Sampali Putra_",
    divider,
    "",
  ];
  if (rows.length === 0) {
    lines.push("🚫 Tidak ada data.");
  } else {
    rows.forEach((r, i) => {
      const nominal = Number(r.jumlah_bayar) || 0;
      const info = nominal > 0 ? ` — 💰 ${formatRupiah(nominal)}` : "";
      const status =
        r.status_pembayaran === SUDAH
          ? `✅ Sudah Bayar${r.tanggal_bayar ? ` 📅 ${formatDate(r.tanggal_bayar)}` : ""}`
          : "❌ Belum Bayar";
      lines.push(`${i + 1}. *${r.nama_lengkap}*${info}`);
      lines.push(`   ${status}`);
    });
  }
  lines.push("", divider);
  return lines.join("\n");
}

const REPORT_COLUMNS: ReportColumn<Row>[] = [
  { header: "Nama Siswa", value: (r) => r.nama_lengkap },
  {
    header: "Nominal",
    value: (r) => {
      const n = Number(r.jumlah_bayar) || 0;
      return n > 0 ? formatRupiah(n) : "-";
    },
  },
  { header: "Status", value: (r) => r.status_pembayaran },
  {
    header: "Tgl Bayar",
    value: (r) => (r.tanggal_bayar ? formatDate(r.tanggal_bayar) : "-"),
  },
];

/**
 * Grid laporan status pembayaran SPP per bulan (read-only). Pengguna memilih
 * bulan lebih dulu (default: bulan terbaru), lalu tabel menampilkan tiap siswa
 * aktif beserta status pembayaran (Belum Bayar / Sudah Bayar), nominal, dan
 * tanggal bayar. Filter status tersedia via dropdown grid, dan hasilnya bisa
 * dicetak lewat tombol Report seperti laporan SPP.
 */
export default function LaporanSppBulanGrid({
  rows,
}: {
  rows: StatusSppRow[];
}) {
  // Bulan tersedia dari data (unik, urut terbaru dulu). Key = "yyyy-mm".
  const months = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rows) {
      const key = bulanInput(r.bulan_tagihan); // "yyyy-mm"
      if (key && !map.has(key)) map.set(key, bulanLabel(r.bulan_tagihan));
    }
    return Array.from(map, ([key, label]) => ({ key, label })).sort((a, b) =>
      b.key.localeCompare(a.key)
    );
  }, [rows]);

  // Bulan terpilih — default ke bulan terbaru.
  const [bulan, setBulan] = useState<string | null>(months[0]?.key ?? null);
  // Jaga-jaga bila data berubah & bulan terpilih tak ada lagi.
  const activeBulan =
    bulan != null && months.some((m) => m.key === bulan)
      ? bulan
      : months[0]?.key ?? null;

  // Status terpilih — null = tampilkan semua (tidak ada filter).
  const [status, setStatus] = useState<string | null>(null);

  // Baris untuk bulan terpilih saja, diberi kunci unik.
  const rowsBulan = useMemo<Row[]>(
    () => {
      let filtered =
        activeBulan == null
          ? []
          : rows
              .filter((r) => bulanInput(r.bulan_tagihan) === activeBulan)
              .map((r, i) => ({ ...r, _key: `${activeBulan}-${r.siswa_id ?? i}` }));

      // Tambahkan filter status jika ada yang dipilih.
      if (status != null) {
        filtered = filtered.filter((r) => r.status_pembayaran === status);
      }

      return filtered;
    },
    [rows, activeBulan, status]
  );

  // Baris untuk bulan terpilih tanpa filter status (untuk summary).
  const rowsBulanAll = useMemo<Row[]>(
    () =>
      activeBulan == null
        ? []
        : rows
            .filter((r) => bulanInput(r.bulan_tagihan) === activeBulan)
            .map((r, i) => ({ ...r, _key: `${activeBulan}-${r.siswa_id ?? i}` })),
    [rows, activeBulan]
  );

  const sudah = rowsBulanAll.filter(
    (r) => r.status_pembayaran === SUDAH
  ).length;
  const belum = rowsBulanAll.length - sudah;
  const activeLabel = months.find((m) => m.key === activeBulan)?.label ?? "";

  const columns: Column<Row>[] = [
    {
      key: "nama",
      header: "Nama Siswa",
      sortValue: (r) => r.nama_lengkap,
      render: (r) => (
        <span className="font-semibold text-bone">{r.nama_lengkap}</span>
      ),
    },
    {
      key: "nominal",
      header: "Nominal",
      sortValue: (r) => Number(r.jumlah_bayar) || 0,
      render: (r) => {
        const n = Number(r.jumlah_bayar) || 0;
        return n > 0 ? (
          <span className="font-semibold text-bone/90">{formatRupiah(n)}</span>
        ) : (
          <span className="text-bone/20">—</span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      sortValue: (r) => r.status_pembayaran,
      render: (r) =>
        r.status_pembayaran === SUDAH ? (
          <span className="inline-flex items-center border border-pitch/40 bg-pitch/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-pitch">
            Sudah Bayar
          </span>
        ) : (
          <span className="inline-flex items-center border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-red-400">
            Belum Bayar
          </span>
        ),
    },
    {
      key: "tglbayar",
      header: "Tgl Bayar",
      sortValue: (r) =>
        r.tanggal_bayar ? new Date(r.tanggal_bayar).getTime() : 0,
      render: (r) =>
        r.tanggal_bayar ? (
          <span className="text-bone/70">{formatDate(r.tanggal_bayar)}</span>
        ) : (
          <span className="text-bone/20">—</span>
        ),
    },
  ];

  const filters: SelectFilter<Row>[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: BELUM, label: "Belum Bayar" },
        { value: SUDAH, label: "Sudah Bayar" },
      ],
      match: (r, v) => r.status_pembayaran === v,
    },
  ];

  // Belum ada data sama sekali.
  if (months.length === 0) {
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
      {/* Pilihan bulan — menentukan data yang ditampilkan di bawah. */}
      <div className="flex flex-wrap items-center gap-3 border border-bone/10 bg-coal/40 p-4">
        <label
          htmlFor="bulan-spp"
          className="font-body text-[11px] font-bold uppercase tracking-widest text-bone/40"
        >
          Bulan
        </label>
        <select
          id="bulan-spp"
          value={activeBulan ?? ""}
          onChange={(e) => setBulan(e.target.value)}
          className="border border-pitch/50 bg-ink px-4 py-2.5 text-sm font-bold text-pitch outline-none transition-colors focus:border-pitch [color-scheme:dark]"
        >
          {months.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
        <span className="text-sm text-bone/50">
          Status pembayaran SPP{" "}
          <strong className="text-bone">{activeLabel}</strong> (
          {rowsBulan.length} siswa).
        </span>
      </div>

      {/* Pilihan status — filter data tabel. */}
      <div className="flex flex-wrap items-center gap-3 border border-bone/10 bg-coal/40 p-4">
        <label
          htmlFor="status-spp"
          className="font-body text-[11px] font-bold uppercase tracking-widest text-bone/40"
        >
          Status
        </label>
        <select
          id="status-spp"
          value={status ?? ""}
          onChange={(e) => setStatus(e.target.value || null)}
          className="border border-pitch/50 bg-ink px-4 py-2.5 text-sm font-bold text-pitch outline-none transition-colors focus:border-pitch [color-scheme:dark]"
        >
          <option value="">Semua</option>
          <option value={SUDAH}>Sudah Bayar</option>
          <option value={BELUM}>Belum Bayar</option>
        </select>
      </div>

      {/* Ringkasan untuk bulan terpilih. */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Jumlah Siswa" value={rowsBulanAll.length} />
        <SummaryCard label="Sudah Bayar" value={sudah} tone="text-pitch" />
        <SummaryCard label="Belum Bayar" value={belum} tone="text-red-400" />
      </div>

      {/* Tabel status pembayaran per siswa untuk bulan terpilih. */}
      <DataGrid
        rows={rowsBulan}
        columns={columns}
        getRowId={(r) => r._key}
        searchText={(r) => r.nama_lengkap}
        searchPlaceholder="Cari nama siswa..."
        filters={filters}
        emptyText="Belum ada data siswa untuk bulan ini."
        minTableWidth="640px"
        selectable
        action={(filtered) => (
          <div className="flex flex-wrap items-center gap-2">
            <WhatsAppButton text={buildWaText(activeLabel, filtered)} />
            <ReportButton
              title={`Status Pembayaran SPP ${activeLabel}`}
              subtitle="Status pembayaran SPP per siswa"
              columns={REPORT_COLUMNS}
              rows={filtered}
              summary={[
                { label: "Jumlah Siswa", value: String(filtered.length) },
                {
                  label: "Sudah Bayar",
                  value: String(
                    filtered.filter((r) => r.status_pembayaran === SUDAH).length
                  ),
                },
                {
                  label: "Belum Bayar",
                  value: String(
                    filtered.filter((r) => r.status_pembayaran === BELUM).length
                  ),
                },
              ]}
            />
          </div>
        )}
      />
    </div>
  );
}

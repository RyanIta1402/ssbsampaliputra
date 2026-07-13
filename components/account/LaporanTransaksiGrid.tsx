"use client";

import { useMemo, useState } from "react";

import DataGrid, { type Column, type SelectFilter } from "@/components/account/DataGrid";
import ReportButton, { type ReportColumn } from "@/components/account/ReportButton";
import SummaryCard from "@/components/account/SummaryCard";
import { formatDate, formatRupiah } from "@/components/account/ui";
import DateField from "@/components/DateField";
import { dmyDateInput, idDateToIso, isoDateInput } from "@/lib/date";

/**
 * Baris laporan transaksi keuangan — bersumber dari view
 * `v_transaksi_keuangan` (penerimaan + pengeluaran + saldo berjalan).
 * Kolom numerik dikembalikan driver Neon sebagai string (numeric).
 */
export type TransaksiRow = {
  id: string;
  tgl: string | Date | null;
  jenis: string; // "Penerimaan" | "Pengeluaran"
  keterangan: string | null;
  masuk: string | null;
  keluar: string | null;
  saldo: string | null;
};

function JenisBadge({ jenis }: { jenis: string }) {
  const masuk = jenis === "Penerimaan";
  return (
    <span
      className={`inline-flex items-center border px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest ${
        masuk
          ? "border-pitch/40 bg-pitch/15 text-pitch"
          : "border-gold/40 bg-gold/15 text-gold"
      }`}
    >
      {jenis}
    </span>
  );
}

/** Sel nominal kas: 0/kosong tampil "—" agar kolom masuk/keluar mudah dibaca. */
function NominalCell({ value, tone }: { value: string | null; tone: string }) {
  const n = Number(value ?? 0);
  if (!n) return <span className="text-bone/25">—</span>;
  return <span className={`font-semibold ${tone}`}>{formatRupiah(n)}</span>;
}

/**
 * Grid laporan transaksi (read-only): buku kas gabungan penerimaan &
 * pengeluaran dengan saldo berjalan. Urutan bawaan mengikuti view
 * (kronologis) agar saldo terbaca menurun/menaik secara wajar; pengguna
 * tetap bisa cari, filter jenis, dan sort per kolom.
 */
const REPORT_COLUMNS: ReportColumn<TransaksiRow>[] = [
  { header: "Tanggal", value: (r) => formatDate(r.tgl) },
  { header: "Jenis", value: (r) => r.jenis },
  { header: "Keterangan", value: (r) => r.keterangan || "-" },
  {
    header: "Masuk",
    value: (r) => (Number(r.masuk ?? 0) ? formatRupiah(r.masuk) : "-"),
    align: "right",
  },
  {
    header: "Keluar",
    value: (r) => (Number(r.keluar ?? 0) ? formatRupiah(r.keluar) : "-"),
    align: "right",
  },
  { header: "Saldo", value: (r) => formatRupiah(r.saldo), align: "right" },
];

export default function LaporanTransaksiGrid({ rows }: { rows: TransaksiRow[] }) {
  // Rentang tanggal terpilih (format Indonesia dd-mm-yyyy, kosong = tak
  // dibatasi). Default: tanggal 1 s/d akhir bulan berjalan.
  const [dari, setDari] = useState(() => {
    const n = new Date();
    return dmyDateInput(new Date(n.getFullYear(), n.getMonth(), 1));
  });
  const [sampai, setSampai] = useState(() => {
    const n = new Date();
    return dmyDateInput(new Date(n.getFullYear(), n.getMonth() + 1, 0));
  });
  // Batas rentang dalam ISO (null bila kosong/belum lengkap → tak dipakai).
  const dariIso = idDateToIso(dari);
  const sampaiIso = idDateToIso(sampai);
  const hasRange = dariIso !== null || sampaiIso !== null;

  // Baris di dalam rentang tanggal — menentukan ringkasan & tabel di bawah.
  const rowsInRange = useMemo(() => {
    if (!hasRange) return rows;
    return rows.filter((r) => {
      const d = isoDateInput(r.tgl);
      if (!d) return false;
      if (dariIso && d < dariIso) return false;
      if (sampaiIso && d > sampaiIso) return false;
      return true;
    });
  }, [rows, dariIso, sampaiIso, hasRange]);

  const totalMasuk = rowsInRange.reduce((s, r) => s + Number(r.masuk ?? 0), 0);
  const totalKeluar = rowsInRange.reduce((s, r) => s + Number(r.keluar ?? 0), 0);

  // Saldo awal = akumulasi (masuk − keluar) seluruh transaksi yang tanggalnya
  // SEBELUM tanggal "Dari" — yakni saldo yang dibawa dari periode sebelumnya.
  // Nol bila batas awal tak diisi (tak ada periode sebelum yang dibatasi).
  const saldoAwal = useMemo(() => {
    if (!dariIso) return 0;
    let net = 0;
    for (const r of rows) {
      const d = isoDateInput(r.tgl);
      if (!d || d >= dariIso) continue;
      net += Number(r.masuk ?? 0) - Number(r.keluar ?? 0);
    }
    return net;
  }, [rows, dariIso]);

  // Saldo akhir = saldo awal + mutasi kas pada rentang terpilih, sehingga
  // buku kas terbaca konsisten: Saldo Awal + Masuk − Keluar = Saldo Akhir.
  const saldoAkhir = saldoAwal + totalMasuk - totalKeluar;

  const dateInputClass = (value: string) =>
    `w-36 border bg-ink px-3 py-2.5 text-sm font-bold outline-none transition-colors placeholder:font-normal placeholder:text-bone/30 focus:border-pitch ${
      value !== "" ? "border-pitch/50 text-pitch" : "border-bone/15 text-bone"
    }`;

  const columns: Column<TransaksiRow>[] = [
    {
      key: "tgl",
      header: "Tanggal",
      sortValue: (r) => (r.tgl ? new Date(r.tgl).getTime() : 0),
      render: (r) => <span className="text-bone/70">{formatDate(r.tgl)}</span>,
    },
    {
      key: "jenis",
      header: "Jenis",
      sortValue: (r) => r.jenis,
      render: (r) => <JenisBadge jenis={r.jenis} />,
    },
    {
      key: "keterangan",
      header: "Keterangan",
      sortValue: (r) => r.keterangan ?? "",
      render: (r) => (
        <span className="font-semibold text-bone">{r.keterangan || "—"}</span>
      ),
    },
    {
      key: "masuk",
      header: "Masuk",
      headerClassName: "text-right",
      cellClassName: "text-right",
      sortValue: (r) => Number(r.masuk ?? 0),
      render: (r) => <NominalCell value={r.masuk} tone="text-pitch" />,
    },
    {
      key: "keluar",
      header: "Keluar",
      headerClassName: "text-right",
      cellClassName: "text-right",
      sortValue: (r) => Number(r.keluar ?? 0),
      render: (r) => <NominalCell value={r.keluar} tone="text-gold" />,
    },
    {
      key: "saldo",
      header: "Saldo",
      headerClassName: "text-right",
      cellClassName: "text-right",
      sortValue: (r) => Number(r.saldo ?? 0),
      render: (r) => (
        <span className="font-bold text-bone">{formatRupiah(r.saldo)}</span>
      ),
    },
  ];

  const filters: SelectFilter<TransaksiRow>[] = [
    {
      key: "jenis",
      label: "Jenis",
      options: [
        { value: "Penerimaan", label: "Penerimaan" },
        { value: "Pengeluaran", label: "Pengeluaran" },
      ],
      match: (r, v) => r.jenis === v,
    },
  ];

  // Baris "Saldo Awal" yang dipatri di atas tabel (mengikuti kolom buku kas).
  // Hanya tampil bila tanggal "Dari" diisi — saat itulah saldo awal bermakna.
  const saldoAwalRow = dariIso ? (
    <tr className="bg-coal/40 text-sm">
      <td className="px-4 py-3 text-bone/60">{dari}</td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center border border-bone/25 bg-bone/[0.06] px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-bone/60">
          Saldo Awal
        </span>
      </td>
      <td className="px-4 py-3 font-semibold text-bone/70">
        Akumulasi sebelum {dari}
      </td>
      <td className="px-4 py-3 text-right text-bone/25">—</td>
      <td className="px-4 py-3 text-right text-bone/25">—</td>
      <td
        className={`px-4 py-3 text-right font-bold ${
          saldoAwal < 0 ? "text-red-400" : "text-bone"
        }`}
      >
        {formatRupiah(saldoAwal)}
      </td>
    </tr>
  ) : null;

  return (
    <div className="space-y-6">
      {/* Rentang tanggal — menentukan data yang ditampilkan di bawah. */}
      <div className="flex flex-wrap items-center gap-3 border border-bone/10 bg-coal/40 p-4">
        <span className="font-body text-[11px] font-bold uppercase tracking-widest text-bone/40">
          Rentang Tanggal
        </span>
        <label className="flex items-center gap-2">
          <span className="text-xs text-bone/50">Dari</span>
          <DateField
            value={dari}
            onChange={setDari}
            className={dateInputClass(dari)}
            ariaLabel="Tanggal dari"
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-xs text-bone/50">Sampai</span>
          <DateField
            value={sampai}
            onChange={setSampai}
            className={dateInputClass(sampai)}
            ariaLabel="Tanggal sampai"
          />
        </label>
        {hasRange && (
          <button
            type="button"
            onClick={() => {
              setDari("");
              setSampai("");
            }}
            className="border border-bone/15 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-bone/50 transition-colors hover:border-bone/40 hover:text-bone"
          >
            Reset
          </button>
        )}
        <span className="text-sm text-bone/50">
          {hasRange ? (
            <>
              Rentang terpilih:{" "}
              <strong className="text-bone">{rowsInRange.length}</strong>{" "}
              transaksi.
            </>
          ) : (
            <>
              Semua transaksi (
              <strong className="text-bone">{rows.length}</strong>).
            </>
          )}
        </span>
      </div>

      {/* Ringkasan untuk rentang terpilih. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Saldo Awal"
          value={formatRupiah(saldoAwal)}
          tone={saldoAwal < 0 ? "text-red-400" : "text-bone"}
          hint={
            dariIso
              ? `Akumulasi sebelum ${dari}`
              : "Isi tanggal Dari untuk menghitung"
          }
        />
        <SummaryCard
          label="Total Masuk"
          value={formatRupiah(totalMasuk)}
          tone="text-pitch"
        />
        <SummaryCard
          label="Total Keluar"
          value={formatRupiah(totalKeluar)}
          tone="text-gold"
        />
        <SummaryCard
          label="Saldo Akhir"
          value={formatRupiah(saldoAkhir)}
          tone={saldoAkhir < 0 ? "text-red-400" : "text-bone"}
        />
      </div>

      {/* Tabel buku kas untuk rentang terpilih. */}
      <DataGrid
        rows={rowsInRange}
        columns={columns}
        getRowId={(r) => r.id}
        searchText={(r) => [r.keterangan ?? "", r.jenis].join(" ")}
        searchPlaceholder="Cari keterangan..."
        filters={filters}
        emptyText="Belum ada transaksi."
        minTableWidth="720px"
        selectable
        leadRow={saldoAwalRow}
        action={(filtered) => {
          const masuk = filtered.reduce((s, r) => s + Number(r.masuk ?? 0), 0);
          const keluar = filtered.reduce((s, r) => s + Number(r.keluar ?? 0), 0);
          return (
            <ReportButton
              title="Laporan Transaksi Keuangan"
              subtitle={
                dariIso || sampaiIso
                  ? `Periode ${dari || "awal"} s/d ${sampai || "akhir"}`
                  : undefined
              }
              columns={REPORT_COLUMNS}
              rows={filtered}
              summary={[
                { label: "Saldo Awal", value: formatRupiah(saldoAwal) },
                { label: "Total Masuk", value: formatRupiah(masuk) },
                { label: "Total Keluar", value: formatRupiah(keluar) },
                {
                  label: "Saldo Akhir",
                  value: formatRupiah(saldoAwal + masuk - keluar),
                },
              ]}
            />
          );
        }}
      />
    </div>
  );
}

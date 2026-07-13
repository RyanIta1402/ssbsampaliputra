"use client";

import { useState } from "react";

import DateField from "@/components/DateField";
import {
  fieldClass,
  formatRibuan,
  labelClass,
  Modal,
} from "@/components/account/ui";
import { dmyDateInput, idDateToIso } from "@/lib/date";

/**
 * Baris & form kas (Penerimaan / Pengeluaran) — dipakai bersama oleh
 * PenerimaanGrid dan PengeluaranGrid (kedua tabel memakai kolom sama:
 * tgl, keterangan, nominal). `spp_id` hanya ada pada penerimaan sebagai
 * penanda bahwa baris berasal dari pembayaran SPP.
 */
export type KasRow = {
  id: string;
  tgl: string | Date | null;
  keterangan: string | null;
  nominal: string | null;
  spp_id?: string | null;
  created_at: string | Date;
  // Kosong (null) selama baris belum pernah diedit.
  updated_at: string | Date | null;
};

/** Form kas dalam modal — Tambah (tanpa `row`, POST) atau Edit (PATCH). */
export function KasFormModal({
  row,
  endpoint,
  entityLabel,
  onClose,
  onSaved,
}: {
  row?: KasRow;
  endpoint: string;
  entityLabel: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(row);
  // Tanggal ditampilkan/di-input dalam format Indonesia dd-mm-yyyy.
  const [tgl, setTgl] = useState(
    row ? dmyDateInput(row.tgl) : dmyDateInput(new Date())
  );
  const [keterangan, setKeterangan] = useState(row?.keterangan ?? "");
  // Nominal disimpan berpemisah ribuan (mis. "500.000").
  const [nominal, setNominal] = useState(
    row?.nominal != null ? formatRibuan(Number(row.nominal)) : ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (keterangan.trim() === "") {
      setError("Keterangan wajib diisi.");
      return;
    }
    if (nominal.replace(/[^\d]/g, "") === "") {
      setError("Nominal wajib diisi dengan angka.");
      return;
    }
    // Tanggal opsional; bila diisi harus valid (dd-mm-yyyy).
    const tglIso = idDateToIso(tgl);
    if (tgl.trim() !== "" && !tglIso) {
      setError("Tanggal tidak valid (format dd-mm-yyyy).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(isEdit ? `${endpoint}/${row!.id}` : endpoint, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tgl: tglIso, keterangan, nominal }),
      });
      const data = await res.json();
      if (data.ok) {
        onSaved();
      } else if (data.reason === "dari-spp") {
        setError(
          `${entityLabel} ini berasal dari SPP — ubah lewat menu SPP.`
        );
      } else if (data.reason === "forbidden") {
        setError(`Hanya admin yang boleh mengelola ${entityLabel}.`);
      } else if (data.reason === "db-not-configured") {
        setError("Database belum dikonfigurasi. Hubungi admin.");
      } else {
        setError("Gagal menyimpan. Periksa kembali data.");
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? `Edit ${entityLabel}` : `Tambah ${entityLabel}`}
      subtitle={isEdit ? undefined : `Catat ${entityLabel.toLowerCase()} baru.`}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelClass}>Tanggal</label>
          <DateField value={tgl} onChange={setTgl} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>
            Keterangan <span className="text-pitch">*</span>
          </label>
          <input
            required
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value.toUpperCase())}
            placeholder="Mis. Donasi, Sewa lapangan"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            Nominal (Rp) <span className="text-pitch">*</span>
          </label>
          <input
            required
            inputMode="numeric"
            value={nominal}
            onChange={(e) => setNominal(formatRibuan(e.target.value))}
            placeholder="Mis. 500.000"
            className={fieldClass}
          />
        </div>

        {error && <p className="text-sm font-semibold text-red-400">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-bone/20 py-3 font-body text-xs font-bold uppercase tracking-widest text-bone/70 transition-colors hover:border-bone/40 hover:text-bone"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import { useState } from "react";

import { fieldClass, formatDate, labelClass, Modal } from "@/components/account/ui";
import { isoDateInput } from "@/lib/date";
import { compressImage } from "@/lib/image";
import { isValidWa } from "@/lib/wa";

/**
 * Form & tampilan detail data anak — dipakai bersama oleh grid Pendaftaran
 * dan grid Siswa (kedua tabel memakai kolom yang sama).
 */

// Ikon tombol (inline SVG, mewarisi warna via currentColor). Ukuran ikon
// disamakan dengan tombol aksi di grid (h-4 w-4).
const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-4 w-4",
  "aria-hidden": true,
};

/** Batal — ikon silang. */
function XIcon() {
  return (
    <svg {...iconProps} strokeWidth={2.5}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/** Simpan — ikon disket. */
function SaveIcon() {
  return (
    <svg {...iconProps}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  );
}

/** Spinner kecil untuk status memuat (mengganti ikon Simpan saat menyimpan). */
function Spinner() {
  return (
    <span
      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
  );
}

export type PesertaRow = {
  id: string;
  // NIS otomatis (hanya untuk data siswa; pendaftaran tidak memilikinya).
  nis?: string | null;
  nama_lengkap: string;
  nama_panggilan: string | null;
  jenis_kelamin: string | null;
  tempat_lahir: string | null;
  // Driver Neon bisa mengembalikan kolom date/timestamptz sebagai Date.
  tanggal_lahir: string | Date | null;
  no_hp: string;
  nama_sekolah: string | null;
  kelas: string | null;
  berat_badan: string | null;
  tinggi_badan: string | null;
  golongan_darah: string | null;
  nama_orang_tua: string | null;
  foto: string | null;
  status: string;
  created_at: string | Date;
  // Kosong (null) selama baris belum pernah diedit.
  updated_at: string | Date | null;
};

const GOL_DARAH = ["A", "B", "AB", "O"];

/** Foto bulat kecil untuk kolom nama di grid. */
export function FotoCell({ row }: { row: PesertaRow }) {
  if (!row.foto) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-coal text-bone/30 ring-1 ring-bone/10">
        —
      </span>
    );
  }
  return (
    <a href={row.foto} target="_blank" rel="noreferrer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={row.foto}
        alt={`Foto ${row.nama_lengkap}`}
        className="h-10 w-10 shrink-0 rounded object-cover ring-1 ring-bone/15 transition-transform hover:scale-105"
      />
    </a>
  );
}

/**
 * Form data anak dalam modal — Tambah (tanpa `row`, POST ke `endpoint`)
 * atau Edit (PATCH ke `endpoint`/[id]). Foto dikompres di browser; hanya
 * dikirim bila diganti/dihapus agar PATCH tanpa perubahan foto tetap ringan.
 */
export function PesertaFormModal({
  row,
  endpoint,
  entityLabel,
  statuses,
  statusLabels,
  defaultStatus,
  onClose,
  onSaved,
}: {
  row?: PesertaRow;
  endpoint: string;
  entityLabel: string;
  statuses: readonly string[];
  statusLabels: Record<string, string>;
  defaultStatus: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(row);
  const [form, setForm] = useState({
    namaLengkap: row?.nama_lengkap ?? "",
    namaPanggilan: row?.nama_panggilan ?? "",
    jenisKelamin: row?.jenis_kelamin ?? "",
    tempatLahir: row?.tempat_lahir ?? "",
    tanggalLahir: isoDateInput(row?.tanggal_lahir),
    noHp: row?.no_hp ?? "",
    namaSekolah: row?.nama_sekolah ?? "",
    kelas: row?.kelas ?? "",
    beratBadan: row?.berat_badan ?? "",
    tinggiBadan: row?.tinggi_badan ?? "",
    golonganDarah: row?.golongan_darah ?? "",
    namaOrangTua: row?.nama_orang_tua ?? "",
    status: row?.status ?? defaultStatus,
  });
  // undefined = foto tidak diubah; string = diganti; null = dihapus.
  const [foto, setFoto] = useState<string | null | undefined>(undefined);
  const [fotoLoading, setFotoLoading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Setter generik. `upper` memaksa huruf kapital untuk field teks bebas
  // (nama, tempat lahir, sekolah, dll.); tidak dipakai untuk select/tanggal/angka.
  const set = (key: keyof typeof form, upper = false) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) =>
    setForm((prev) => ({
      ...prev,
      [key]: upper ? e.target.value.toUpperCase() : e.target.value,
    }));

  const currentFoto = foto === undefined ? row?.foto ?? null : foto;

  const pickFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("File foto harus berupa gambar.");
      return;
    }
    setError("");
    setFotoLoading(true);
    try {
      setFoto(await compressImage(file));
    } catch {
      setError("Gagal memproses foto. Coba foto lain.");
    } finally {
      setFotoLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.namaLengkap.trim() === "") {
      setError("Nama lengkap wajib diisi.");
      return;
    }
    if (!isValidWa(form.noHp)) {
      setError("Masukkan nomor WhatsApp yang benar (mis. 081234567890).");
      return;
    }
    setLoading(true);
    try {
      const body: Record<string, unknown> = { ...form };
      if (foto !== undefined) body.foto = foto;
      const res = await fetch(isEdit ? `${endpoint}/${row!.id}` : endpoint, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        onSaved();
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
      subtitle={isEdit ? row!.nama_lengkap : `Isi data ${entityLabel} baru.`}
      onClose={onClose}
      wide
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
              Nama Lengkap <span className="text-pitch">*</span>
            </label>
            <input
              required
              value={form.namaLengkap}
              onChange={set("namaLengkap", true)}
              placeholder="Nama lengkap anak"
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Nama Panggilan</label>
            <input
              value={form.namaPanggilan}
              onChange={set("namaPanggilan", true)}
              placeholder="Panggilan (opsional)"
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Jenis Kelamin</label>
            <select
              value={form.jenisKelamin}
              onChange={set("jenisKelamin")}
              className={fieldClass}
            >
              <option value="">— Pilih —</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>
              No WhatsApp <span className="text-pitch">*</span>
            </label>
            <input
              required
              type="tel"
              inputMode="numeric"
              value={form.noHp}
              onChange={set("noHp")}
              placeholder="Contoh: 081234567890"
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Tempat Lahir</label>
            <input
              value={form.tempatLahir}
              onChange={set("tempatLahir", true)}
              placeholder="Kota kelahiran (opsional)"
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Tanggal Lahir</label>
            <input
              type="date"
              value={form.tanggalLahir}
              onChange={set("tanggalLahir")}
              className={`${fieldClass} [color-scheme:dark]`}
            />
          </div>
          <div>
            <label className={labelClass}>Nama Sekolah</label>
            <input
              value={form.namaSekolah}
              onChange={set("namaSekolah", true)}
              placeholder="Sekolah (opsional)"
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Kelas</label>
            <input
              value={form.kelas}
              onChange={set("kelas", true)}
              placeholder="Mis. 5 SD (opsional)"
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Berat Badan (kg)</label>
            <input
              inputMode="numeric"
              value={form.beratBadan}
              onChange={set("beratBadan")}
              placeholder="Mis. 35 (opsional)"
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Tinggi Badan (cm)</label>
            <input
              inputMode="numeric"
              value={form.tinggiBadan}
              onChange={set("tinggiBadan")}
              placeholder="Mis. 140 (opsional)"
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Golongan Darah</label>
            <select
              value={form.golonganDarah}
              onChange={set("golonganDarah")}
              className={fieldClass}
            >
              <option value="">— Pilih —</option>
              {GOL_DARAH.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Nama Orang Tua</label>
            <input
              value={form.namaOrangTua}
              onChange={set("namaOrangTua", true)}
              placeholder="Orang tua/wali (opsional)"
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={form.status}
              onChange={set("status")}
              className={fieldClass}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {statusLabels[s] ?? s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Foto</label>
            <div className="flex items-center gap-3">
              {currentFoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentFoto}
                  alt="Pratinjau foto"
                  className="h-12 w-12 shrink-0 rounded object-cover ring-1 ring-bone/15"
                />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-coal text-bone/30 ring-1 ring-bone/10">
                  —
                </span>
              )}
              <label className="cursor-pointer border border-bone/20 px-3 py-2 text-xs font-bold uppercase tracking-wider text-bone/70 transition-colors hover:border-pitch hover:text-pitch">
                {fotoLoading ? "Memproses..." : currentFoto ? "Ganti" : "Pilih Foto"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={pickFoto}
                  className="hidden"
                />
              </label>
              {currentFoto && (
                <button
                  type="button"
                  onClick={() => setFoto(null)}
                  className="border border-red-500/40 px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-400 transition-colors hover:bg-red-500/10"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
        </div>

        {error && <p className="text-sm font-semibold text-red-400">{error}</p>}

        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            title="Batal"
            aria-label="Batal"
            className="border border-bone/20 p-2.5 text-bone/70 transition-colors hover:border-bone/40 hover:text-bone"
          >
            <XIcon />
          </button>
          <button
            type="submit"
            disabled={loading || fotoLoading}
            title="Simpan"
            aria-label="Simpan"
            className="border border-pitch bg-pitch p-2.5 text-ink transition-colors hover:bg-gold hover:border-gold disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? <Spinner /> : <SaveIcon />}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/** Modal detail read-only: seluruh field data anak + foto. */
export function PesertaDetailModal({
  row,
  statusLabels,
  onClose,
}: {
  row: PesertaRow;
  statusLabels: Record<string, string>;
  onClose: () => void;
}) {
  const items: { label: string; value: string }[] = [
    ...(row.nis != null ? [{ label: "NIS", value: row.nis }] : []),
    { label: "Nama Lengkap", value: row.nama_lengkap },
    { label: "Nama Panggilan", value: row.nama_panggilan || "—" },
    { label: "Jenis Kelamin", value: row.jenis_kelamin || "—" },
    {
      label: "Tempat / Tanggal Lahir",
      value:
        [row.tempat_lahir, formatDate(row.tanggal_lahir)]
          .filter((v) => v && v !== "—")
          .join(", ") || "—",
    },
    { label: "No WhatsApp", value: row.no_hp },
    { label: "Sekolah", value: row.nama_sekolah || "—" },
    { label: "Kelas", value: row.kelas || "—" },
    { label: "Berat / Tinggi", value: `${row.berat_badan || "—"} kg / ${row.tinggi_badan || "—"} cm` },
    { label: "Golongan Darah", value: row.golongan_darah || "—" },
    { label: "Orang Tua", value: row.nama_orang_tua || "—" },
    { label: "Status", value: statusLabels[row.status] ?? row.status },
    { label: "Terdaftar", value: formatDate(row.created_at) },
  ];

  return (
    <Modal title="Detail" subtitle={row.nama_lengkap} onClose={onClose} wide>
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="shrink-0">
          {row.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.foto}
              alt={`Foto ${row.nama_lengkap}`}
              className="h-32 w-32 rounded object-cover ring-1 ring-bone/15"
            />
          ) : (
            <span className="flex h-32 w-32 items-center justify-center rounded bg-coal text-bone/30 ring-1 ring-bone/10">
              Tanpa foto
            </span>
          )}
        </div>
        <dl className="grid flex-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {items.map((it) => (
            <div key={it.label}>
              <dt className="font-body text-[11px] font-bold uppercase tracking-widest text-bone/40">
                {it.label}
              </dt>
              <dd className="mt-0.5 text-sm text-bone/90">{it.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Modal>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import DataGrid, { type Column } from "@/components/account/DataGrid";
import ReportButton, { type ReportColumn } from "@/components/account/ReportButton";
import {
  ActionButtons,
  AddButton,
  ConfirmDialog,
  DeleteButton,
  EditButton,
  fieldClass,
  formatDate,
  formatRibuan,
  formatRupiah,
  labelClass,
  Modal,
} from "@/components/account/ui";
import DateField from "@/components/DateField";
import {
  bulanInput,
  bulanLabel,
  dmyDateInput,
  idDateToIso,
} from "@/lib/date";

export type SppRow = {
  id: string;
  tglbayar: string | Date | null;
  bulan: string | Date | null;
  iuran: string | null;
  created_at: string | Date;
  updated_at: string | Date | null;
  siswa_id: string | null;
  siswa_nis: string | null;
  siswa_nama: string | null;
};

/** Data siswa untuk pilihan pembayar SPP (picker modal grid). */
export type SiswaOption = {
  id: string;
  nis: string | null;
  nama_lengkap: string;
  nama_sekolah: string | null;
  kelas: string | null;
  status: string;
};

/**
 * Grid pembayaran SPP (admin): pencarian, sort, pagination, plus CRUD lewat
 * modal — Tambah (POST /api/spp), Edit (PATCH /api/spp/[id]), Hapus (DELETE).
 * Setiap SPP otomatis tercatat pula di daftar Penerimaan (kas masuk).
 */
const REPORT_COLUMNS: ReportColumn<SppRow>[] = [
  { header: "Tgl Bayar", value: (r) => formatDate(r.tglbayar) },
  { header: "Siswa", value: (r) => r.siswa_nama || "-" },
  { header: "Bulan", value: (r) => bulanLabel(r.bulan) || "-" },
  { header: "Iuran", value: (r) => formatRupiah(r.iuran), align: "right" },
];

export default function SppGrid({
  rows,
  siswaList,
}: {
  rows: SppRow[];
  siswaList: SiswaOption[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<SppRow | null>(null);
  const [deleting, setDeleting] = useState<SppRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteError("");
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/spp/${deleting.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        setDeleting(null);
        router.refresh();
      } else if (data.reason === "forbidden") {
        setDeleteError("Hanya admin yang boleh menghapus SPP.");
      } else {
        setDeleteError("Gagal menghapus SPP. Coba lagi.");
      }
    } catch {
      setDeleteError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<SppRow>[] = [
    {
      key: "tglbayar",
      header: "Tgl Bayar",
      sortValue: (r) => (r.tglbayar ? new Date(r.tglbayar).getTime() : 0),
      render: (r) => <span className="text-bone/70">{formatDate(r.tglbayar)}</span>,
    },
    {
      key: "siswa",
      header: "Siswa",
      sortValue: (r) => r.siswa_nama ?? "",
      render: (r) =>
        r.siswa_nama ? (
          <div>
            <div className="font-semibold text-bone">{r.siswa_nama}</div>
            {r.siswa_nis && (
              <div className="font-mono text-xs text-bone/40">
                NIS {r.siswa_nis}
              </div>
            )}
          </div>
        ) : (
          <span className="text-bone/40">—</span>
        ),
    },
    {
      key: "bulan",
      header: "Bulan",
      sortValue: (r) => (r.bulan ? new Date(r.bulan).getTime() : 0),
      render: (r) => (
        <span className="font-semibold text-bone">
          {bulanLabel(r.bulan) || "—"}
        </span>
      ),
    },
    {
      key: "iuran",
      header: "Iuran",
      sortValue: (r) => Number(r.iuran ?? 0),
      render: (r) => (
        <span className="font-semibold text-pitch">{formatRupiah(r.iuran)}</span>
      ),
    },
    {
      key: "updated_at",
      header: "Tgl Ubah",
      sortValue: (r) => (r.updated_at ? new Date(r.updated_at).getTime() : 0),
      render: (r) =>
        r.updated_at ? (
          <span className="text-bone/50">{formatDate(r.updated_at)}</span>
        ) : (
          <span className="text-bone/25">—</span>
        ),
    },
    {
      key: "aksi",
      header: "Aksi",
      headerClassName: "text-right",
      render: (r) => (
        <ActionButtons>
          <EditButton onClick={() => setEditing(r)} />
          <DeleteButton
            onClick={() => {
              setDeleteError("");
              setDeleting(r);
            }}
          />
        </ActionButtons>
      ),
    },
  ];

  return (
    <>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        searchText={(r) =>
          [
            r.siswa_nama ?? "",
            r.siswa_nis ?? "",
            bulanLabel(r.bulan),
            formatDate(r.tglbayar),
          ].join(" ")
        }
        searchPlaceholder="Cari siswa, bulan..."
        emptyText="Belum ada data SPP."
        minTableWidth="720px"
        selectable
        action={(filtered) => (
          <div className="flex items-center gap-2">
            <ReportButton
              title="Pembayaran SPP"
              columns={REPORT_COLUMNS}
              rows={filtered}
              summary={[
                {
                  label: "Total Iuran",
                  value: formatRupiah(
                    filtered.reduce((s, r) => s + Number(r.iuran ?? 0), 0)
                  ),
                },
              ]}
            />
            <AddButton label="Tambah SPP" onClick={() => setAdding(true)} />
          </div>
        )}
      />

      {adding && (
        <SppFormModal
          siswaList={siswaList}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            router.refresh();
          }}
        />
      )}
      {editing && (
        <SppFormModal
          spp={editing}
          siswaList={siswaList}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Hapus SPP"
          message={
            <>
              Hapus pembayaran SPP{" "}
              <strong className="text-bone">
                {bulanLabel(deleting.bulan) || "ini"}
              </strong>
              ?
              Baris penerimaan yang terkait juga akan terhapus.
            </>
          }
          loading={deleteLoading}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}

/** Form SPP dalam modal — Tambah (tanpa `spp`) atau Edit. */
function SppFormModal({
  spp,
  siswaList,
  onClose,
  onSaved,
}: {
  spp?: SppRow;
  siswaList: SiswaOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(spp);
  // Tanggal bayar ditampilkan/di-input dalam format Indonesia dd-mm-yyyy.
  const [tglbayar, setTglbayar] = useState(
    spp ? dmyDateInput(spp.tglbayar) : dmyDateInput(new Date())
  );
  // Kolom `bulan` bertipe date; input pakai <input type="month"> → "yyyy-mm".
  // Tambah baru: default ke bulan berjalan.
  const [bulan, setBulan] = useState(
    spp ? bulanInput(spp.bulan) : bulanInput(new Date())
  );
  // Tambah baru: default iuran 25.000. Nilai disimpan berpemisah ribuan.
  const [iuran, setIuran] = useState(
    formatRibuan(spp?.iuran != null ? Number(spp.iuran) : 25000)
  );
  // Siswa terpilih (pembayar SPP). Prefill dari data SPP saat edit.
  const [siswa, setSiswa] = useState<{
    id: string;
    nis: string | null;
    nama: string;
  } | null>(
    spp?.siswa_id
      ? { id: spp.siswa_id, nis: spp.siswa_nis, nama: spp.siswa_nama ?? "" }
      : null
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!siswa) {
      setError("Pilih siswa pembayar SPP terlebih dahulu.");
      return;
    }
    if (bulan.trim() === "") {
      setError("Bulan wajib diisi.");
      return;
    }
    if (iuran.replace(/[^\d]/g, "") === "") {
      setError("Iuran wajib diisi dengan angka.");
      return;
    }
    // Tanggal bayar opsional; bila diisi harus valid (dd-mm-yyyy).
    const tglbayarIso = idDateToIso(tglbayar);
    if (tglbayar.trim() !== "" && !tglbayarIso) {
      setError("Tanggal bayar tidak valid (format dd-mm-yyyy).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(isEdit ? `/api/spp/${spp!.id}` : "/api/spp", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        // Kirim tanggal & bulan sebagai ISO agar cocok kolom date.
        body: JSON.stringify({
          tglbayar: tglbayarIso,
          bulan: `${bulan}-01`,
          iuran,
          siswaId: siswa.id,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        onSaved();
      } else if (data.reason === "forbidden") {
        setError("Hanya admin yang boleh mengelola SPP.");
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
    <>
    <Modal
      title={isEdit ? "Edit SPP" : "Tambah SPP"}
      subtitle={isEdit ? bulanLabel(spp!.bulan) : "Catat pembayaran SPP siswa."}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelClass}>
            Siswa <span className="text-pitch">*</span>
          </label>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            disabled={isEdit}
            className={`flex w-full items-center justify-between gap-3 border px-4 py-3 text-left transition-colors ${
              isEdit
                ? "cursor-not-allowed border-bone/10 bg-coal/60 text-bone/60"
                : siswa
                ? "border-bone/15 bg-coal text-bone hover:border-pitch"
                : "border-bone/15 bg-coal text-bone/40 hover:border-pitch"
            }`}
          >
            <span className="min-w-0 truncate">
              {siswa ? (
                <>
                  {siswa.nama}
                  {siswa.nis && (
                    <span className="ml-2 font-mono text-xs text-bone/40">
                      NIS {siswa.nis}
                    </span>
                  )}
                </>
              ) : (
                "— Pilih siswa —"
              )}
            </span>
            {!isEdit && (
              <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-pitch">
                {siswa ? "Ganti" : "Pilih"}
              </span>
            )}
          </button>
        </div>
        <div>
          <label className={labelClass}>Tanggal Bayar</label>
          <DateField
            value={tglbayar}
            onChange={setTglbayar}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            Bulan <span className="text-pitch">*</span>
          </label>
          <input
            required
            type="month"
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            className={`${fieldClass} [color-scheme:dark]`}
          />
        </div>
        <div>
          <label className={labelClass}>
            Iuran (Rp) <span className="text-pitch">*</span>
          </label>
          <input
            required
            inputMode="numeric"
            value={iuran}
            onChange={(e) => setIuran(formatRibuan(e.target.value))}
            placeholder="Mis. 150.000"
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
    {pickerOpen && (
      <SiswaPickerModal
        siswaList={siswaList}
        onClose={() => setPickerOpen(false)}
        onPick={(s) => {
          setSiswa({ id: s.id, nis: s.nis, nama: s.nama_lengkap });
          setError("");
          setPickerOpen(false);
        }}
      />
    )}
    </>
  );
}

/**
 * Modal pemilih siswa berbentuk grid (dipakai form SPP). Menampilkan seluruh
 * siswa dengan pencarian/sort; klik "Pilih" mengembalikan siswa terpilih.
 */
function SiswaPickerModal({
  siswaList,
  onPick,
  onClose,
}: {
  siswaList: SiswaOption[];
  onPick: (s: SiswaOption) => void;
  onClose: () => void;
}) {
  const columns: Column<SiswaOption>[] = [
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
      header: "Nama",
      sortValue: (r) => r.nama_lengkap,
      render: (r) => (
        <span className="font-semibold text-bone">{r.nama_lengkap}</span>
      ),
    },
    {
      key: "sekolah",
      header: "Sekolah / Kelas",
      sortValue: (r) => r.nama_sekolah ?? "",
      render: (r) =>
        [r.nama_sekolah, r.kelas].filter(Boolean).join(" · ") || "—",
    },
    {
      key: "aksi",
      header: "Aksi",
      headerClassName: "text-right",
      render: (r) => (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onPick(r)}
            className="border border-pitch/40 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-pitch transition-colors hover:bg-pitch hover:text-ink"
          >
            Pilih
          </button>
        </div>
      ),
    },
  ];

  return (
    <Modal title="Pilih Siswa" subtitle="Pilih pembayar SPP." onClose={onClose} wide>
      <DataGrid
        rows={siswaList}
        columns={columns}
        getRowId={(r) => r.id}
        searchText={(r) =>
          [r.nis ?? "", r.nama_lengkap, r.nama_sekolah ?? "", r.kelas ?? ""].join(
            " "
          )
        }
        searchPlaceholder="Cari NIS, nama, sekolah..."
        emptyText="Belum ada data siswa."
        minTableWidth="560px"
      />
    </Modal>
  );
}

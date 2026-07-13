"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import DataGrid, {
  type Column,
  type SelectFilter,
} from "@/components/account/DataGrid";
import ReportButton, { type ReportColumn } from "@/components/account/ReportButton";
import { type SiswaOption } from "@/components/account/SppGrid";
import WhatsAppButton from "@/components/account/WhatsAppButton";
import {
  ActionButtons,
  AddButton,
  CheckIcon,
  ConfirmDialog,
  DeleteButton,
  EditButton,
  fieldClass,
  formatDate,
  labelClass,
  Modal,
} from "@/components/account/ui";

/**
 * Baris "list turnamen" — penautan siswa ke sebuah turnamen. Data siswa &
 * turnamen ikut di-join dari tabel masternya.
 */
export type ListTurnamenRow = {
  id: string;
  turnamen_id: string | null;
  siswa_id: string | null;
  keterangan: string | null;
  /** Bit: '1' = sudah bayar (lunas); selain itu belum bayar. */
  statusbayar: string | null;
  created_at: string | Date;
  updated_at: string | Date | null;
  siswa_nis: string | null;
  siswa_nama: string | null;
  turnamen_nama: string | null;
  turnamen_tgl: string | Date | null;
};

/** Pilihan turnamen untuk dropdown form. */
export type TurnamenOption = { id: string; namaturnamen: string };

/**
 * Status bayar disimpan sebagai bit di kolom `statusbayar`: '1' = sudah bayar
 * (lunas), selain itu dianggap belum bayar.
 */
function isPaid(v: ListTurnamenRow["statusbayar"]): boolean {
  return String(v) === "1";
}

/**
 * Susun pesan WhatsApp status bayar turnamen dari baris (mengikuti hasil
 * pencarian/filter grid) — mengikuti pola laporan SPP per bulan: judul berhias
 * ikon dan garis pemisah, lalu daftar siswa bernomor beserta turnamen dan
 * status bayarnya. Format *tebal* serta emoji dikenali WhatsApp.
 */
function buildWaText(rows: ListTurnamenRow[]): string {
  const divider = "━━━━━━━━━━━━━━━━";
  const lines = [
    "⚽ *STATUS BAYAR TURNAMEN*",
    "🏆 _SSB Sampali Putra_",
    divider,
    "",
  ];
  if (rows.length === 0) {
    lines.push("🚫 Tidak ada data.");
  } else {
    rows.forEach((r, i) => {
      lines.push(`${i + 1}. *${r.siswa_nama || "-"}*`);
      if (r.turnamen_nama) lines.push(`   🏆 ${r.turnamen_nama}`);
      lines.push(
        `   ${isPaid(r.statusbayar) ? "✅ Sudah Bayar" : "❌ Belum Bayar"}`
      );
    });
  }
  lines.push("", divider);
  return lines.join("\n");
}

const REPORT_COLUMNS: ReportColumn<ListTurnamenRow>[] = [
  { header: "Siswa", value: (r) => r.siswa_nama || "-" },
  { header: "NIS", value: (r) => r.siswa_nis || "-" },
  { header: "Turnamen", value: (r) => r.turnamen_nama || "-" },
  { header: "Tanggal", value: (r) => formatDate(r.turnamen_tgl) || "-" },
  { header: "Keterangan", value: (r) => r.keterangan || "-" },
  {
    header: "Status Bayar",
    value: (r) => (isPaid(r.statusbayar) ? "Sudah Bayar" : "Belum Bayar"),
  },
];

/**
 * Grid list turnamen (admin/pelatih): daftar siswa yang mengikuti turnamen.
 * CRUD lewat modal — Tambah (POST /api/list-turnamen), Edit
 * (PATCH /api/list-turnamen/[id]), Hapus (DELETE), plus tombol Report PDF.
 */
export default function ListTurnamenGrid({
  rows,
  siswaList,
  turnamenList,
}: {
  rows: ListTurnamenRow[];
  siswaList: SiswaOption[];
  turnamenList: TurnamenOption[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<ListTurnamenRow | null>(null);
  const [deleting, setDeleting] = useState<ListTurnamenRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteError("");
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/list-turnamen/${deleting.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.ok) {
        setDeleting(null);
        router.refresh();
      } else if (data.reason === "forbidden") {
        setDeleteError("Hanya pengelola yang boleh menghapus data ini.");
      } else {
        setDeleteError("Gagal menghapus data. Coba lagi.");
      }
    } catch {
      setDeleteError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<ListTurnamenRow>[] = [
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
      key: "turnamen",
      header: "Turnamen",
      sortValue: (r) => r.turnamen_nama ?? "",
      render: (r) => (
        <div>
          <div className="font-semibold text-bone">
            {r.turnamen_nama || "—"}
          </div>
          {r.turnamen_tgl && (
            <div className="text-xs text-bone/40">
              {formatDate(r.turnamen_tgl)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "keterangan",
      header: "Keterangan",
      render: (r) => r.keterangan || "—",
    },
    {
      key: "statusbayar",
      header: "Status Bayar",
      sortValue: (r) => (isPaid(r.statusbayar) ? 1 : 0),
      render: (r) =>
        isPaid(r.statusbayar) ? (
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
          <StatusBayarToggle row={r} onChanged={() => router.refresh()} />
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

  const filters: SelectFilter<ListTurnamenRow>[] = [
    {
      key: "statusbayar",
      label: "Status Bayar",
      options: [
        { value: "1", label: "Sudah Bayar" },
        { value: "0", label: "Belum Bayar" },
      ],
      match: (r, v) => (isPaid(r.statusbayar) ? "1" : "0") === v,
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
            r.turnamen_nama ?? "",
            r.keterangan ?? "",
          ].join(" ")
        }
        searchPlaceholder="Cari siswa, turnamen, keterangan..."
        filters={filters}
        emptyText="Belum ada siswa yang didaftarkan ke turnamen."
        minTableWidth="900px"
        selectable
        action={(filtered) => (
          <div className="flex flex-wrap items-center gap-2">
            <WhatsAppButton text={buildWaText(filtered)} />
            <ReportButton
              title="List Turnamen Siswa"
              columns={REPORT_COLUMNS}
              rows={filtered}
              summary={[
                { label: "Jumlah Peserta", value: String(filtered.length) },
                {
                  label: "Sudah Bayar",
                  value: String(
                    filtered.filter((r) => isPaid(r.statusbayar)).length
                  ),
                },
                {
                  label: "Belum Bayar",
                  value: String(
                    filtered.filter((r) => !isPaid(r.statusbayar)).length
                  ),
                },
              ]}
            />
            <AddButton label="Tambah" onClick={() => setAdding(true)} />
          </div>
        )}
      />

      {adding && (
        <ListTurnamenFormModal
          siswaList={siswaList}
          turnamenList={turnamenList}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            router.refresh();
          }}
        />
      )}
      {editing && (
        <ListTurnamenFormModal
          row={editing}
          siswaList={siswaList}
          turnamenList={turnamenList}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Hapus dari Turnamen"
          message={
            <>
              Hapus{" "}
              <strong className="text-bone">
                {deleting.siswa_nama || "siswa ini"}
              </strong>{" "}
              dari turnamen{" "}
              <strong className="text-bone">
                {deleting.turnamen_nama || "ini"}
              </strong>
              ? Tindakan ini tidak bisa dibatalkan.
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

/**
 * Tombol ikon centang (toggle) di kolom Aksi untuk menandai status bayar.
 * Hijau/aktif bila sudah bayar; klik untuk menandai lunas atau membatalkannya.
 * Perubahan langsung disimpan lewat PATCH /api/list-turnamen/[id]/status, lalu
 * grid di-refresh oleh pemanggil (`onChanged`).
 */
function StatusBayarToggle({
  row,
  onChanged,
}: {
  row: ListTurnamenRow;
  onChanged: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const paid = isPaid(row.statusbayar);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/list-turnamen/${row.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusbayar: !paid }),
      });
      const data = await res.json();
      if (data.ok) onChanged();
    } catch {
      /* abaikan galat jaringan — status tak berubah, pengguna bisa ulangi */
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={paid}
      aria-label="Ubah status bayar"
      title={
        paid
          ? "Sudah bayar — klik untuk tandai belum bayar"
          : "Belum bayar — klik untuk tandai sudah bayar"
      }
      className={`border p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        paid
          ? "border-pitch/50 bg-pitch/10 text-pitch hover:bg-pitch/20"
          : "border-bone/20 text-bone/40 hover:border-pitch hover:text-pitch"
      }`}
    >
      <CheckIcon />
    </button>
  );
}

/** Form list turnamen dalam modal — Tambah (tanpa `row`) atau Edit. */
function ListTurnamenFormModal({
  row,
  siswaList,
  turnamenList,
  onClose,
  onSaved,
}: {
  row?: ListTurnamenRow;
  siswaList: SiswaOption[];
  turnamenList: TurnamenOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(row);
  const [siswa, setSiswa] = useState<{
    id: string;
    nis: string | null;
    nama: string;
  } | null>(
    row?.siswa_id
      ? { id: row.siswa_id, nis: row.siswa_nis, nama: row.siswa_nama ?? "" }
      : null
  );
  const [turnamenId, setTurnamenId] = useState(row?.turnamen_id ?? "");
  const [keterangan, setKeterangan] = useState(row?.keterangan ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!siswa) {
      setError("Pilih siswa terlebih dahulu.");
      return;
    }
    if (turnamenId.trim() === "") {
      setError("Pilih turnamen terlebih dahulu.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        isEdit ? `/api/list-turnamen/${row!.id}` : "/api/list-turnamen",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            siswaId: siswa.id,
            turnamenId,
            keterangan,
          }),
        }
      );
      const data = await res.json();
      if (data.ok) {
        onSaved();
      } else if (data.reason === "duplikat") {
        setError("Siswa ini sudah terdaftar di turnamen tersebut.");
      } else if (data.reason === "forbidden") {
        setError("Hanya pengelola yang boleh mengelola data ini.");
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
        title={isEdit ? "Edit List Turnamen" : "Tambah List Turnamen"}
        subtitle="Daftarkan siswa ke sebuah turnamen."
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
              className={`flex w-full items-center justify-between gap-3 border px-4 py-3 text-left transition-colors ${
                siswa
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
              <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-pitch">
                {siswa ? "Ganti" : "Pilih"}
              </span>
            </button>
          </div>
          <div>
            <label className={labelClass}>
              Turnamen <span className="text-pitch">*</span>
            </label>
            <select
              required
              value={turnamenId}
              onChange={(e) => setTurnamenId(e.target.value)}
              className={`${fieldClass} [color-scheme:dark]`}
            >
              <option value="">— Pilih turnamen —</option>
              {turnamenList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.namaturnamen}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Keterangan</label>
            <textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Mis. posisi, prestasi, catatan (opsional)"
              rows={3}
              className={fieldClass}
            />
          </div>

          {error && (
            <p className="text-sm font-semibold text-red-400">{error}</p>
          )}

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

/** Modal pemilih siswa berbentuk grid — pencarian & sort, klik "Pilih". */
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
    <Modal title="Pilih Siswa" subtitle="Pilih peserta turnamen." onClose={onClose} wide>
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

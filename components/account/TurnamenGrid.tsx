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
  labelClass,
  Modal,
} from "@/components/account/ui";
import DateField from "@/components/DateField";
import { dmyDateInput, idDateToIso } from "@/lib/date";

/**
 * Baris data master turnamen. Kolom tanggal/timestamp bisa dikembalikan
 * driver Neon sebagai objek Date.
 */
export type TurnamenRow = {
  id: string;
  namaturnamen: string;
  keteranganturnamen: string | null;
  tglturnamen: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date | null;
};

/**
 * Grid data master turnamen (admin/pelatih): pencarian, sort, pagination,
 * plus CRUD lewat modal — Tambah (POST /api/turnamen), Edit
 * (PATCH /api/turnamen/[id]), Hapus (DELETE), dan tombol Report PDF.
 */
const REPORT_COLUMNS: ReportColumn<TurnamenRow>[] = [
  { header: "Nama Turnamen", value: (r) => r.namaturnamen },
  { header: "Tanggal", value: (r) => formatDate(r.tglturnamen) || "-" },
  { header: "Keterangan", value: (r) => r.keteranganturnamen || "-" },
];

export default function TurnamenGrid({ rows }: { rows: TurnamenRow[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<TurnamenRow | null>(null);
  const [deleting, setDeleting] = useState<TurnamenRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteError("");
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/turnamen/${deleting.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.ok) {
        setDeleting(null);
        router.refresh();
      } else if (data.reason === "has-list") {
        setDeleteError(
          "Turnamen masih dipakai di List Turnamen, jadi tidak bisa dihapus."
        );
      } else if (data.reason === "forbidden") {
        setDeleteError("Hanya pengelola yang boleh menghapus turnamen.");
      } else {
        setDeleteError("Gagal menghapus turnamen. Coba lagi.");
      }
    } catch {
      setDeleteError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<TurnamenRow>[] = [
    {
      key: "namaturnamen",
      header: "Nama Turnamen",
      sortValue: (r) => r.namaturnamen,
      render: (r) => (
        <span className="font-semibold text-bone">{r.namaturnamen}</span>
      ),
    },
    {
      key: "tglturnamen",
      header: "Tanggal",
      sortValue: (r) => (r.tglturnamen ? new Date(r.tglturnamen).getTime() : 0),
      render: (r) =>
        r.tglturnamen ? (
          <span className="text-bone/70">{formatDate(r.tglturnamen)}</span>
        ) : (
          <span className="text-bone/25">—</span>
        ),
    },
    {
      key: "keteranganturnamen",
      header: "Keterangan",
      render: (r) => r.keteranganturnamen || "—",
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
          [r.namaturnamen, r.keteranganturnamen ?? ""].join(" ")
        }
        searchPlaceholder="Cari nama atau keterangan turnamen..."
        emptyText="Belum ada data turnamen."
        minTableWidth="720px"
        selectable
        action={(filtered) => (
          <div className="flex items-center gap-2">
            <ReportButton
              title="Daftar Turnamen"
              columns={REPORT_COLUMNS}
              rows={filtered}
              summary={[
                { label: "Jumlah Turnamen", value: String(filtered.length) },
              ]}
            />
            <AddButton label="Tambah Turnamen" onClick={() => setAdding(true)} />
          </div>
        )}
      />

      {adding && (
        <TurnamenFormModal
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            router.refresh();
          }}
        />
      )}
      {editing && (
        <TurnamenFormModal
          turnamen={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Hapus Turnamen"
          message={
            <>
              Hapus turnamen{" "}
              <strong className="text-bone">{deleting.namaturnamen}</strong>?
              Tindakan ini tidak bisa dibatalkan.
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

/** Form turnamen dalam modal — dipakai untuk Tambah (tanpa `turnamen`) dan Edit. */
function TurnamenFormModal({
  turnamen,
  onClose,
  onSaved,
}: {
  turnamen?: TurnamenRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(turnamen);
  const [nama, setNama] = useState(turnamen?.namaturnamen ?? "");
  const [tgl, setTgl] = useState(
    turnamen ? dmyDateInput(turnamen.tglturnamen) : ""
  );
  const [keterangan, setKeterangan] = useState(
    turnamen?.keteranganturnamen ?? ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (nama.trim() === "") {
      setError("Nama turnamen wajib diisi.");
      return;
    }
    // Tanggal opsional; bila diisi harus valid (dd-mm-yyyy).
    const tglIso = idDateToIso(tgl);
    if (tgl.trim() !== "" && !tglIso) {
      setError("Tanggal turnamen tidak valid (format dd-mm-yyyy).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        isEdit ? `/api/turnamen/${turnamen!.id}` : "/api/turnamen",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nama, keterangan, tgl: tglIso }),
        }
      );
      const data = await res.json();
      if (data.ok) {
        onSaved();
      } else if (data.reason === "nama-exists") {
        setError("Nama turnamen sudah ada. Pilih nama lain.");
      } else if (data.reason === "forbidden") {
        setError("Hanya pengelola yang boleh mengelola turnamen.");
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
      title={isEdit ? "Edit Turnamen" : "Tambah Turnamen"}
      subtitle={isEdit ? turnamen!.namaturnamen : "Buat data turnamen baru."}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelClass}>
            Nama Turnamen <span className="text-pitch">*</span>
          </label>
          <input
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Mis. Turnamen U-12 Piala Merdeka"
            maxLength={200}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Tanggal Turnamen</label>
          <DateField value={tgl} onChange={setTgl} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Keterangan</label>
          <textarea
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Keterangan singkat (opsional)"
            rows={3}
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

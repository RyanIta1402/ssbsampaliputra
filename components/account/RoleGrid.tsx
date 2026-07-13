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

export type RoleRow = {
  id: string;
  nama: string;
  deskripsi: string | null;
  created_at: string;
  updated_at: string | Date | null;
};

/**
 * Grid daftar role (admin): pencarian, sort, pagination, plus CRUD lewat
 * modal — Tambah (POST /api/role), Edit (PATCH /api/role/[id]), dan Hapus
 * dengan dialog konfirmasi (DELETE).
 */
const REPORT_COLUMNS: ReportColumn<RoleRow>[] = [
  { header: "Nama", value: (r) => r.nama },
  { header: "Deskripsi", value: (r) => r.deskripsi || "-" },
  { header: "Dibuat", value: (r) => formatDate(r.created_at) },
];

export default function RoleGrid({ roles }: { roles: RoleRow[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<RoleRow | null>(null);
  const [deleting, setDeleting] = useState<RoleRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteError("");
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/role/${deleting.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        setDeleting(null);
        router.refresh();
      } else if (data.reason === "forbidden") {
        setDeleteError("Hanya admin yang boleh menghapus role.");
      } else {
        setDeleteError("Gagal menghapus role. Coba lagi.");
      }
    } catch {
      setDeleteError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<RoleRow>[] = [
    {
      key: "nama",
      header: "Nama",
      sortValue: (r) => r.nama,
      render: (r) => (
        <span
          className={
            "inline-block border px-2.5 py-1 text-xs font-bold uppercase tracking-wider " +
            (r.nama.toLowerCase() === "admin"
              ? "border-gold/40 text-gold"
              : "border-bone/15 text-bone")
          }
        >
          {r.nama}
        </span>
      ),
    },
    {
      key: "deskripsi",
      header: "Deskripsi",
      render: (r) => r.deskripsi || "—",
    },
    {
      key: "created_at",
      header: "Dibuat",
      sortValue: (r) => new Date(r.created_at).getTime(),
      render: (r) => <span className="text-bone/50">{formatDate(r.created_at)}</span>,
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
        rows={roles}
        columns={columns}
        getRowId={(r) => r.id}
        searchText={(r) => [r.nama, r.deskripsi ?? ""].join(" ")}
        searchPlaceholder="Cari nama atau deskripsi role..."
        emptyText="Belum ada role."
        minTableWidth="520px"
        selectable
        action={(filtered) => (
          <div className="flex items-center gap-2">
            <ReportButton
              title="Daftar Role"
              columns={REPORT_COLUMNS}
              rows={filtered}
            />
            <AddButton label="Tambah Role" onClick={() => setAdding(true)} />
          </div>
        )}
      />

      {adding && (
        <RoleFormModal
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            router.refresh();
          }}
        />
      )}
      {editing && (
        <RoleFormModal
          role={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Hapus Role"
          message={
            <>
              Hapus role <strong className="text-bone">{deleting.nama}</strong>?
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

/** Form role dalam modal — dipakai untuk Tambah (tanpa `role`) dan Edit. */
function RoleFormModal({
  role,
  onClose,
  onSaved,
}: {
  role?: RoleRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(role);
  const [nama, setNama] = useState(role?.nama ?? "");
  const [deskripsi, setDeskripsi] = useState(role?.deskripsi ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (nama.trim() === "") {
      setError("Nama role wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(isEdit ? `/api/role/${role!.id}` : "/api/role", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, deskripsi }),
      });
      const data = await res.json();
      if (data.ok) {
        onSaved();
      } else if (data.reason === "nama-exists") {
        setError("Nama role sudah ada. Pilih nama lain.");
      } else if (data.reason === "forbidden") {
        setError("Hanya admin yang boleh mengelola role.");
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
      title={isEdit ? "Edit Role" : "Tambah Role"}
      subtitle={isEdit ? role!.nama : "Buat data role baru."}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelClass}>
            Nama Role <span className="text-pitch">*</span>
          </label>
          <input
            required
            value={nama}
            onChange={(e) => setNama(e.target.value.toUpperCase())}
            placeholder="Mis. Pelatih, Bendahara"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Deskripsi</label>
          <textarea
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value.toUpperCase())}
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

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import DataGrid, { type Column } from "@/components/account/DataGrid";
import { KasFormModal, type KasRow } from "@/components/account/KasForm";
import ReportButton, { type ReportColumn } from "@/components/account/ReportButton";
import {
  ActionButtons,
  AddButton,
  ConfirmDialog,
  DeleteButton,
  EditButton,
  formatDate,
  formatRupiah,
} from "@/components/account/ui";

/** Grid pengeluaran / kas keluar (admin): CRUD penuh lewat modal. */
const REPORT_COLUMNS: ReportColumn<KasRow>[] = [
  { header: "Tanggal", value: (r) => formatDate(r.tgl) },
  { header: "Keterangan", value: (r) => r.keterangan || "-" },
  { header: "Nominal", value: (r) => formatRupiah(r.nominal), align: "right" },
];

export default function PengeluaranGrid({ rows }: { rows: KasRow[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<KasRow | null>(null);
  const [deleting, setDeleting] = useState<KasRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteError("");
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/pengeluaran/${deleting.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.ok) {
        setDeleting(null);
        router.refresh();
      } else if (data.reason === "forbidden") {
        setDeleteError("Hanya admin yang boleh menghapus pengeluaran.");
      } else {
        setDeleteError("Gagal menghapus pengeluaran. Coba lagi.");
      }
    } catch {
      setDeleteError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<KasRow>[] = [
    {
      key: "tgl",
      header: "Tanggal",
      sortValue: (r) => (r.tgl ? new Date(r.tgl).getTime() : 0),
      render: (r) => <span className="text-bone/70">{formatDate(r.tgl)}</span>,
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
      key: "nominal",
      header: "Nominal",
      sortValue: (r) => Number(r.nominal ?? 0),
      render: (r) => (
        <span className="font-semibold text-gold">{formatRupiah(r.nominal)}</span>
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
        searchText={(r) => r.keterangan ?? ""}
        searchPlaceholder="Cari keterangan..."
        emptyText="Belum ada data pengeluaran."
        minTableWidth="560px"
        selectable
        action={(filtered) => (
          <div className="flex items-center gap-2">
            <ReportButton
              title="Pengeluaran (Kas Keluar)"
              columns={REPORT_COLUMNS}
              rows={filtered}
              summary={[
                {
                  label: "Total Pengeluaran",
                  value: formatRupiah(
                    filtered.reduce((s, r) => s + Number(r.nominal ?? 0), 0)
                  ),
                },
              ]}
            />
            <AddButton label="Tambah" onClick={() => setAdding(true)} />
          </div>
        )}
      />

      {adding && (
        <KasFormModal
          endpoint="/api/pengeluaran"
          entityLabel="Pengeluaran"
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            router.refresh();
          }}
        />
      )}
      {editing && (
        <KasFormModal
          row={editing}
          endpoint="/api/pengeluaran"
          entityLabel="Pengeluaran"
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Hapus Pengeluaran"
          message={
            <>
              Hapus pengeluaran{" "}
              <strong className="text-bone">{deleting.keterangan}</strong>?
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

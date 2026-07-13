"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import DataGrid, { type Column, type SelectFilter } from "@/components/account/DataGrid";
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

/**
 * Grid penerimaan / kas masuk (admin). Baris yang berasal dari SPP
 * (`spp_id` terisi) ditandai "SPP" dan TIDAK bisa diedit/dihapus di sini —
 * dikelola lewat menu SPP agar tetap sinkron. Baris "Manual" bisa CRUD penuh.
 */
const REPORT_COLUMNS: ReportColumn<KasRow>[] = [
  { header: "Tanggal", value: (r) => formatDate(r.tgl) },
  { header: "Keterangan", value: (r) => r.keterangan || "-" },
  { header: "Sumber", value: (r) => (r.spp_id ? "SPP" : "Manual") },
  { header: "Nominal", value: (r) => formatRupiah(r.nominal), align: "right" },
];

export default function PenerimaanGrid({ rows }: { rows: KasRow[] }) {
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
      const res = await fetch(`/api/penerimaan/${deleting.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.ok) {
        setDeleting(null);
        router.refresh();
      } else if (data.reason === "dari-spp") {
        setDeleteError("Penerimaan dari SPP tidak bisa dihapus di sini.");
      } else if (data.reason === "forbidden") {
        setDeleteError("Hanya admin yang boleh menghapus penerimaan.");
      } else {
        setDeleteError("Gagal menghapus penerimaan. Coba lagi.");
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
        <span className="font-semibold text-pitch">{formatRupiah(r.nominal)}</span>
      ),
    },
    {
      key: "sumber",
      header: "Sumber",
      sortValue: (r) => (r.spp_id ? "SPP" : "Manual"),
      render: (r) =>
        r.spp_id ? (
          <span className="inline-block border border-gold/40 bg-gold/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gold">
            SPP
          </span>
        ) : (
          <span className="inline-block border border-bone/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-bone/50">
            Manual
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
      render: (r) =>
        r.spp_id ? (
          <div className="flex items-center justify-end">
            <span className="text-[11px] font-bold uppercase tracking-wider text-bone/30">
              🔒 Dari SPP
            </span>
          </div>
        ) : (
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

  const filters: SelectFilter<KasRow>[] = [
    {
      key: "sumber",
      label: "Sumber",
      options: [
        { value: "spp", label: "SPP" },
        { value: "manual", label: "Manual" },
      ],
      match: (r, v) => (v === "spp" ? r.spp_id != null : r.spp_id == null),
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
        filters={filters}
        emptyText="Belum ada data penerimaan."
        minTableWidth="640px"
        selectable
        action={(filtered) => (
          <div className="flex items-center gap-2">
            <ReportButton
              title="Penerimaan (Kas Masuk)"
              columns={REPORT_COLUMNS}
              rows={filtered}
              summary={[
                {
                  label: "Total Penerimaan",
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
          endpoint="/api/penerimaan"
          entityLabel="Penerimaan"
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
          endpoint="/api/penerimaan"
          entityLabel="Penerimaan"
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Hapus Penerimaan"
          message={
            <>
              Hapus penerimaan{" "}
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

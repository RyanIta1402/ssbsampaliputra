"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import DataGrid, { type Column, type SelectFilter } from "@/components/account/DataGrid";
import {
  FotoCell,
  PesertaDetailModal,
  PesertaFormModal,
  type PesertaRow,
} from "@/components/account/PesertaForm";
import ReportButton, { type ReportColumn } from "@/components/account/ReportButton";
import {
  ActionButtons,
  AddButton,
  CheckIcon,
  ConfirmDialog,
  DeleteButton,
  DetailButton,
  EditButton,
  formatDate,
} from "@/components/account/ui";
import StatusBadge from "@/components/auth/StatusBadge";
import { isoDateInput, tahunLahir } from "@/lib/date";
import { PENDAFTARAN_STATUSES } from "@/lib/peserta";
import { normalizeWa } from "@/lib/wa";

const STATUS_LABELS: Record<string, string> = {
  baru: "Baru",
  dihubungi: "Dihubungi",
  diterima: "Diterima",
  ditolak: "Ditolak",
};

/**
 * Grid data pendaftaran: pencarian, filter status & jenis kelamin, sort,
 * dan pagination. Admin dapat CRUD penuh lewat modal (Tambah via POST
 * /api/pendaftaran, Edit via PATCH /api/pendaftaran/[id], Hapus dengan
 * konfirmasi). Member hanya melihat detail pendaftaran miliknya.
 */
const REPORT_COLUMNS: ReportColumn<PesertaRow>[] = [
  { header: "Nama Lengkap", value: (r) => r.nama_lengkap },
  { header: "Panggilan", value: (r) => r.nama_panggilan || "-" },
  { header: "JK", value: (r) => r.jenis_kelamin || "-" },
  { header: "No. HP", value: (r) => r.no_hp },
  { header: "Sekolah", value: (r) => r.nama_sekolah || "-" },
  { header: "Kelas", value: (r) => r.kelas || "-" },
  { header: "Tgl Lahir", value: (r) => formatDate(r.tanggal_lahir) },
  { header: "Orang Tua", value: (r) => r.nama_orang_tua || "-" },
  { header: "Status", value: (r) => STATUS_LABELS[r.status] ?? r.status },
  { header: "Daftar", value: (r) => formatDate(r.created_at) },
];

export default function PendaftaranGrid({
  rows,
  isAdmin,
}: {
  rows: PesertaRow[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<PesertaRow | null>(null);
  const [viewing, setViewing] = useState<PesertaRow | null>(null);
  const [deleting, setDeleting] = useState<PesertaRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [approving, setApproving] = useState<PesertaRow | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const [approveError, setApproveError] = useState("");

  const confirmApprove = async () => {
    if (!approving) return;
    setApproveError("");
    setApproveLoading(true);
    try {
      const res = await fetch(`/api/pendaftaran/${approving.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaLengkap: approving.nama_lengkap,
          namaPanggilan: approving.nama_panggilan,
          jenisKelamin: approving.jenis_kelamin,
          tempatLahir: approving.tempat_lahir,
          tanggalLahir: isoDateInput(approving.tanggal_lahir),
          noHp: approving.no_hp,
          namaSekolah: approving.nama_sekolah,
          kelas: approving.kelas,
          beratBadan: approving.berat_badan,
          tinggiBadan: approving.tinggi_badan,
          golonganDarah: approving.golongan_darah,
          namaOrangTua: approving.nama_orang_tua,
          status: "diterima",
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setApproving(null);
        router.refresh();
      } else if (data.reason === "forbidden") {
        setApproveError("Hanya admin yang boleh menerima pendaftaran.");
      } else {
        setApproveError("Gagal menerima pendaftaran. Coba lagi.");
      }
    } catch {
      setApproveError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setApproveLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteError("");
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/pendaftaran/${deleting.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.ok) {
        setDeleting(null);
        router.refresh();
      } else if (data.reason === "forbidden") {
        setDeleteError("Hanya admin yang boleh menghapus pendaftaran.");
      } else {
        setDeleteError("Gagal menghapus pendaftaran. Coba lagi.");
      }
    } catch {
      setDeleteError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<PesertaRow>[] = [
    {
      key: "nama",
      header: "Nama",
      sortValue: (r) => r.nama_lengkap,
      render: (r) => (
        <div className="flex items-center gap-3">
          <FotoCell row={r} />
          <div>
            <div className="font-semibold text-bone">{r.nama_lengkap}</div>
            <div className="text-xs text-bone/40">
              {[r.nama_panggilan, r.jenis_kelamin].filter(Boolean).join(" · ") ||
                "—"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "no_hp",
      header: "No. WhatsApp",
      render: (r) => (
        <a
          href={`https://wa.me/${normalizeWa(r.no_hp)}`}
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-pitch"
        >
          {r.no_hp}
        </a>
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
      key: "created_at",
      header: "Tanggal",
      sortValue: (r) => new Date(r.created_at).getTime(),
      render: (r) => (
        <span className="text-bone/50">{formatDate(r.created_at)}</span>
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
      key: "status",
      header: "Status",
      sortValue: (r) => r.status,
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "aksi",
      header: "Aksi",
      headerClassName: "text-right",
      render: (r) => (
        <ActionButtons>
          <DetailButton onClick={() => setViewing(r)} />
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => {
                  setApproveError("");
                  setApproving(r);
                }}
                title="Terima"
                aria-label="Terima"
                className="border border-emerald-500/40 p-1.5 text-emerald-400 transition-colors hover:bg-emerald-500/10"
              >
                <CheckIcon />
              </button>
              <EditButton onClick={() => setEditing(r)} />
              <DeleteButton
                onClick={() => {
                  setDeleteError("");
                  setDeleting(r);
                }}
              />
            </>
          )}
        </ActionButtons>
      ),
    },
  ];

  const filters: SelectFilter<PesertaRow>[] = [
    {
      key: "status",
      label: "Status",
      options: PENDAFTARAN_STATUSES.map((s) => ({
        value: s,
        label: STATUS_LABELS[s],
      })),
      match: (r, v) => r.status === v,
    },
    {
      key: "tahun",
      label: "Tahun Lahir",
      options: [
        ...new Set(rows.map((r) => tahunLahir(r.tanggal_lahir)).filter(Boolean)),
      ]
        .sort((a, b) => Number(b) - Number(a))
        .map((y) => ({ value: y, label: y })),
      match: (r, v) => tahunLahir(r.tanggal_lahir) === v,
    },
    {
      key: "jk",
      label: "JK",
      options: [
        { value: "Laki-laki", label: "Laki-laki" },
        { value: "Perempuan", label: "Perempuan" },
      ],
      match: (r, v) => r.jenis_kelamin === v,
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
            r.nama_lengkap,
            r.nama_panggilan ?? "",
            r.no_hp,
            r.nama_sekolah ?? "",
            r.kelas ?? "",
            r.nama_orang_tua ?? "",
          ].join(" ")
        }
        searchPlaceholder="Cari nama, sekolah, no. HP..."
        filters={filters}
        emptyText="Belum ada data pendaftaran."
        minTableWidth="820px"
        selectable
        action={(filtered) => (
          <div className="flex items-center gap-2">
            <ReportButton
              title="Data Pendaftaran"
              columns={REPORT_COLUMNS}
              rows={filtered}
            />
            {isAdmin && (
              <AddButton label="Tambah" onClick={() => setAdding(true)} />
            )}
          </div>
        )}
      />

      {adding && (
        <PesertaFormModal
          endpoint="/api/pendaftaran"
          entityLabel="Pendaftaran"
          statuses={PENDAFTARAN_STATUSES}
          statusLabels={STATUS_LABELS}
          defaultStatus="baru"
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            router.refresh();
          }}
        />
      )}
      {editing && (
        <PesertaFormModal
          row={editing}
          endpoint="/api/pendaftaran"
          entityLabel="Pendaftaran"
          statuses={PENDAFTARAN_STATUSES}
          statusLabels={STATUS_LABELS}
          defaultStatus="baru"
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
      {viewing && (
        <PesertaDetailModal
          row={viewing}
          statusLabels={STATUS_LABELS}
          onClose={() => setViewing(null)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Hapus Pendaftaran"
          message={
            <>
              Hapus pendaftaran{" "}
              <strong className="text-bone">{deleting.nama_lengkap}</strong>?
              Tindakan ini tidak bisa dibatalkan.
            </>
          }
          loading={deleteLoading}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
      {approving && (
        <ConfirmDialog
          title="Terima Pendaftaran"
          message={
            <>
              Terima pendaftaran{" "}
              <strong className="text-bone">{approving.nama_lengkap}</strong>?
              Data akan dipindahkan ke daftar Siswa dan dihapus dari
              Pendaftaran. Tindakan ini tidak bisa dibatalkan.
            </>
          }
          confirmLabel="Terima"
          loadingLabel="Memindahkan..."
          tone="success"
          loading={approveLoading}
          error={approveError}
          onConfirm={confirmApprove}
          onCancel={() => setApproving(null)}
        />
      )}
    </>
  );
}

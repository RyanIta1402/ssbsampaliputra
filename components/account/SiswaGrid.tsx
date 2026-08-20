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
  TagihanButton,
  TagihanIuranModal,
} from "@/components/account/TagihanIuran";
import {
  ActionButtons,
  actionIconClass,
  AddButton,
  CheckIcon,
  ConfirmDialog,
  DeleteButton,
  DetailButton,
  EditButton,
  formatDate,
  WaButton,
} from "@/components/account/ui";
import { bulanLabel, isoDateInput, tahunLahir } from "@/lib/date";
import { SISWA_STATUSES } from "@/lib/peserta";
import { normalizeWa } from "@/lib/wa";

const STATUS_LABELS: Record<string, string> = {
  siswa: "Siswa",
  aktif: "Aktif",
  nonaktif: "Nonaktif",
  lulus: "Lulus",
};

const STATUS_BADGE: Record<string, string> = {
  siswa: "border-pitch/40 bg-pitch/15 text-pitch",
  aktif: "border-pitch/40 bg-pitch/15 text-pitch",
  nonaktif: "border-bone/25 bg-bone/10 text-bone",
  lulus: "border-gold/30 bg-gold/15 text-gold",
};

/** Ikon "nonaktifkan" (lingkaran bergaris) — pasangan CheckIcon untuk toggle. */
function BanIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m4.9 4.9 14.2 14.2" />
    </svg>
  );
}

function SiswaStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center border px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest ${
        STATUS_BADGE[status] ?? "border-bone/25 bg-bone/10 text-bone"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

/**
 * Grid data siswa (admin): pencarian, filter status & jenis kelamin, sort,
 * pagination, plus CRUD penuh lewat modal — Tambah (POST /api/siswa),
 * Edit (PATCH /api/siswa/[id]), Detail, dan Hapus dengan konfirmasi.
 */
const REPORT_COLUMNS: ReportColumn<PesertaRow>[] = [
  { header: "NIS", value: (r) => r.nis || "-" },
  { header: "Nama Lengkap", value: (r) => r.nama_lengkap },
  { header: "Panggilan", value: (r) => r.nama_panggilan || "-" },
  { header: "JK", value: (r) => r.jenis_kelamin || "-" },
  { header: "No. HP", value: (r) => r.no_hp },
  { header: "Sekolah", value: (r) => r.nama_sekolah || "-" },
  { header: "Kelas", value: (r) => r.kelas || "-" },
  { header: "Tgl Lahir", value: (r) => formatDate(r.tanggal_lahir) },
  { header: "Status", value: (r) => STATUS_LABELS[r.status] ?? r.status },
];

/**
 * Baris dari view `v_siswa`.
 *
 * - `bulan_tagihan_terakhir` berasal dari view dan bersifat GLOBAL (bulan
 *   tagihan terakhir yang ada di tabel spp, sama untuk semua siswa aktif),
 *   jadi hanya untuk ditampilkan di kolom.
 * - `spp_terakhir` dihitung per siswa dan dipakai surat pemberitahuan iuran.
 */
export type SiswaRow = PesertaRow & {
  bulan_tagihan_terakhir?: string | Date | null;
  spp_terakhir?: string | Date | null;
};

export default function SiswaGrid({ rows }: { rows: SiswaRow[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<PesertaRow | null>(null);
  const [viewing, setViewing] = useState<PesertaRow | null>(null);
  // Surat pemberitahuan iuran (PDF + pesan WA) untuk satu siswa.
  const [tagihan, setTagihan] = useState<SiswaRow | null>(null);
  const [deleting, setDeleting] = useState<PesertaRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  // Toggle status aktif ↔ nonaktif lewat tombol centang di kolom Aksi.
  const [toggling, setToggling] = useState<PesertaRow | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [toggleError, setToggleError] = useState("");
  // Status tujuan saat tombol ditekan: aktif → nonaktif, selain itu → aktif.
  const toggleTarget = toggling?.status === "aktif" ? "nonaktif" : "aktif";

  const confirmToggle = async () => {
    if (!toggling) return;
    setToggleError("");
    setToggleLoading(true);
    try {
      const res = await fetch(`/api/siswa/${toggling.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaLengkap: toggling.nama_lengkap,
          namaPanggilan: toggling.nama_panggilan,
          jenisKelamin: toggling.jenis_kelamin,
          tempatLahir: toggling.tempat_lahir,
          tanggalLahir: isoDateInput(toggling.tanggal_lahir),
          noHp: toggling.no_hp,
          namaSekolah: toggling.nama_sekolah,
          kelas: toggling.kelas,
          beratBadan: toggling.berat_badan,
          tinggiBadan: toggling.tinggi_badan,
          golonganDarah: toggling.golongan_darah,
          namaOrangTua: toggling.nama_orang_tua,
          status: toggleTarget,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setToggling(null);
        router.refresh();
      } else if (data.reason === "forbidden") {
        setToggleError("Hanya admin yang boleh mengubah status siswa.");
      } else {
        setToggleError("Gagal mengubah status siswa. Coba lagi.");
      }
    } catch {
      setToggleError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setToggleLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteError("");
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/siswa/${deleting.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        setDeleting(null);
        router.refresh();
      } else if (data.reason === "forbidden") {
        setDeleteError("Hanya admin yang boleh menghapus siswa.");
      } else if (data.reason === "has-spp") {
        setDeleteError(
          "Siswa memiliki riwayat pembayaran SPP, jadi tidak bisa dihapus."
        );
      } else {
        setDeleteError("Gagal menghapus siswa. Coba lagi.");
      }
    } catch {
      setDeleteError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<SiswaRow>[] = [
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
        <div className="flex items-center gap-3">
          <FotoCell row={r} />
          <div>
            <div className="whitespace-nowrap font-semibold text-bone">
              {r.nama_lengkap}
            </div>
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
          className="whitespace-nowrap transition-colors hover:text-pitch"
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
      key: "tanggal_lahir",
      header: "Tgl Lahir",
      sortValue: (r) =>
        r.tanggal_lahir ? new Date(r.tanggal_lahir).getTime() : 0,
      render: (r) => (
        <span className="whitespace-nowrap text-bone/50">
          {formatDate(r.tanggal_lahir)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortValue: (r) => r.status,
      render: (r) => <SiswaStatusBadge status={r.status} />,
    },
    {
      key: "updated_at",
      header: "Tgl Ubah",
      sortValue: (r) => (r.updated_at ? new Date(r.updated_at).getTime() : 0),
      render: (r) =>
        r.updated_at ? (
          <span className="whitespace-nowrap text-bone/50">
            {formatDate(r.updated_at)}
          </span>
        ) : (
          <span className="text-bone/25">—</span>
        ),
    },
    {
      key: "bulan_tagihan_terakhir",
      header: "Last Tagihan",
      sortValue: (r) =>
        r.bulan_tagihan_terakhir
          ? new Date(r.bulan_tagihan_terakhir).getTime()
          : 0,
      render: (r) =>
        r.bulan_tagihan_terakhir ? (
          <span className="whitespace-nowrap text-bone/50">
            {bulanLabel(r.bulan_tagihan_terakhir)}
          </span>
        ) : (
          <span className="text-bone/25">—</span>
        ),
    },
    {
      key: "aksi",
      header: "Aksi",
      headerClassName: "text-right",
      render: (r) => (
        <ActionButtons cols={3}>
          <TagihanButton onClick={() => setTagihan(r)} />
          <WaButton phone={r.no_hp} />
          <DetailButton onClick={() => setViewing(r)} />
          <button
            type="button"
            onClick={() => {
              setToggleError("");
              setToggling(r);
            }}
            title={r.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
            aria-label={r.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
            className={`${actionIconClass} ${
              r.status === "aktif"
                ? "border-gold/40 text-gold hover:bg-gold/10"
                : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            {r.status === "aktif" ? <BanIcon /> : <CheckIcon />}
          </button>
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

  const filters: SelectFilter<SiswaRow>[] = [
    {
      key: "status",
      label: "Status",
      options: SISWA_STATUSES.map((s) => ({
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
            r.nis ?? "",
            r.nama_lengkap,
            r.nama_panggilan ?? "",
            r.no_hp,
            r.nama_sekolah ?? "",
            r.kelas ?? "",
            r.nama_orang_tua ?? "",
          ].join(" ")
        }
        searchPlaceholder="Cari NIS, nama, sekolah, no. HP..."
        filters={filters}
        emptyText="Belum ada data siswa."
        minTableWidth="1060px"
        selectable
        action={(filtered) => (
          <div className="flex items-center gap-2">
            <ReportButton
              title="Daftar Siswa"
              columns={REPORT_COLUMNS}
              rows={filtered}
            />
            <AddButton label="Tambah Siswa" onClick={() => setAdding(true)} />
          </div>
        )}
      />

      {adding && (
        <PesertaFormModal
          endpoint="/api/siswa"
          entityLabel="Siswa"
          statuses={SISWA_STATUSES}
          statusLabels={STATUS_LABELS}
          defaultStatus="aktif"
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
          endpoint="/api/siswa"
          entityLabel="Siswa"
          statuses={SISWA_STATUSES}
          statusLabels={STATUS_LABELS}
          defaultStatus="aktif"
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
      {tagihan && (
        <TagihanIuranModal row={tagihan} onClose={() => setTagihan(null)} />
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
          title="Hapus Siswa"
          message={
            <>
              Hapus siswa{" "}
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
      {toggling && (
        <ConfirmDialog
          title={toggleTarget === "aktif" ? "Aktifkan Siswa" : "Nonaktifkan Siswa"}
          message={
            <>
              Ubah status{" "}
              <strong className="text-bone">{toggling.nama_lengkap}</strong>{" "}
              menjadi{" "}
              <strong className="text-bone">
                {toggleTarget === "aktif" ? "Aktif" : "Nonaktif"}
              </strong>
              ?
            </>
          }
          confirmLabel={toggleTarget === "aktif" ? "Aktifkan" : "Nonaktifkan"}
          loadingLabel="Menyimpan..."
          tone={toggleTarget === "aktif" ? "success" : "danger"}
          loading={toggleLoading}
          error={toggleError}
          onConfirm={confirmToggle}
          onCancel={() => setToggling(null)}
        />
      )}
    </>
  );
}

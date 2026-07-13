"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Elemen UI bersama untuk halaman pengelolaan (grid & form CRUD):
 * kelas input/label seragam, format tanggal Indonesia, Modal, dan
 * dialog konfirmasi hapus.
 */

export const fieldClass =
  "w-full border border-bone/15 bg-coal px-4 py-3 text-bone outline-none transition-colors placeholder:text-bone/30 focus:border-pitch";
export const labelClass =
  "mb-2 block font-body text-xs font-bold uppercase tracking-widest text-bone/50";

// Formatter murni tinggal di modul netral (lib/format) agar bisa dipanggil dari
// Server Component. Di-re-export di sini demi kompatibilitas import lama yang
// mengambil formatDate/formatRupiah/formatRibuan dari "@/components/account/ui".
export { formatDate, formatRupiah, formatRibuan } from "@/lib/format";

/**
 * Modal generik: menutup saat klik latar atau menekan Escape.
 * `wide` untuk form dua kolom (mis. form siswa/pendaftaran).
 */
export function Modal({
  title,
  subtitle,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className={`max-h-[90vh] w-full overflow-y-auto border border-bone/15 bg-ink shadow-xl shadow-black/50 ${
          wide ? "max-w-2xl" : "max-w-md"
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-bone/10 bg-ink px-6 py-4">
          <div>
            <h2 className="font-display text-xl uppercase tracking-wide text-bone">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-sm text-bone/50">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="text-2xl leading-none text-bone/50 transition-colors hover:text-bone"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Ikon & tombol aksi grid — dipakai seragam di seluruh modul (pola
 * pendaftaran): tombol aksi berupa ikon, bukan teks.
 * ------------------------------------------------------------------ */

// Ikon (inline SVG, mewarisi warna dari tombol via currentColor).
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

/** Detail — ikon mata. */
export function EyeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/** Terima — ikon centang. */
export function CheckIcon() {
  return (
    <svg {...iconProps} strokeWidth={2.5}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** Edit — ikon pensil. */
export function PencilIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

/** Hapus — ikon tempat sampah. */
export function TrashIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

/** Tambah — ikon plus. */
export function PlusIcon() {
  return (
    <svg {...iconProps} strokeWidth={2.5}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

/** Bungkus tombol-tombol aksi ikon di kolom "Aksi" (rata kanan). */
export function ActionButtons({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-1.5">{children}</div>
  );
}

/** Tombol aksi ikon: Detail (mata). */
export function DetailButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Detail"
      aria-label="Detail"
      className="border border-bone/20 p-1.5 text-bone/70 transition-colors hover:border-bone/50 hover:text-bone"
    >
      <EyeIcon />
    </button>
  );
}

/** Tombol aksi ikon: Edit (pensil). */
export function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Edit"
      aria-label="Edit"
      className="border border-bone/20 p-1.5 text-bone/70 transition-colors hover:border-pitch hover:text-pitch"
    >
      <PencilIcon />
    </button>
  );
}

/** Tombol aksi ikon: Hapus (tempat sampah). Bisa dinonaktifkan (mis. akun sendiri). */
export function DeleteButton({
  onClick,
  disabled = false,
  title = "Hapus",
}: {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label="Hapus"
      className="border border-red-500/40 p-1.5 text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30"
    >
      <TrashIcon />
    </button>
  );
}

/** Tombol "Tambah" seragam di kanan atas grid (ikon plus + label). */
export function AddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 bg-pitch px-4 py-2.5 font-body text-xs font-bold uppercase tracking-widest text-ink transition-all hover:bg-gold"
    >
      <PlusIcon /> {label}
    </button>
  );
}

const CONFIRM_TONE_CLASS = {
  danger:
    "border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20",
  success:
    "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
} as const;

/** Dialog konfirmasi aksi (pengganti window.confirm) — dipakai untuk hapus & aksi lain. */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Hapus",
  loadingLabel = "Menghapus...",
  tone = "danger",
  loading = false,
  error = "",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  loadingLabel?: string;
  tone?: keyof typeof CONFIRM_TONE_CLASS;
  loading?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="text-sm text-bone/70">{message}</div>
      {error && (
        <p className="mt-3 text-sm font-semibold text-red-400">{error}</p>
      )}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-bone/20 py-3 font-body text-xs font-bold uppercase tracking-widest text-bone/70 transition-colors hover:border-bone/40 hover:text-bone"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 border py-3 font-body text-xs font-bold uppercase tracking-widest transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${CONFIRM_TONE_CLASS[tone]}`}
        >
          {loading ? loadingLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

"use client";

import { useEffect, type ReactNode } from "react";

import { isValidWa, normalizeWa } from "@/lib/wa";

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

/**
 * Bungkus tombol-tombol aksi ikon di kolom "Aksi" (rata kanan).
 *
 * `cols` menyusun tombol jadi kisi dengan jumlah kolom tersebut, mis. 6 tombol
 * dengan `cols={3}` menjadi dua baris berisi tiga. Dipakai saat tombolnya
 * banyak (daftar siswa) agar kolom Aksi tidak melebar dan menyempitkan kolom
 * di sebelahnya. Kisi itu dibungkus panel bergaris tipis supaya terbaca sebagai
 * satu kesatuan dan tidak tampak menempel ke tepi tabel.
 *
 * Tanpa `cols`, semua tombol berjajar satu baris tanpa panel — bentuk yang
 * dipakai seluruh grid lain.
 */
export function ActionButtons({
  children,
  cols,
}: {
  children: ReactNode;
  cols?: number;
}) {
  if (!cols) {
    return (
      <div className="flex items-center justify-end gap-1.5">{children}</div>
    );
  }
  return (
    <div
      className="ml-auto grid w-fit gap-2 border border-bone/10 bg-coal/50 p-2"
      style={{ gridTemplateColumns: `repeat(${cols}, auto)` }}
    >
      {children}
    </div>
  );
}

/**
 * Kelas dasar tombol aksi ikon: kotak 32x32 dengan ikon dipusatkan.
 *
 * Ukuran & `inline-flex` WAJIB eksplisit karena kontrolnya campuran
 * `<button>`, `<a>`, dan `<span>`: tanpa ini, SVG duduk di garis baseline teks
 * sehingga tiap tombol punya tinggi berbeda dan barisnya terlihat tidak rata —
 * paling kentara saat tombol disusun dua baris di daftar siswa.
 */
export const actionIconClass =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center border transition-colors";

/** Tombol aksi ikon: Detail (mata). */
export function DetailButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Detail"
      aria-label="Detail"
      className={`${actionIconClass} border-bone/20 text-bone/70 hover:border-bone/50 hover:text-bone`}
    >
      <EyeIcon />
    </button>
  );
}

/** WhatsApp — ikon logo resmi (pakai fill, bukan stroke seperti ikon lain). */
export function WaIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

/**
 * Tombol aksi ikon: kirim WhatsApp ke nomor yang terdaftar di baris tersebut.
 * Membuka wa.me di tab baru; `message` opsional untuk pesan terisi otomatis.
 * Bila nomor kosong/format tidak valid, tombol tampil nonaktif agar posisi
 * kolom Aksi tetap rata antar baris.
 */
export function WaButton({
  phone,
  message,
  title = "Kirim WhatsApp",
}: {
  phone?: string | null;
  message?: string;
  title?: string;
}) {
  const base = actionIconClass;
  if (!isValidWa(phone ?? "")) {
    return (
      <span
        title="Nomor WhatsApp tidak valid"
        aria-label="Nomor WhatsApp tidak valid"
        className={`${base} cursor-not-allowed border-bone/15 text-bone/20`}
      >
        <WaIcon />
      </span>
    );
  }
  const href = `https://wa.me/${normalizeWa(phone ?? "")}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={title}
      aria-label={title}
      className={`${base} border-pitch/40 text-pitch hover:bg-pitch/10`}
    >
      <WaIcon />
    </a>
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
      className={`${actionIconClass} border-bone/20 text-bone/70 hover:border-pitch hover:text-pitch`}
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
      className={`${actionIconClass} border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30`}
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

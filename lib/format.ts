/**
 * Format tampilan bersama (tanggal & mata uang) — modul netral tanpa
 * "use client", jadi aman dipakai baik di Server Component maupun Client
 * Component. (Bila diletakkan di modul "use client", ekspornya berubah jadi
 * client reference dan tak bisa dipanggil dari server → "is not a function".)
 */

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Format angka menjadi Rupiah, mis. 150000 -> "Rp 150.000". */
export function formatRupiah(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  return "Rp " + n.toLocaleString("id-ID");
}

/**
 * Format nilai (angka/teks) menjadi string berpemisah ribuan (Indonesia),
 * mis. 25000 -> "25.000". Untuk nilai input uang di form (tanpa awalan "Rp").
 * Mengembalikan string kosong bila tak ada digit.
 */
export function formatRibuan(value: string | number): string {
  const digits = String(value).replace(/[^\d]/g, "");
  if (digits === "") return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

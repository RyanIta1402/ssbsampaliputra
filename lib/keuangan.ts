/**
 * Util bersama fitur keuangan (SPP, Penerimaan, Pengeluaran).
 * Fungsi murni, server-safe; dipakai route API. Jangan impor ke komponen
 * client (cukup pakai formatRupiah dari components/account/ui untuk tampilan).
 */
import { bulanLabel } from "@/lib/date";

/**
 * Validasi tanggal ISO `yyyy-mm-dd` (dari `<input type="date">`).
 * Mengembalikan string ISO bila valid, atau null bila kosong/format salah.
 */
export function parseIsoDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(v + "T00:00:00Z");
  return Number.isNaN(d.getTime()) ? null : v;
}

/**
 * Parse nominal uang (Rupiah) menjadi bilangan bulat >= 0. Mengabaikan
 * pemisah ribuan/karakter non-digit (mis. "Rp 150.000" -> 150000).
 * Mengembalikan null bila tidak ada digit sama sekali.
 */
export function parseUang(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? Math.round(value) : null;
  }
  if (typeof value !== "string") return null;
  const digits = value.replace(/[^\d]/g, "");
  if (digits === "") return null;
  const n = Number(digits);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/**
 * Keterangan default untuk penerimaan hasil pembayaran SPP. `bulan` kini
 * bertipe date (ISO string / Date) → diformat mis. "SPP Januari 2026".
 */
export function sppKeterangan(bulan: string | Date | null): string {
  const b = bulanLabel(bulan);
  return b ? `SPP ${b}` : "SPP";
}

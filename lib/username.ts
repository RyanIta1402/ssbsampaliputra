/**
 * Utilitas "nama user" (username) untuk login. Fungsi murni tanpa
 * dependency, aman diimpor di komponen client maupun route handler.
 */

/** Menormalkan username: buang spasi di tepi & jadikan huruf kecil. */
export function normalizeUsername(input: string): string {
  return (input || "").trim().toLowerCase();
}

/**
 * True bila username valid: 3–30 karakter, hanya huruf kecil, angka,
 * titik, garis bawah, atau strip (tanpa spasi/karakter lain).
 */
export function isValidUsername(input: string): boolean {
  return /^[a-z0-9._-]{3,30}$/.test(normalizeUsername(input));
}

/**
 * Utilitas nomor WhatsApp (dipakai di sisi client & server).
 * Fungsi murni tanpa dependency, aman diimpor di komponen client maupun
 * route handler.
 */

/**
 * Menormalkan input nomor menjadi format internasional tanpa tanda "+",
 * mis. "0812-3456-7890" → "6281234567890". Berguna untuk validasi dan
 * membangun tautan wa.me.
 */
export function normalizeWa(input: string): string {
  const d = (input || "").replace(/\D/g, "");
  if (d.startsWith("62")) return d;
  if (d.startsWith("0")) return "62" + d.slice(1);
  if (d.startsWith("8")) return "62" + d;
  return d;
}

/**
 * True bila nomor tampak seperti nomor HP/WhatsApp Indonesia yang valid.
 * Catatan: ini hanya memeriksa FORMAT. Memastikan sebuah nomor benar-benar
 * terdaftar/aktif di WhatsApp memerlukan WhatsApp Business API.
 */
export function isValidWa(input: string): boolean {
  // 62 + prefix seluler "8" + 6..11 digit  →  total 9..14 digit
  return /^628\d{6,11}$/.test(normalizeWa(input));
}

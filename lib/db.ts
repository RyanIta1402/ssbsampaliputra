import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Lapisan akses database Neon (PostgreSQL).
 *
 * Aman saat DATABASE_URL belum diisi: `isDbConfigured` bernilai false
 * sehingga fitur yang membutuhkan DB bisa "degrade" dengan rapi tanpa
 * membuat aplikasi crash — pola yang sama seperti integrasi Sanity.
 *
 * Modul ini HANYA boleh dipakai di sisi server (route handler / server
 * component / server action). Jangan diimpor ke komponen client.
 */
export const isDbConfigured = Boolean(process.env.DATABASE_URL);

let cached: NeonQueryFunction<false, false> | null = null;

/**
 * Mengambil fungsi query Neon (dipakai sebagai tagged template, mis.
 * `await sql\`select * from users\``). Melempar error yang jelas bila
 * DATABASE_URL belum diisi.
 */
export function getSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL belum diisi. Isi di .env.local — lihat NEON_SETUP.md."
    );
  }
  if (!cached) cached = neon(url);
  return cached;
}

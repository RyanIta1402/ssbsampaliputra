import { isValidWa } from "@/lib/wa";

/**
 * Validasi body untuk CRUD data anak (tabel `pendaftaran` & `siswa` —
 * keduanya memakai kolom yang sama). Dipakai oleh route API admin.
 */

/** Status pendaftaran (mengikuti CHECK constraint di db/schema.sql). */
export const PENDAFTARAN_STATUSES = [
  "baru",
  "dihubungi",
  "diterima",
  "ditolak",
] as const;

/**
 * Status siswa. "siswa" dipakai untuk data hasil transfer otomatis dari
 * pendaftaran yang diterima.
 */
export const SISWA_STATUSES = ["siswa", "aktif", "nonaktif", "lulus"] as const;

export type PesertaData = {
  namaLengkap: string;
  namaPanggilan: string | null;
  jenisKelamin: string | null;
  tempatLahir: string | null;
  /** ISO `yyyy-mm-dd`, atau null bila kosong/tidak valid. */
  tanggalLahir: string | null;
  noHp: string;
  namaSekolah: string | null;
  kelas: string | null;
  beratBadan: string | null;
  tinggiBadan: string | null;
  golonganDarah: string | null;
  namaOrangTua: string | null;
  /**
   * Foto (data URL): string = ganti, null = hapus,
   * undefined = field tak dikirim → jangan ubah nilai lama.
   */
  foto: string | null | undefined;
};

// Batas ukuran data URL foto (~1,1 MB) — sama dengan form pendaftaran publik.
const MAX_FOTO_CHARS = 1_500_000;

/**
 * Mengambil & memvalidasi field data anak dari body request.
 * Nama lengkap dan No WhatsApp (format WA Indonesia) wajib.
 */
export function parsePeserta(
  body: Record<string, unknown>
): { ok: true; data: PesertaData } | { ok: false } {
  const str = (key: string): string | null => {
    const val = body[key];
    return typeof val === "string" && val.trim() !== "" ? val.trim() : null;
  };

  const namaLengkap = str("namaLengkap");
  const noHp = str("noHp");
  if (!namaLengkap || !noHp || !isValidWa(noHp)) return { ok: false };

  const rawTanggal = str("tanggalLahir");
  const tanggalLahir =
    rawTanggal && /^\d{4}-\d{2}-\d{2}$/.test(rawTanggal) ? rawTanggal : null;

  let foto: string | null | undefined;
  if (!("foto" in body)) {
    foto = undefined;
  } else if (
    typeof body.foto === "string" &&
    body.foto.startsWith("data:image/") &&
    body.foto.length <= MAX_FOTO_CHARS
  ) {
    foto = body.foto;
  } else {
    foto = null;
  }

  return {
    ok: true,
    data: {
      namaLengkap,
      namaPanggilan: str("namaPanggilan"),
      jenisKelamin: str("jenisKelamin"),
      tempatLahir: str("tempatLahir"),
      tanggalLahir,
      noHp,
      namaSekolah: str("namaSekolah"),
      kelas: str("kelas"),
      beratBadan: str("beratBadan"),
      tinggiBadan: str("tinggiBadan"),
      golonganDarah: str("golonganDarah"),
      namaOrangTua: str("namaOrangTua"),
      foto,
    },
  };
}

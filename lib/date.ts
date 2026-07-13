/**
 * Utilitas tanggal untuk formulir pendaftaran (fungsi murni tanpa dependency).
 *
 * Formulir mengirim tanggal lahir dalam format Indonesia `dd-mm-yyyy`
 * (mis. "15-08-2010"). Kolom `tanggal_lahir` di Neon kini bertipe `date` dan
 * field Sanity juga bertipe `date`, yang keduanya mengharapkan format ISO
 * `yyyy-mm-dd`. Fungsi ini mengonversi dari format formulir ke ISO.
 */

/**
 * Mengubah tanggal format Indonesia `dd-mm-yyyy` menjadi ISO `yyyy-mm-dd`.
 * Input yang sudah ISO `yyyy-mm-dd` (mis. dari `<input type="date">` pada
 * form admin) diterima apa adanya setelah divalidasi. Mengembalikan `null`
 * bila input kosong, formatnya salah, atau tanggalnya tidak nyata (mis.
 * "31-02-2010") — supaya nilai tak valid tidak menggagalkan seluruh proses
 * simpan ke kolom bertipe `date`.
 */
export function idDateToIso(value: string | null | undefined): string | null {
  if (!value) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  const m = iso
    ? [iso[0], iso[3], iso[2], iso[1]]
    : /^(\d{2})-(\d{2})-(\d{4})$/.exec(value.trim());
  if (!m) return null;

  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  // Pastikan tanggalnya benar-benar ada (tolak mis. 31-02 atau 29-02 non-kabisat).
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day
  ) {
    return null;
  }

  return `${m[3]}-${m[2]}-${m[1]}`;
}

/**
 * Menormalkan nilai tanggal dari database menjadi string ISO `yyyy-mm-dd`
 * untuk `<input type="date">`. Driver Neon bisa mengembalikan kolom `date`
 * sebagai objek `Date` (bukan string), jadi keduanya ditangani. Mengembalikan
 * string kosong bila nilai kosong/tidak valid.
 */
export function isoDateInput(value: string | Date | null | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  if (Number.isNaN(value.getTime())) return "";
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Menormalkan nilai tanggal menjadi format Indonesia `dd-mm-yyyy` untuk
 * ditampilkan di input teks (mis. Tanggal Bayar SPP). Kebalikan dari
 * `idDateToIso`. Mengembalikan string kosong bila kosong/tidak valid.
 */
export function dmyDateInput(value: string | Date | null | undefined): string {
  const iso = isoDateInput(value); // "yyyy-mm-dd" atau ""
  if (!iso) return "";
  return `${iso.slice(8, 10)}-${iso.slice(5, 7)}-${iso.slice(0, 4)}`;
}

/**
 * Masking input tanggal ke format `dd-mm-yyyy` saat diketik: ambil digit,
 * batasi 8 angka, lalu sisipkan tanda hubung (dd-mm-yyyy). Dipakai di input
 * teks form (SPP, Penerimaan, Pengeluaran).
 */
export function maskDmy(value: string): string {
  const d = value.replace(/[^\d]/g, "").slice(0, 8);
  const parts = [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(
    (p) => p !== ""
  );
  return parts.join("-");
}

/**
 * Mengambil tahun (`yyyy`) dari nilai tanggal database — dipakai untuk filter
 * "Tahun Lahir" di grid Pendaftaran & Siswa. Mengembalikan string kosong bila
 * tanggalnya kosong/tidak valid.
 */
export function tahunLahir(value: string | Date | null | undefined): string {
  return isoDateInput(value).slice(0, 4);
}

// Nama bulan Indonesia (indeks 0 = Januari).
const BULAN_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/**
 * Memformat nilai tanggal (mis. kolom `bulan` SPP yang bertipe date) menjadi
 * label "NamaBulan Tahun" — mis. "Januari 2026". Menerima string ISO atau
 * objek Date dari driver Neon. Mengembalikan string kosong bila tidak valid.
 */
export function bulanLabel(value: string | Date | null | undefined): string {
  const iso = isoDateInput(value); // "yyyy-mm-dd" atau ""
  if (!iso) return "";
  const bulan = Number(iso.slice(5, 7));
  if (bulan < 1 || bulan > 12) return "";
  return `${BULAN_ID[bulan - 1]} ${iso.slice(0, 4)}`;
}

/**
 * Menormalkan nilai tanggal menjadi "yyyy-mm" untuk `<input type="month">`.
 * Mengembalikan string kosong bila kosong/tidak valid.
 */
export function bulanInput(value: string | Date | null | undefined): string {
  return isoDateInput(value).slice(0, 7);
}

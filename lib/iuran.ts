/**
 * Data & teks surat pemberitahuan iuran bulanan — modul netral tanpa
 * "use client", jadi aman dipakai dari Server Component, route handler, maupun
 * Client Component. (Bila diletakkan di modul "use client", ekspornya berubah
 * jadi client reference dan tak bisa dipanggil dari server.)
 *
 * Rendering PDF-nya ada di lib/suratIuranPdf.ts, tampilan dialognya di
 * components/account/TagihanIuran.tsx.
 */

import { bulanLabel } from "@/lib/date";
import { formatRupiah } from "@/lib/format";

/** Batas pembayaran: tanggal 10 pada bulan yang ditagih. */
export const TGL_JATUH_TEMPO = 10;

/** Nominal iuran default (disamakan dengan default form SPP). */
export const IURAN_DEFAULT = 25000;

/** Batas aman jumlah bulan dalam satu surat (2 tahun) agar tabel tetap wajar. */
export const MAX_BULAN = 24;

export const IDENTITAS = {
  nama: "SSB SAMPALI PUTRA",
  alamat:
    "Jl. Irian Barat, Desa Sampali, Percut Sei Tuan, Deli Serdang, Sumatera Utara",
  kontak: "+62 859-4326-8952",
  jadwal: "Selasa & Rabu (16.00-18.00) dan Jumat (15.00-18.00)",
};

export type TagihanSiswa = {
  nis?: string | null;
  nama_lengkap: string;
  nama_orang_tua: string | null;
  nama_sekolah: string | null;
  kelas: string | null;
  no_hp: string;
  /** Bulan SPP terakhir yang tercatat lunas (kolom `bulan` di tabel spp). */
  spp_terakhir?: string | Date | null;
};

const ROMAWI = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];

/**
 * Deret bulan "yyyy-mm" dari `dari` sampai `sampai` (inklusif). Mengembalikan
 * array kosong bila input tak lengkap atau `sampai` mendahului `dari`; dipotong
 * di MAX_BULAN agar rentang keliru tidak membuat surat raksasa.
 */
export function bulanRange(dari: string, sampai: string): string[] {
  const [dy, dm] = dari.split("-").map(Number);
  const [sy, sm] = sampai.split("-").map(Number);
  if (!dy || !dm || !sy || !sm) return [];
  const mulai = dy * 12 + (dm - 1);
  const akhir = sy * 12 + (sm - 1);
  if (akhir < mulai) return [];
  const out: string[] = [];
  for (let i = mulai; i <= akhir && out.length < MAX_BULAN; i++) {
    out.push(`${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}`);
  }
  return out;
}

/** Menggeser bulan "yyyy-mm" sebanyak `delta` bulan. */
export function geserBulan(bulanYm: string, delta: number): string {
  const [y, m] = bulanYm.split("-").map(Number);
  if (!y || !m) return "";
  const i = y * 12 + (m - 1) + delta;
  return `${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}`;
}

/**
 * Label periode untuk judul & pesan: satu bulan tampil apa adanya, lebih dari
 * satu tampil "Juli 2026 s.d. Agustus 2026 (2 bulan)".
 */
export function periodeLabel(bulanList: string[]): string {
  if (bulanList.length === 0) return "";
  const awal = bulanLabel(`${bulanList[0]}-01`);
  if (bulanList.length === 1) return awal;
  const akhir = bulanLabel(`${bulanList[bulanList.length - 1]}-01`);
  return `${awal} s.d. ${akhir} (${bulanList.length} bulan)`;
}

/** Tanggal jatuh tempo dalam format panjang Indonesia, mis. "10 Agustus 2026". */
export function jatuhTempoLabel(bulanYm: string): string {
  const [y, m] = bulanYm.split("-").map(Number);
  if (!y || !m) return "";
  return new Date(y, m - 1, TGL_JATUH_TEMPO).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Nomor surat sederhana namun tertelusur: NIS/IUR/SSB-SP/<bulan romawi>/<tahun>. */
export function nomorSurat(row: TagihanSiswa, bulanYm: string): string {
  const [y, m] = bulanYm.split("-").map(Number);
  const urut = (row.nis || "000").padStart(3, "0");
  return `${urut}/IUR/SSB-SP/${ROMAWI[(m || 1) - 1]}/${y || ""}`;
}

/** Sapaan orang tua/wali; jatuh ke sebutan umum bila kolomnya kosong. */
export function sapaanWali(row: TagihanSiswa): string {
  return row.nama_orang_tua?.trim()
    ? `Bapak/Ibu ${row.nama_orang_tua.trim()}`
    : "Bapak/Ibu Orang Tua/Wali";
}

/**
 * Nama berkas PDF — dipakai untuk unduhan maupun nama lampiran WhatsApp, jadi
 * penerima langsung tahu isinya. Karakter selain huruf/angka diganti "-".
 */
export function namaFilePdf(row: TagihanSiswa, bulanList: string[]): string {
  const slug = (s: string) =>
    s
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  const periode =
    bulanList.length > 1
      ? `${bulanList[0]}_sd_${bulanList[bulanList.length - 1]}`
      : bulanList[0] ?? "";
  return `Pemberitahuan-Iuran-${slug(row.nama_lengkap)}-${periode}.pdf`;
}

/** Pesan WhatsApp pendamping surat. */
export function buildWaText(
  row: TagihanSiswa,
  bulanList: string[],
  iuran: number,
  catatan: string
): string {
  const bulanAkhir = bulanList[bulanList.length - 1] ?? "";
  const total = iuran * bulanList.length;
  const jamak = bulanList.length > 1;
  const baris = [
    `*${IDENTITAS.nama}*`,
    "_Pemberitahuan Iuran Bulanan_",
    "",
    `Yth. ${sapaanWali(row)},`,
    `Pemberitahuan iuran siswa atas nama siswa *${row.nama_lengkap}*${
      row.nis ? ` (NIS ${row.nis})` : ""
    }.`,
    "",
    jamak
      ? `Kami mengingatkan pembayaran iuran latihan untuk *${bulanList.length} bulan* berikut:`
      : `Kami mengingatkan pembayaran iuran latihan bulan *${bulanLabel(
          `${bulanList[0]}-01`
        )}* sebesar *${formatRupiah(iuran)}*.`,
  ];
  if (jamak) {
    bulanList.forEach((ym, i) => {
      baris.push(
        `${i + 1}. ${bulanLabel(`${ym}-01`)} - ${formatRupiah(iuran)}`
      );
    });
    baris.push("", `Total: *${formatRupiah(total)}*`, "");
  }
  baris.push(
    `Batas pembayaran: *${jatuhTempoLabel(
      bulanAkhir
    )}* - iuran setiap bulan dibayarkan sebelum tanggal ${TGL_JATUH_TEMPO}.`,
    "",
    "Surat pemberitahuan resmi terlampir dalam berkas PDF pada pesan ini.",
    "",
    `Pembayaran dapat diserahkan kepada pengurus saat jadwal latihan (${IDENTITAS.jadwal}).`
  );
  if (catatan.trim()) baris.push("", `Catatan: ${catatan.trim()}`);
  baris.push(
    "",
    "Bila pembayaran sudah dilakukan, mohon abaikan pesan ini. Terima kasih atas perhatian dan kerja samanya.",
    "",
    `_Pesan otomatis dari Sistem ${IDENTITAS.nama}_`
  );
  return baris.join("\n");
}

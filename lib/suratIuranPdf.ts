/**
 * Pembuat berkas PDF surat pemberitahuan iuran (pdf-lib).
 *
 * Menghasilkan PDF asli — bukan pratinjau cetak — supaya berkasnya bisa
 * dilampirkan langsung ke WhatsApp lewat Web Share API. Modul ini berat
 * (pdf-lib ~400 KB), jadi pemanggilnya WAJIB memakai dynamic import agar tidak
 * ikut terbawa ke bundle awal halaman siswa.
 *
 * Digambar manual (bukan konversi HTML) karena tidak ada mesin HTML→PDF yang
 * jalan di browser tanpa merasterisasi teks; hasil vektor begini jauh lebih
 * tajam dan berkasnya jauh lebih kecil.
 */

import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
  type RGB,
} from "pdf-lib";

import { bulanLabel } from "@/lib/date";
import { formatRupiah } from "@/lib/format";
import {
  IDENTITAS,
  jatuhTempoLabel,
  nomorSurat,
  periodeLabel,
  sapaanWali,
  TGL_JATUH_TEMPO,
  type TagihanSiswa,
} from "@/lib/iuran";

// Ukuran A4 dalam poin (1 pt = 1/72 inci).
const A4: [number, number] = [595.28, 841.89];
const MARGIN = 36;
const LEBAR = A4[0] - MARGIN * 2;

const HITAM = rgb(0.07, 0.07, 0.07);
const ABU = rgb(0.35, 0.35, 0.35);
const ABU_GARIS = rgb(0.78, 0.78, 0.78);
const ABU_ISIAN = rgb(0.95, 0.95, 0.96);
const HIJAU = rgb(0.082, 0.639, 0.29);
const HIJAU_TUA = rgb(0.082, 0.5, 0.23);
const HIJAU_MUDA = rgb(0.94, 0.99, 0.96);

/**
 * Font standar PDF memakai enkode WinAnsi, sehingga karakter di luar Latin-1
 * (mis. em dash, bullet, tanda kutip melengkung) membuat pdf-lib melempar
 * error. Semua teks dilewatkan ke sini lebih dulu.
 */
function aman(teks: string): string {
  return teks
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[•·]/g, "-")
    .replace(/…/g, "...")
    .replace(/ /g, " ")
    .replace(/[^\x00-\xFF]/g, "");
}

type Ctx = {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  reguler: PDFFont;
  tebal: PDFFont;
};

/** Menambah halaman baru bila sisa ruang kurang dari `butuh`. */
function pastikanRuang(ctx: Ctx, butuh: number) {
  if (ctx.y - butuh >= MARGIN) return;
  ctx.page = ctx.doc.addPage(A4);
  ctx.y = A4[1] - MARGIN;
}

/** Memotong teks menjadi baris-baris yang muat dalam `lebar`. */
function bungkus(
  teks: string,
  font: PDFFont,
  ukuran: number,
  lebar: number
): string[] {
  const keluar: string[] = [];
  for (const paragraf of teks.split("\n")) {
    const kata = paragraf.split(/\s+/).filter(Boolean);
    let baris = "";
    for (const k of kata) {
      const coba = baris ? `${baris} ${k}` : k;
      if (font.widthOfTextAtSize(coba, ukuran) <= lebar) {
        baris = coba;
      } else {
        if (baris) keluar.push(baris);
        baris = k;
      }
    }
    keluar.push(baris);
  }
  return keluar;
}

type TeksOpsi = {
  ukuran?: number;
  tebal?: boolean;
  warna?: RGB;
  x?: number;
  lebar?: number;
  /** Jarak antarbaris sebagai kelipatan ukuran font. */
  rapat?: number;
  align?: "left" | "center" | "right";
};

/** Menulis teks (otomatis membungkus baris) lalu menurunkan kursor y. */
function tulis(ctx: Ctx, teks: string, opsi: TeksOpsi = {}): void {
  const ukuran = opsi.ukuran ?? 9.5;
  const font = opsi.tebal ? ctx.tebal : ctx.reguler;
  const lebar = opsi.lebar ?? LEBAR;
  const x = opsi.x ?? MARGIN;
  const tinggiBaris = ukuran * (opsi.rapat ?? 1.45);
  for (const baris of bungkus(aman(teks), font, ukuran, lebar)) {
    pastikanRuang(ctx, tinggiBaris);
    let bx = x;
    if (opsi.align === "center") {
      bx = x + (lebar - font.widthOfTextAtSize(baris, ukuran)) / 2;
    } else if (opsi.align === "right") {
      bx = x + lebar - font.widthOfTextAtSize(baris, ukuran);
    }
    ctx.page.drawText(baris, {
      x: bx,
      y: ctx.y - ukuran,
      size: ukuran,
      font,
      color: opsi.warna ?? HITAM,
    });
    ctx.y -= tinggiBaris;
  }
}

/** Satu baris tabel bergaris kotak; mengembalikan tinggi baris yang terpakai. */
function barisTabel(
  ctx: Ctx,
  sel: { teks: string; lebar: number; tebal?: boolean; align?: "left" | "right" | "center" }[],
  opsi: { ukuran?: number; isian?: RGB; padY?: number } = {}
): void {
  const ukuran = opsi.ukuran ?? 9;
  const padX = 6;
  const padY = opsi.padY ?? 4;

  // Hitung tinggi baris dari sel yang paling banyak barisnya.
  const isi = sel.map((s) =>
    bungkus(
      aman(s.teks),
      s.tebal ? ctx.tebal : ctx.reguler,
      ukuran,
      s.lebar - padX * 2
    )
  );
  const maksBaris = Math.max(...isi.map((b) => b.length));
  const tinggi = maksBaris * ukuran * 1.35 + padY * 2;
  pastikanRuang(ctx, tinggi);

  const atas = ctx.y;
  let x = MARGIN;
  sel.forEach((s, i) => {
    if (opsi.isian) {
      ctx.page.drawRectangle({
        x,
        y: atas - tinggi,
        width: s.lebar,
        height: tinggi,
        color: opsi.isian,
      });
    }
    ctx.page.drawRectangle({
      x,
      y: atas - tinggi,
      width: s.lebar,
      height: tinggi,
      borderColor: ABU_GARIS,
      borderWidth: 0.7,
    });
    const font = s.tebal ? ctx.tebal : ctx.reguler;
    isi[i].forEach((baris, j) => {
      let bx = x + padX;
      const lebarTeks = font.widthOfTextAtSize(baris, ukuran);
      if (s.align === "right") bx = x + s.lebar - padX - lebarTeks;
      else if (s.align === "center") bx = x + (s.lebar - lebarTeks) / 2;
      ctx.page.drawText(baris, {
        x: bx,
        y: atas - padY - ukuran - j * ukuran * 1.35,
        size: ukuran,
        font,
        color: HITAM,
      });
    });
    x += s.lebar;
  });
  ctx.y = atas - tinggi;
}

/**
 * Menyusun berkas PDF surat pemberitahuan iuran.
 *
 * @param logoBytes isi berkas logo PNG (opsional). Ambil lewat
 *   `fetch("/logo.png").then((r) => r.arrayBuffer())` di sisi klien.
 */
export async function buildSuratIuranPdf(
  row: TagihanSiswa,
  bulanList: string[],
  iuran: number,
  catatan: string,
  logoBytes?: ArrayBuffer | Uint8Array
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const reguler = await doc.embedFont(StandardFonts.Helvetica);
  const tebal = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage(A4);
  const ctx: Ctx = { doc, page, y: A4[1] - MARGIN, reguler, tebal };

  const periode = periodeLabel(bulanList);
  const bulanAkhir = bulanList[bulanList.length - 1] ?? "";
  const total = iuran * bulanList.length;
  const jamak = bulanList.length > 1;
  const hariIni = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  doc.setTitle(`Pemberitahuan Iuran ${periode} - ${row.nama_lengkap}`);
  doc.setSubject("Pemberitahuan pembayaran iuran bulanan");
  doc.setProducer(`Sistem ${IDENTITAS.nama}`);
  doc.setCreator(`Sistem ${IDENTITAS.nama}`);

  // ---------- Kop surat ----------
  const atasKop = ctx.y;
  const sisiLogo = 58;
  if (logoBytes) {
    try {
      const logo = await doc.embedPng(logoBytes);
      const skala = sisiLogo / Math.max(logo.width, logo.height);
      ctx.page.drawImage(logo, {
        x: MARGIN,
        y: atasKop - sisiLogo,
        width: logo.width * skala,
        height: logo.height * skala,
      });
    } catch {
      /* logo gagal dimuat — surat tetap dibuat tanpa logo */
    }
  }
  // Teks kop ditengahkan pada ruang di antara logo & penyeimbang kanan.
  const xKop = MARGIN + sisiLogo + 12;
  const lebarKop = LEBAR - (sisiLogo + 12) * 2;
  ctx.y = atasKop - 2;
  tulis(ctx, "SEKOLAH SEPAK BOLA", {
    ukuran: 8,
    tebal: true,
    warna: HIJAU,
    x: xKop,
    lebar: lebarKop,
    align: "center",
  });
  tulis(ctx, IDENTITAS.nama, {
    ukuran: 17,
    tebal: true,
    x: xKop,
    lebar: lebarKop,
    align: "center",
    rapat: 1.25,
  });
  tulis(ctx, IDENTITAS.alamat, {
    ukuran: 8,
    warna: ABU,
    x: xKop,
    lebar: lebarKop,
    align: "center",
    rapat: 1.3,
  });
  tulis(ctx, `WhatsApp: ${IDENTITAS.kontak}`, {
    ukuran: 8,
    warna: ABU,
    x: xKop,
    lebar: lebarKop,
    align: "center",
    rapat: 1.3,
  });
  // Garis ganda khas kop surat, di bawah elemen terendah (logo atau teks).
  ctx.y = Math.min(ctx.y, atasKop - sisiLogo) - 8;
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y },
    end: { x: MARGIN + LEBAR, y: ctx.y },
    thickness: 1.6,
    color: HITAM,
  });
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y - 3 },
    end: { x: MARGIN + LEBAR, y: ctx.y - 3 },
    thickness: 0.6,
    color: HITAM,
  });
  ctx.y -= 20;

  // ---------- Nomor / Hal / Tanggal ----------
  const meta: [string, string][] = [
    ["Nomor", nomorSurat(row, bulanAkhir)],
    ["Hal", "Pemberitahuan Pembayaran Iuran Bulanan"],
    ["Tanggal", hariIni],
  ];
  for (const [label, nilai] of meta) {
    pastikanRuang(ctx, 14);
    ctx.page.drawText(aman(label), {
      x: MARGIN,
      y: ctx.y - 9,
      size: 9,
      font: reguler,
      color: ABU,
    });
    ctx.page.drawText(aman(`: ${nilai}`), {
      x: MARGIN + 58,
      y: ctx.y - 9,
      size: 9,
      font: reguler,
      color: HITAM,
    });
    ctx.y -= 14;
  }
  ctx.y -= 8;

  // ---------- Tujuan ----------
  tulis(ctx, "Kepada Yth.", { ukuran: 9.5, rapat: 1.3 });
  tulis(ctx, sapaanWali(row), { ukuran: 9.5, tebal: true, rapat: 1.3 });
  tulis(ctx, `Orang tua/wali dari ananda ${row.nama_lengkap}`, {
    ukuran: 9.5,
    rapat: 1.3,
  });
  tulis(ctx, "di tempat", { ukuran: 9.5, rapat: 1.3 });
  ctx.y -= 12;

  // ---------- Judul ----------
  const judul = `PEMBERITAHUAN IURAN ${periode.toUpperCase()}`;
  const lebarJudul = tebal.widthOfTextAtSize(aman(judul), 11);
  tulis(ctx, judul, { ukuran: 11, tebal: true, align: "center", rapat: 1.2 });
  ctx.page.drawLine({
    start: { x: MARGIN + (LEBAR - lebarJudul) / 2, y: ctx.y + 2 },
    end: { x: MARGIN + (LEBAR + lebarJudul) / 2, y: ctx.y + 2 },
    thickness: 0.7,
    color: HITAM,
  });
  ctx.y -= 12;

  // ---------- Pembuka ----------
  tulis(
    ctx,
    `Dengan hormat, sehubungan dengan kegiatan latihan rutin di ${
      IDENTITAS.nama
    }, kami menyampaikan pemberitahuan mengenai iuran bulanan ananda${
      jamak ? ` untuk ${bulanList.length} bulan periode berikut` : ""
    } dengan data sebagai berikut:`,
    { ukuran: 9.5, rapat: 1.45 }
  );
  ctx.y -= 8;

  // ---------- Tabel data siswa ----------
  // Disusun dua pasang label/nilai per baris: isinya pendek-pendek, dan tabel
  // enam baris memanjang membuat surat 3 bulan tumpah ke halaman kedua.
  const lebarLabelData = LEBAR * 0.23;
  const lebarNilaiData = LEBAR / 2 - lebarLabelData;
  const dataSiswa: [string, string][] = [
    ["NIS", row.nis || "-"],
    ["Nama Siswa", row.nama_lengkap],
    [
      "Sekolah / Kelas",
      [row.nama_sekolah, row.kelas].filter(Boolean).join(" - ") || "-",
    ],
    ["Orang Tua/Wali", row.nama_orang_tua || "-"],
    ["No. WhatsApp", row.no_hp || "-"],
    [
      "Iuran Terakhir",
      row.spp_terakhir ? bulanLabel(row.spp_terakhir) : "Belum ada catatan",
    ],
  ];
  for (let i = 0; i < dataSiswa.length; i += 2) {
    const kiri = dataSiswa[i];
    const kanan = dataSiswa[i + 1];
    barisTabel(ctx, [
      { teks: kiri[0], lebar: lebarLabelData, tebal: true },
      { teks: kiri[1], lebar: lebarNilaiData },
      { teks: kanan?.[0] ?? "", lebar: lebarLabelData, tebal: true },
      { teks: kanan?.[1] ?? "", lebar: lebarNilaiData },
    ]);
  }
  ctx.y -= 10;

  // ---------- Tabel tagihan ----------
  const kolom = [30, LEBAR * 0.4, LEBAR * 0.28];
  kolom.push(LEBAR - kolom[0] - kolom[1] - kolom[2]);
  barisTabel(
    ctx,
    [
      { teks: "NO", lebar: kolom[0], tebal: true, align: "center" },
      { teks: "URAIAN", lebar: kolom[1], tebal: true },
      { teks: "BULAN", lebar: kolom[2], tebal: true },
      { teks: "NOMINAL", lebar: kolom[3], tebal: true, align: "right" },
    ],
    { ukuran: 8, isian: ABU_ISIAN }
  );
  bulanList.forEach((ym, i) => {
    barisTabel(ctx, [
      { teks: String(i + 1), lebar: kolom[0], align: "center" },
      { teks: "Iuran latihan bulanan", lebar: kolom[1] },
      { teks: bulanLabel(`${ym}-01`), lebar: kolom[2] },
      { teks: formatRupiah(iuran), lebar: kolom[3], align: "right" },
    ]);
  });
  barisTabel(
    ctx,
    [
      {
        teks: `Total yang harus dibayar${
          jamak ? ` (${bulanList.length} bulan)` : ""
        }`,
        lebar: kolom[0] + kolom[1] + kolom[2],
        tebal: true,
      },
      {
        teks: formatRupiah(total),
        lebar: kolom[3],
        tebal: true,
        align: "right",
      },
    ],
    { isian: ABU_ISIAN }
  );
  ctx.y -= 12;

  // ---------- Kotak jatuh tempo ----------
  const tempoTeks = `Mohon pelunasan dilakukan paling lambat ${jatuhTempoLabel(
    bulanAkhir
  )}. Sesuai ketentuan, iuran setiap bulan dibayarkan sebelum tanggal ${TGL_JATUH_TEMPO}${
    jamak
      ? `, sehingga bulan-bulan sebelum ${bulanLabel(
          `${bulanAkhir}-01`
        )} pada rincian di atas terhitung sebagai tunggakan`
      : ""
  }.`;
  const barisTempo = bungkus(aman(tempoTeks), reguler, 9, LEBAR - 20);
  const tinggiTempo = barisTempo.length * 9 * 1.5 + 16;
  pastikanRuang(ctx, tinggiTempo);
  ctx.page.drawRectangle({
    x: MARGIN,
    y: ctx.y - tinggiTempo,
    width: LEBAR,
    height: tinggiTempo,
    color: HIJAU_MUDA,
    borderColor: HIJAU,
    borderWidth: 0.8,
  });
  barisTempo.forEach((baris, i) => {
    ctx.page.drawText(baris, {
      x: MARGIN + 10,
      y: ctx.y - 17 - i * 9 * 1.5,
      size: 9,
      font: reguler,
      color: HIJAU_TUA,
    });
  });
  ctx.y -= tinggiTempo + 12;

  // ---------- Cara pembayaran ----------
  tulis(ctx, "Pembayaran dapat dilakukan dengan cara berikut:", {
    ukuran: 9.5,
    rapat: 1.5,
  });
  ctx.y -= 3;
  const cara = [
    `Diserahkan langsung kepada pengurus saat jadwal latihan: ${IDENTITAS.jadwal}.`,
    `Konfirmasi pembayaran melalui WhatsApp ${IDENTITAS.kontak} dengan menyebutkan nama siswa dan bulan iuran.`,
    "Simpan bukti pembayaran yang diberikan pengurus sebagai arsip.",
  ];
  cara.forEach((teks, i) => {
    pastikanRuang(ctx, 14);
    ctx.page.drawText(`${i + 1}.`, {
      x: MARGIN + 6,
      y: ctx.y - 9,
      size: 9,
      font: reguler,
      color: HITAM,
    });
    tulis(ctx, teks, { ukuran: 9, x: MARGIN + 22, lebar: LEBAR - 22, rapat: 1.5 });
  });
  ctx.y -= 8;

  if (catatan.trim()) {
    tulis(ctx, `Catatan: ${catatan.trim()}`, {
      ukuran: 9.5,
      tebal: true,
      rapat: 1.5,
    });
    ctx.y -= 6;
  }

  // ---------- Penutup ----------
  tulis(
    ctx,
    "Apabila pembayaran telah dilakukan sebelum surat ini diterima, mohon abaikan pemberitahuan ini. Atas perhatian serta kerja sama Bapak/Ibu, kami ucapkan terima kasih.",
    { ukuran: 9.5, rapat: 1.45 }
  );
  ctx.y -= 16;

  // ---------- Tanda tangan ----------
  const lebarTtd = 200;
  const xTtd = MARGIN + LEBAR - lebarTtd;
  pastikanRuang(ctx, 78);
  tulis(ctx, `Sampali, ${hariIni}`, {
    ukuran: 9.5,
    x: xTtd,
    lebar: lebarTtd,
    align: "center",
    rapat: 1.4,
  });
  tulis(ctx, "Hormat kami,", {
    ukuran: 9.5,
    x: xTtd,
    lebar: lebarTtd,
    align: "center",
    rapat: 1.4,
  });
  ctx.y -= 44;
  ctx.page.drawLine({
    start: { x: xTtd + 10, y: ctx.y },
    end: { x: xTtd + lebarTtd - 10, y: ctx.y },
    thickness: 0.8,
    color: HITAM,
  });
  ctx.y -= 4;
  tulis(ctx, `Pengurus ${IDENTITAS.nama}`, {
    ukuran: 9.5,
    tebal: true,
    x: xTtd,
    lebar: lebarTtd,
    align: "center",
    rapat: 1.4,
  });
  ctx.y -= 16;

  // ---------- Catatan kaki ----------
  pastikanRuang(ctx, 30);
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y },
    end: { x: MARGIN + LEBAR, y: ctx.y },
    thickness: 0.6,
    color: ABU_GARIS,
  });
  ctx.y -= 8;
  tulis(
    ctx,
    `Dokumen ini dibuat otomatis oleh Sistem ${IDENTITAS.nama} dan sah tanpa tanda tangan basah. Bila terdapat perbedaan data pembayaran, mohon hubungi pengurus untuk pencocokan catatan.`,
    { ukuran: 7.5, warna: ABU, rapat: 1.45 }
  );

  return doc.save();
}

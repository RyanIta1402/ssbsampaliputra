"use client";

import { useState } from "react";

import {
  actionIconClass,
  fieldClass,
  labelClass,
  Modal,
} from "@/components/account/ui";
import { bulanInput, bulanLabel } from "@/lib/date";
import { formatRibuan, formatRupiah } from "@/lib/format";
import {
  buildWaText,
  bulanRange,
  geserBulan,
  IURAN_DEFAULT,
  jatuhTempoLabel,
  MAX_BULAN,
  namaFilePdf,
  periodeLabel,
  type TagihanSiswa,
} from "@/lib/iuran";
import { isValidWa, normalizeWa } from "@/lib/wa";

/**
 * Dialog surat pemberitahuan iuran per siswa: menyusun berkas PDF asli lalu
 * membagikannya ke WhatsApp.
 *
 * Cara kirimnya menyesuaikan kemampuan perangkat:
 *
 * - HP (Android Chrome / iOS Safari) yang mendukung Web Share API Level 2 —
 *   PDF dikirim sebagai LAMPIRAN lewat menu berbagi bawaan sistem; admin
 *   tinggal memilih WhatsApp lalu kontak tujuan, berkas & teks sudah menempel.
 * - Perangkat lain (umumnya desktop) — PDF diunduh, lalu wa.me dibuka dengan
 *   teks terisi, dan admin melampirkan berkas itu manual. Tautan wa.me memang
 *   tidak punya parameter lampiran; hanya WhatsApp Cloud API resmi yang bisa
 *   mengirim dokumen sepenuhnya otomatis.
 */

export type { TagihanSiswa };

/** Ikon tagihan/kuitansi untuk tombol aksi. */
function BillIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M5 21V4a1 1 0 0 1 1.5-.87L9 4.5l2.5-1.4a1 1 0 0 1 1 0L15 4.5l2.5-1.37A1 1 0 0 1 19 4v17l-2.5-1.4a1 1 0 0 0-1 0L13 21l-2.5-1.4a1 1 0 0 0-1 0L7 21Z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  );
}

/** Tombol aksi ikon: buka dialog surat pemberitahuan iuran untuk satu siswa. */
export function TagihanButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Surat pemberitahuan iuran (PDF + WhatsApp)"
      aria-label="Surat pemberitahuan iuran"
      className={`${actionIconClass} border-gold/40 text-gold hover:bg-gold/10`}
    >
      <BillIcon />
    </button>
  );
}

/**
 * Menebak periode awal: bulan setelah pembayaran terakhir yang tercatat, agar
 * tunggakan langsung terpilih. Bila belum ada catatan (atau catatannya sudah
 * melewati bulan berjalan), jatuh kembali ke bulan berjalan.
 */
function periodeAwalDefault(row: TagihanSiswa, bulanIni: string): string {
  const terakhir = bulanInput(row.spp_terakhir);
  if (!terakhir) return bulanIni;
  const berikut = geserBulan(terakhir, 1);
  return berikut && berikut <= bulanIni ? berikut : bulanIni;
}

/**
 * Mengambil logo untuk kop surat dan memperkecilnya lebih dulu.
 *
 * public/logo.png berukuran 575x562 px (~360 KB) padahal di surat hanya
 * digambar sebesar ~58 pt. Tanpa diperkecil, tiap PDF ikut membawa 360 KB —
 * memberatkan orang tua yang mengunduhnya lewat kuota seluler. Bila
 * pengecilan gagal (browser lawas), dipakai berkas aslinya; bila pengambilan
 * gagal sama sekali, surat tetap dibuat tanpa logo.
 */
async function ambilLogo(): Promise<ArrayBuffer | undefined> {
  let asli: Blob;
  try {
    const res = await fetch("/logo.png");
    if (!res.ok) return undefined;
    asli = await res.blob();
  } catch {
    return undefined;
  }
  try {
    const bmp = await createImageBitmap(asli);
    const skala = Math.min(180 / bmp.width, 180 / bmp.height, 1);
    const kanvas = document.createElement("canvas");
    kanvas.width = Math.round(bmp.width * skala);
    kanvas.height = Math.round(bmp.height * skala);
    const gambar = kanvas.getContext("2d");
    if (!gambar) return asli.arrayBuffer();
    gambar.drawImage(bmp, 0, 0, kanvas.width, kanvas.height);
    const kecil = await new Promise<Blob | null>((selesai) =>
      kanvas.toBlob(selesai, "image/png")
    );
    return (kecil ?? asli).arrayBuffer();
  } catch {
    return asli.arrayBuffer();
  }
}

/**
 * Membuat berkas PDF surat. pdf-lib (~400 KB) sengaja di-import dinamis supaya
 * tidak ikut terbawa ke bundle awal halaman siswa — hanya dimuat saat tombol
 * ditekan.
 */
async function buatPdf(
  row: TagihanSiswa,
  bulanList: string[],
  nominal: number,
  catatan: string
): Promise<File> {
  const { buildSuratIuranPdf } = await import("@/lib/suratIuranPdf");
  const bytes = await buildSuratIuranPdf(
    row,
    bulanList,
    nominal,
    catatan,
    await ambilLogo()
  );
  return new File([new Uint8Array(bytes)], namaFilePdf(row, bulanList), {
    type: "application/pdf",
  });
}

/** Memicu unduhan berkas di browser. */
function unduh(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Beri jeda agar unduhan sempat dimulai sebelum URL dilepas.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function TagihanIuranModal({
  row,
  onClose,
}: {
  row: TagihanSiswa;
  onClose: () => void;
}) {
  const bulanIni = bulanInput(new Date());
  const [dari, setDari] = useState(() => periodeAwalDefault(row, bulanIni));
  const [sampai, setSampai] = useState(bulanIni);
  const [iuran, setIuran] = useState(formatRibuan(IURAN_DEFAULT));
  const [catatan, setCatatan] = useState("");
  const [sibuk, setSibuk] = useState<"" | "pdf" | "wa">("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const nominal = Number(iuran.replace(/[^\d]/g, ""));
  const bulanList = bulanRange(dari, sampai);
  const waValid = isValidWa(row.no_hp);
  const siap = bulanList.length > 0 && nominal > 0;
  const total = nominal * bulanList.length;

  /** Pesan validasi periode/nominal — dipakai kedua tombol. */
  const cekIsian = (): string => {
    if (!dari || !sampai) return "Periode iuran wajib diisi.";
    if (bulanList.length === 0)
      return "Bulan akhir tidak boleh mendahului bulan awal.";
    if (nominal <= 0) return "Nominal iuran wajib diisi dengan angka.";
    return "";
  };

  const pratinjauPdf = async () => {
    const pesan = cekIsian();
    if (pesan) {
      setError(pesan);
      return;
    }
    setError("");
    setInfo("");
    setSibuk("pdf");
    try {
      const file = await buatPdf(row, bulanList, nominal, catatan);
      const url = URL.createObjectURL(file);
      // Browser menampilkan PDF langsung, jadi tab baru sekaligus jadi
      // pratinjau. Bila popup diblokir, berkasnya diunduh saja.
      if (!window.open(url, "_blank", "noopener,noreferrer")) {
        unduh(file);
        setInfo("Popup diblokir browser, jadi PDF-nya diunduh.");
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      console.error("Gagal membuat PDF surat iuran:", err);
      setError("Gagal membuat berkas PDF. Coba lagi.");
    } finally {
      setSibuk("");
    }
  };

  const kirimWa = async () => {
    const pesan = cekIsian();
    if (pesan) {
      setError(pesan);
      return;
    }
    if (!waValid) {
      setError("Nomor WhatsApp siswa tidak valid. Perbarui dulu di data siswa.");
      return;
    }
    setError("");
    setInfo("");
    setSibuk("wa");
    try {
      const file = await buatPdf(row, bulanList, nominal, catatan);
      const text = buildWaText(row, bulanList, nominal, catatan);

      // Jalur utama: bagikan PDF sebagai lampiran lewat menu berbagi sistem.
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text });
          setInfo("Menu berbagi dibuka — pilih WhatsApp lalu kontak tujuan.");
          return;
        } catch (err) {
          // Pengguna menutup menu berbagi: bukan kegagalan, jangan lanjut ke
          // jalur cadangan agar tidak ada unduhan/tab yang tak diminta.
          if (err instanceof DOMException && err.name === "AbortError") return;
          console.error("Web Share gagal, memakai jalur cadangan:", err);
        }
      }

      // Jalur cadangan (umumnya desktop): unduh PDF + buka wa.me berisi teks.
      unduh(file);
      // Teks disalin juga karena sebagian WhatsApp Desktop merusak format saat
      // teks dioper lewat tautan.
      navigator.clipboard?.writeText(text)?.catch(() => {});
      window.open(
        `https://wa.me/${normalizeWa(row.no_hp)}?text=${encodeURIComponent(
          text
        )}`,
        "_blank",
        "noopener,noreferrer"
      );
      setInfo(
        "Perangkat ini belum mendukung lampiran otomatis. PDF sudah diunduh — lampirkan lewat ikon klip di WhatsApp."
      );
    } catch (err) {
      console.error("Gagal menyiapkan kiriman WhatsApp:", err);
      setError("Gagal membuat berkas PDF. Coba lagi.");
    } finally {
      setSibuk("");
    }
  };

  return (
    <Modal
      title="Pemberitahuan Iuran"
      subtitle={`${row.nama_lengkap}${row.nis ? ` · NIS ${row.nis}` : ""}`}
      onClose={onClose}
      wide
    >
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="tagihan-dari">
            Periode Dari
          </label>
          <input
            id="tagihan-dari"
            type="month"
            value={dari}
            onChange={(e) => {
              const v = e.target.value;
              setDari(v);
              // Jaga agar bulan akhir tak pernah mendahului bulan awal.
              if (v && sampai && v > sampai) setSampai(v);
            }}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="tagihan-sampai">
            Periode Sampai
          </label>
          <input
            id="tagihan-sampai"
            type="month"
            value={sampai}
            min={dari || undefined}
            onChange={(e) => setSampai(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="tagihan-iuran">
            Iuran / Bulan
          </label>
          <input
            id="tagihan-iuran"
            inputMode="numeric"
            value={iuran}
            onChange={(e) => setIuran(formatRibuan(e.target.value))}
            className={fieldClass}
            placeholder="25.000"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-body text-xs uppercase tracking-widest text-bone/40">
          Cepat
        </span>
        {[1, 3, 6, 12].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setSampai(geserBulan(dari || bulanIni, n - 1))}
            disabled={!dari}
            className="border border-bone/15 px-3 py-1 text-xs text-bone/60 transition-colors hover:border-pitch hover:text-pitch disabled:cursor-not-allowed disabled:opacity-40"
          >
            {n} bulan
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSampai(bulanIni)}
          className="border border-bone/15 px-3 py-1 text-xs text-bone/60 transition-colors hover:border-pitch hover:text-pitch"
        >
          s.d. bulan ini
        </button>
      </div>

      <div className="mt-5">
        <label className={labelClass} htmlFor="tagihan-catatan">
          Catatan Tambahan (opsional)
        </label>
        <textarea
          id="tagihan-catatan"
          rows={2}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          className={fieldClass}
          placeholder="mis. sekalian uang kas Rp 5.000"
        />
      </div>

      <dl className="mt-5 space-y-1.5 border border-bone/10 bg-coal p-4 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-bone/50">Periode</dt>
          <dd className="text-right text-bone">
            {periodeLabel(bulanList) || (
              <span className="text-red-400">Rentang bulan tidak valid</span>
            )}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-bone/50">Total tagihan</dt>
          <dd className="font-semibold text-pitch">
            {siap ? formatRupiah(total) : "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-bone/50">Batas bayar</dt>
          <dd className="text-bone">
            {jatuhTempoLabel(bulanList[bulanList.length - 1] ?? "") || "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-bone/50">Iuran terakhir tercatat</dt>
          <dd className="text-bone">
            {row.spp_terakhir ? bulanLabel(row.spp_terakhir) : "Belum ada"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-bone/50">Tujuan WhatsApp</dt>
          <dd className={waValid ? "text-pitch" : "text-red-400"}>
            {row.no_hp || "—"}
            {!waValid && " (tidak valid)"}
          </dd>
        </div>
      </dl>

      {bulanList.length === MAX_BULAN && (
        <p className="mt-3 text-xs text-gold/80">
          Periode dipotong di {MAX_BULAN} bulan (batas maksimum satu surat).
        </p>
      )}

      {info && (
        <p className="mt-4 border border-pitch/25 bg-pitch/10 p-3 text-sm text-pitch">
          {info}
        </p>
      )}
      {error && (
        <p className="mt-4 border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="border border-bone/20 px-5 py-2.5 font-body text-xs font-bold uppercase tracking-widest text-bone/70 transition-colors hover:border-bone/50 hover:text-bone"
        >
          Tutup
        </button>
        <button
          type="button"
          onClick={pratinjauPdf}
          disabled={sibuk !== ""}
          className="border border-bone/25 px-5 py-2.5 font-body text-xs font-bold uppercase tracking-widest text-bone transition-colors hover:border-pitch hover:text-pitch disabled:cursor-not-allowed disabled:opacity-40"
        >
          {sibuk === "pdf" ? "Menyiapkan..." : "Lihat PDF"}
        </button>
        <button
          type="button"
          onClick={kirimWa}
          disabled={!waValid || sibuk !== ""}
          className="border border-pitch bg-pitch px-5 py-2.5 font-body text-xs font-bold uppercase tracking-widest text-ink transition-colors hover:bg-pitch/80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {sibuk === "wa" ? "Menyiapkan..." : "Kirim WhatsApp + PDF"}
        </button>
      </div>
    </Modal>
  );
}

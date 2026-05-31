"use client";

import { useState } from "react";

type Jadwal = {
  hari?: string;
  jam?: string;
  lapangan?: string;
  biaya?: string;
  mapsUrl?: string;
};

const MAPS_SO_POINT =
  "https://www.google.co.id/maps/place/Jl.+Suryahaji+No.85,+Tembung,+Kec.+Percut+Sei+Tuan,+Medan,+Sumatera+Utara+20371/@3.6176768,98.7302036,17z/data=!3m1!4b1!4m6!3m5!1s0x30313158dee4c0bf:0x4ca15e2dbf9b7087!8m2!3d3.6176714!4d98.7327785!16s%2Fg%2F11f66hvq3y";
const MAPS_GARUDA_DELI =
  "https://www.google.co.id/maps/place/Lapangan+Sepakbola+SAMPALI+FC/@3.6335053,98.7029728,15z/data=!4m6!3m5!1s0x303133c592133e79:0x6cdd9f630d07d9d4!8m2!3d3.63369!4d98.715829!16s%2Fg%2F1hm55r1j1";
type Settings = {
  whatsapp?: string;
  telepon?: string;
  email?: string;
  alamat?: string;
  jamLatihan?: Jadwal[];
};

const defaultJadwal: Jadwal[] = [
  {
    hari: "Selasa",
    jam: "16:00 - 18:00",
    lapangan: "Lapangan So Point",
    biaya: "Rp 10.000",
    mapsUrl: MAPS_SO_POINT,
  },
  {
    hari: "Rabu",
    jam: "16:00 - 18:00",
    lapangan: "Lapangan Garuda Deli Sampali",
    biaya: "Rp 5.000",
    mapsUrl: MAPS_GARUDA_DELI,
  },
  {
    hari: "Jumat",
    jam: "16:00 - 18:00",
    lapangan: "Lapangan Garuda Deli Sampali",
    biaya: "Rp 5.000",
    mapsUrl: MAPS_GARUDA_DELI,
  },
];

// Struktur data formulir mengikuti FORMULIR PENDAFTARAN SSB SAMPALI PUTRA (PDF)
type FormData = {
  namaLengkap: string;
  namaPanggilan: string;
  jenisKelamin: string;
  tempatLahir: string;
  tanggalLahir: string;
  noHp: string;
  namaSekolah: string;
  kelas: string;
  beratBadan: string;
  tinggiBadan: string;
  golonganDarah: string;
  namaOrangTua: string;
};

const initialForm: FormData = {
  namaLengkap: "",
  namaPanggilan: "",
  jenisKelamin: "",
  tempatLahir: "",
  tanggalLahir: "",
  noHp: "",
  namaSekolah: "",
  kelas: "",
  beratBadan: "",
  tinggiBadan: "",
  golonganDarah: "",
  namaOrangTua: "",
};

type Status = "idle" | "sending" | "saved" | "error";

// Kelas input/select seragam
const fieldClass =
  "w-full border border-bone/15 bg-coal px-4 py-3 text-bone outline-none transition-colors placeholder:text-bone/30 focus:border-pitch";
const labelClass =
  "mb-2 block font-body text-xs font-bold uppercase tracking-widest text-bone/50";

export default function Contact({ settings }: { settings?: Settings }) {
  const [form, setForm] = useState<FormData>(initialForm);
  const [status, setStatus] = useState<Status>("idle");

  const wa = settings?.whatsapp || "6285943268952";
  const jadwal =
    settings?.jamLatihan && settings.jamLatihan.length > 0
      ? settings.jamLatihan
      : defaultJadwal;

  const setField =
    (key: keyof FormData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  // Wajib diisi sebelum tombol aktif
  const valid =
    form.namaLengkap.trim() !== "" &&
    form.jenisKelamin.trim() !== "" &&
    form.noHp.trim() !== "";

  const openWhatsApp = () => {
    const ttl = [form.tempatLahir, form.tanggalLahir]
      .filter(Boolean)
      .join(", ");

    const baris = [
      "*FORMULIR PENDAFTARAN SSB SAMPALI PUTRA*",
      "",
      "*— Data Calon Siswa —*",
      `Nama Lengkap: ${form.namaLengkap}`,
      `Nama Panggilan: ${form.namaPanggilan || "-"}`,
      `Jenis Kelamin: ${form.jenisKelamin}`,
      `Tempat, Tgl Lahir: ${ttl || "-"}`,
      `No. Telepon/HP: ${form.noHp}`,
      `Nama Sekolah: ${form.namaSekolah || "-"}`,
      `Kelas: ${form.kelas || "-"}`,
      "",
      "*— Data Fisik —*",
      `Berat Badan: ${form.beratBadan ? form.beratBadan + " kg" : "-"}`,
      `Tinggi Badan: ${form.tinggiBadan ? form.tinggiBadan + " cm" : "-"}`,
      `Golongan Darah: ${form.golonganDarah || "-"}`,
      "",
      "*— Orang Tua/Wali —*",
      `Nama: ${form.namaOrangTua || "-"}`,
    ].join("\n");

    window.open(
      `https://wa.me/${wa}?text=${encodeURIComponent(baris)}`,
      "_blank"
    );
  };

  const kirim = () => {
    if (!valid) return;

    // 1) Buka WhatsApp lebih dulu (di dalam gesture klik) agar tidak diblokir browser
    openWhatsApp();

    // 2) Simpan data ke Sanity di latar belakang (jika dikonfigurasi)
    setStatus("sending");
    fetch("/api/pendaftaran", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      keepalive: true,
    })
      .then((r) => r.json())
      .then((d) => setStatus(d?.ok ? "saved" : "idle"))
      .catch(() => setStatus("error"));
  };

  return (
    <section id="kontak" className="relative bg-ink py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Info & jadwal */}
          <div>
            <p className="tag-label mb-5">Gabung Sekarang</p>
            <h2 className="font-display text-4xl uppercase leading-tight text-bone sm:text-5xl">
              Siap Jadi Bagian <span className="text-pitch">Tim Kami?</span>
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-bone/70">
              Daftarkan putra Anda dan mulai perjalanan menjadi pesepak bola
              hebat. Lengkapi formulir di samping, data akan terkirim ke
              WhatsApp admin dan tim kami segera menghubungi Anda.
            </p>

            {/* Unduh formulir kosong */}
            <a
              href="/formulir-pendaftaran.pdf"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost mt-7 inline-flex"
            >
              ⬇ Unduh Formulir Pendaftaran (PDF)
            </a>

            <div className="mt-10 space-y-4">
              <div className="flex items-start gap-4">
                <span className="mt-1 h-2 w-2 rotate-45 bg-pitch" />
                <div>
                  <div className="font-body text-xs font-bold uppercase tracking-widest text-bone/50">
                    Alamat
                  </div>
                  <div className="text-bone">
                    {settings?.alamat ||
                      "Jl. Irian Barat, Desa Sampali, Percut Sei Tuan"}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="mt-1 h-2 w-2 rotate-45 bg-pitch" />
                <div>
                  <div className="font-body text-xs font-bold uppercase tracking-widest text-bone/50">
                    Kontak
                  </div>
                  <div className="text-bone">
                    {settings?.telepon || "+62 859-4326-8952"}
                  </div>
                  {settings?.email && (
                    <div className="text-bone/70">{settings.email}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Jadwal latihan */}
            <div className="mt-10 border border-bone/10">
              <div className="border-b border-bone/10 bg-coal px-6 py-3 font-display text-sm uppercase tracking-widest text-gold">
                Jadwal Latihan
              </div>
              <div className="divide-y divide-bone/5">
                {jadwal.map((j, i) => (
                  <div key={i} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-bone">{j.hari}</span>
                      <span className="text-bone/60">{j.jam}</span>
                    </div>
                    {j.lapangan && (
                      <a
                        href={
                          j.mapsUrl ||
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            j.lapangan,
                          )}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-bone/60 transition-colors hover:text-pitch"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3.5 w-3.5 text-pitch"
                        >
                          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="underline-offset-2 hover:underline">
                          {j.lapangan}
                        </span>
                        <span className="text-bone/30">· Lihat Peta</span>
                      </a>
                    )}
                    {j.biaya && (
                      <div className="mt-1 text-xs font-semibold text-gold">
                        Biaya Latihan: {j.biaya}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formulir Pendaftaran */}
          <div className="card-edge p-8 lg:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-2xl uppercase tracking-wide text-bone">
                Formulir Pendaftaran
              </h3>
              <a
                href="/formulir-pendaftaran.pdf"
                target="_blank"
                rel="noreferrer"
                className="font-body text-xs font-bold uppercase tracking-widest text-pitch transition-colors hover:text-gold"
              >
                ⬇ Buka PDF
              </a>
            </div>
            <p className="mt-2 text-sm text-bone/50">
              Tanda <span className="text-pitch">*</span> wajib diisi.
            </p>

            {/* Data Calon Siswa */}
            <div className="mt-7 mb-3 font-body text-xs font-bold uppercase tracking-[0.2em] text-gold">
              Data Calon Siswa
            </div>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>
                  Nama Lengkap <span className="text-pitch">*</span>
                </label>
                <input
                  value={form.namaLengkap}
                  onChange={setField("namaLengkap")}
                  placeholder="Nama lengkap calon siswa"
                  className={fieldClass}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Nama Panggilan</label>
                  <input
                    value={form.namaPanggilan}
                    onChange={setField("namaPanggilan")}
                    placeholder="Nama panggilan"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Jenis Kelamin <span className="text-pitch">*</span>
                  </label>
                  <select
                    value={form.jenisKelamin}
                    onChange={setField("jenisKelamin")}
                    className={fieldClass}
                  >
                    <option value="">Pilih...</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Tempat Lahir</label>
                  <input
                    value={form.tempatLahir}
                    onChange={setField("tempatLahir")}
                    placeholder="Contoh: Medan"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Tanggal Lahir</label>
                  <input
                    type="text"
                    value={form.tanggalLahir}
                    onChange={(e) => {
                      const d = e.target.value.replace(/\D/g, "").slice(0, 8);
                      let out = d;
                      if (d.length > 4)
                        out = `${d.slice(0, 2)}-${d.slice(2, 4)}-${d.slice(4)}`;
                      else if (d.length > 2)
                        out = `${d.slice(0, 2)}-${d.slice(2)}`;
                      setForm((prev) => ({ ...prev, tanggalLahir: out }));
                    }}
                    placeholder="dd-mm-yyyy"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="\d{2}-\d{2}-\d{4}"
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Nomor Telepon / HP <span className="text-pitch">*</span>
                </label>
                <input
                  type="tel"
                  value={form.noHp}
                  onChange={setField("noHp")}
                  placeholder="0812xxxxxxxx"
                  className={fieldClass}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Nama Sekolah</label>
                  <input
                    value={form.namaSekolah}
                    onChange={setField("namaSekolah")}
                    placeholder="Asal sekolah"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Kelas</label>
                  <input
                    value={form.kelas}
                    onChange={setField("kelas")}
                    placeholder="Contoh: 4 SD"
                    className={fieldClass}
                  />
                </div>
              </div>
            </div>

            {/* Data Fisik */}
            <div className="mt-8 mb-3 font-body text-xs font-bold uppercase tracking-[0.2em] text-gold">
              Data Fisik
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Berat (kg)</label>
                <input
                  type="number"
                  min="0"
                  value={form.beratBadan}
                  onChange={setField("beratBadan")}
                  placeholder="kg"
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>Tinggi (cm)</label>
                <input
                  type="number"
                  min="0"
                  value={form.tinggiBadan}
                  onChange={setField("tinggiBadan")}
                  placeholder="cm"
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>Gol. Darah</label>
                <select
                  value={form.golonganDarah}
                  onChange={setField("golonganDarah")}
                  className={fieldClass}
                >
                  <option value="">-</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                  <option value="Tidak tahu">Tidak tahu</option>
                </select>
              </div>
            </div>

            {/* Orang Tua / Wali */}
            <div className="mt-8 mb-3 font-body text-xs font-bold uppercase tracking-[0.2em] text-gold">
              Orang Tua / Wali
            </div>
            <div>
              <label className={labelClass}>Nama Orang Tua / Wali</label>
              <input
                value={form.namaOrangTua}
                onChange={setField("namaOrangTua")}
                placeholder="Nama orang tua / wali"
                className={fieldClass}
              />
            </div>

            <button
              onClick={kirim}
              disabled={!valid || status === "sending"}
              className="btn-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === "sending"
                ? "Memproses..."
                : "Kirim Pendaftaran via WhatsApp"}
            </button>

            {/* Status penyimpanan */}
            {status === "saved" ? (
              <p className="mt-3 text-center text-xs font-semibold text-pitch">
                ✓ Data pendaftaran tersimpan. Silakan lanjutkan kirim pesan di
                WhatsApp.
              </p>
            ) : (
              <p className="mt-3 text-center text-xs text-bone/40">
                Tombol akan membuka WhatsApp dengan data formulir terisi
                otomatis.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

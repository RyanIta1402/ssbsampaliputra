import { NextResponse } from "next/server";

import { canManage, getSession } from "@/lib/auth";
import { idDateToIso } from "@/lib/date";
import { getSql, isDbConfigured } from "@/lib/db";
import { pindahkanPendaftaranKeSiswa } from "@/lib/siswaTransfer";
import { isValidWa } from "@/lib/wa";
import { isSanityConfigured } from "@/sanity/env";
import { writeClient } from "@/sanity/lib/writeClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Daftar field yang diizinkan disimpan (whitelist demi keamanan)
const FIELDS = [
  "namaLengkap",
  "namaPanggilan",
  "jenisKelamin",
  "tempatLahir",
  "tanggalLahir",
  "noHp",
  "namaSekolah",
  "kelas",
  "beratBadan",
  "tinggiBadan",
  "golonganDarah",
  "namaOrangTua",
] as const;

type Field = (typeof FIELDS)[number];

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;

    // Nama wajib, dan No WhatsApp wajib berformat nomor WA Indonesia valid.
    if (!body.namaLengkap || !isValidWa(String(body.noHp ?? ""))) {
      return NextResponse.json(
        { ok: false, reason: "invalid" },
        { status: 400 }
      );
    }

    // Ambil hanya nilai string non-kosong sesuai whitelist.
    const data = {} as Record<Field, string | null>;
    for (const f of FIELDS) {
      const val = body[f];
      data[f] =
        typeof val === "string" && val.trim() !== "" ? val.trim() : null;
    }

    // Formulir mengirim tanggal lahir sebagai `dd-mm-yyyy`, sedangkan kolom
    // `tanggal_lahir` (Neon) dan field Sanity bertipe `date` yang butuh ISO
    // `yyyy-mm-dd`. Konversi di sini; nilai tak valid menjadi null agar tidak
    // menggagalkan seluruh proses simpan.
    data.tanggalLahir = idDateToIso(data.tanggalLahir);

    // Foto siswa (opsional): data URL base64 hasil kompres di browser.
    // Divalidasi agar hanya menerima gambar dan membatasi ukuran (~1.1 MB).
    const MAX_FOTO_CHARS = 1_500_000;
    let foto: string | null = null;
    const rawFoto = body.foto;
    if (typeof rawFoto === "string" && rawFoto.startsWith("data:image/")) {
      if (rawFoto.length <= MAX_FOTO_CHARS) foto = rawFoto;
      else console.warn("Foto pendaftaran diabaikan: melebihi batas ukuran.");
    }

    let savedToDb = false;
    let savedToSanity = false;

    // 1) Simpan ke Neon (jika dikonfigurasi). Tautkan ke akun bila sedang login.
    if (isDbConfigured) {
      try {
        const session = await getSession();
        // Status dari body hanya dihormati bila pengirimnya pengelola
        // (form "Tambah Pendaftaran" di grid); pendaftaran publik selalu 'baru'.
        const STATUSES = ["baru", "dihubungi", "diterima", "ditolak"];
        const status =
          session != null &&
          canManage(session.role) &&
          typeof body.status === "string" &&
          STATUSES.includes(body.status)
            ? body.status
            : "baru";
        const sql = getSql();
        const inserted = (await sql`
          insert into pendaftaran (
            user_id, nama_lengkap, nama_panggilan, jenis_kelamin,
            tempat_lahir, tanggal_lahir, no_hp, nama_sekolah, kelas,
            berat_badan, tinggi_badan, golongan_darah, nama_orang_tua, foto,
            status
          ) values (
            ${session?.id ?? null}, ${data.namaLengkap}, ${data.namaPanggilan},
            ${data.jenisKelamin}, ${data.tempatLahir}, ${data.tanggalLahir},
            ${data.noHp}, ${data.namaSekolah}, ${data.kelas}, ${data.beratBadan},
            ${data.tinggiBadan}, ${data.golonganDarah}, ${data.namaOrangTua}, ${foto},
            ${status}
          )
          returning id
        `) as { id: string }[];
        savedToDb = true;

        // Pendaftaran yang admin buat langsung 'diterima' dipindah ke tabel
        // siswa (dan baris pendaftaran yang baru dibuat itu dihapus lagi).
        if (status === "diterima" && inserted[0]) {
          await pindahkanPendaftaranKeSiswa(sql, inserted[0].id);
        }
      } catch (err) {
        console.error("Gagal menyimpan pendaftaran ke Neon:", err);
      }
    }

    // 2) Simpan ke Sanity (jika dikonfigurasi) — tetap dipertahankan.
    if (isSanityConfigured && process.env.SANITY_API_WRITE_TOKEN) {
      try {
        const doc: { _type: string; [key: string]: unknown } = {
          _type: "pendaftaran",
          status: "baru",
          tanggalDaftar: new Date().toISOString(),
        };
        for (const f of FIELDS) {
          if (data[f]) doc[f] = data[f];
        }
        await writeClient.create(doc);
        savedToSanity = true;
      } catch (err) {
        console.error("Gagal menyimpan pendaftaran ke Sanity:", err);
      }
    }

    return NextResponse.json({
      ok: savedToDb || savedToSanity,
      savedToDb,
      savedToSanity,
    });
  } catch (err) {
    console.error("Gagal memproses pendaftaran:", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

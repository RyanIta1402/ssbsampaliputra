import { NextResponse } from "next/server";

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

export async function POST(req: Request) {
  // Jika Sanity belum dikonfigurasi atau token tidak ada,
  // jangan error keras — kembalikan status agar form tetap berjalan
  // (data akan tetap terkirim via WhatsApp di sisi front-end).
  if (!isSanityConfigured || !process.env.SANITY_API_WRITE_TOKEN) {
    return NextResponse.json({ ok: false, reason: "not-configured" });
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;

    if (!body.namaLengkap || !body.noHp) {
      return NextResponse.json(
        { ok: false, reason: "invalid" },
        { status: 400 }
      );
    }

    const doc: { _type: string; [key: string]: unknown } = {
      _type: "pendaftaran",
      status: "baru",
      tanggalDaftar: new Date().toISOString(),
    };

    for (const f of FIELDS) {
      const val = body[f];
      if (typeof val === "string" && val.trim() !== "") {
        doc[f] = val.trim();
      }
    }

    const created = await writeClient.create(doc);
    return NextResponse.json({ ok: true, id: created._id });
  } catch (err) {
    console.error("Gagal menyimpan pendaftaran:", err);
    return NextResponse.json(
      { ok: false, reason: "error" },
      { status: 500 }
    );
  }
}

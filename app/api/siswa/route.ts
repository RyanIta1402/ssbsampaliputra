import { NextResponse } from "next/server";

import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";
import { SISWA_STATUSES, parsePeserta } from "@/lib/peserta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Tambah data siswa oleh admin (POST /api/siswa). */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !canManage(session.role)) {
    return NextResponse.json({ ok: false, reason: "forbidden" }, { status: 403 });
  }
  if (!isDbConfigured) {
    return NextResponse.json(
      { ok: false, reason: "db-not-configured" },
      { status: 503 }
    );
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const parsed = parsePeserta(body);
    const status =
      typeof body.status === "string" && body.status !== ""
        ? body.status
        : "aktif";
    if (!parsed.ok || !(SISWA_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
    }
    const d = parsed.data;

    const sql = getSql();
    // `nis` diisi otomatis: NIS numerik terbesar yang ada + 1, diformat 4 digit
    // (0001, 0002, ...). Subquery dihitung di dalam INSERT agar atomik; unique
    // index siswa_nis_key menjadi pengaman terakhir bila terjadi race.
    const inserted = await sql`
      insert into siswa (
        nis, nama_lengkap, nama_panggilan, jenis_kelamin, tempat_lahir,
        tanggal_lahir, no_hp, nama_sekolah, kelas, berat_badan,
        tinggi_badan, golongan_darah, nama_orang_tua, status, foto
      ) values (
        (select lpad((coalesce(max(nis::int), 0) + 1)::text, 4, '0')
           from siswa where nis ~ '^[0-9]+$'),
        ${d.namaLengkap}, ${d.namaPanggilan}, ${d.jenisKelamin},
        ${d.tempatLahir}, ${d.tanggalLahir}, ${d.noHp}, ${d.namaSekolah},
        ${d.kelas}, ${d.beratBadan}, ${d.tinggiBadan}, ${d.golonganDarah},
        ${d.namaOrangTua}, ${status}, ${d.foto ?? null}
      )
      returning nis
    `;
    return NextResponse.json({ ok: true, nis: inserted[0]?.nis ?? null });
  } catch (err) {
    console.error("Gagal menambah siswa (admin):", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

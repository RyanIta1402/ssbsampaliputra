import { NextResponse } from "next/server";

import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";
import { SISWA_STATUSES, parsePeserta } from "@/lib/peserta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Edit & hapus data siswa oleh admin.
 * - PATCH  : ubah seluruh field data siswa + status (foto opsional:
 *            kirim string data URL untuk ganti, null untuk hapus,
 *            atau jangan sertakan field `foto` agar tidak diubah).
 * - DELETE : hapus siswa.
 */

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    const status = typeof body.status === "string" ? body.status : "";
    if (!parsed.ok || !(SISWA_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
    }
    const d = parsed.data;

    const sql = getSql();
    const updated =
      d.foto === undefined
        ? await sql`
            update siswa set
              nama_lengkap = ${d.namaLengkap}, nama_panggilan = ${d.namaPanggilan},
              jenis_kelamin = ${d.jenisKelamin}, tempat_lahir = ${d.tempatLahir},
              tanggal_lahir = ${d.tanggalLahir}, no_hp = ${d.noHp},
              nama_sekolah = ${d.namaSekolah}, kelas = ${d.kelas},
              berat_badan = ${d.beratBadan}, tinggi_badan = ${d.tinggiBadan},
              golongan_darah = ${d.golonganDarah}, nama_orang_tua = ${d.namaOrangTua},
              status = ${status}, updated_at = now()
            where id = ${params.id}
            returning id`
        : await sql`
            update siswa set
              nama_lengkap = ${d.namaLengkap}, nama_panggilan = ${d.namaPanggilan},
              jenis_kelamin = ${d.jenisKelamin}, tempat_lahir = ${d.tempatLahir},
              tanggal_lahir = ${d.tanggalLahir}, no_hp = ${d.noHp},
              nama_sekolah = ${d.namaSekolah}, kelas = ${d.kelas},
              berat_badan = ${d.beratBadan}, tinggi_badan = ${d.tinggiBadan},
              golongan_darah = ${d.golonganDarah}, nama_orang_tua = ${d.namaOrangTua},
              status = ${status}, foto = ${d.foto}, updated_at = now()
            where id = ${params.id}
            returning id`;

    if (updated.length === 0) {
      return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal mengubah siswa (admin):", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
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
    const sql = getSql();
    // Siswa yang punya riwayat pembayaran SPP tidak boleh dihapus (jaga
    // integritas data keuangan). Backstop: FK spp.siswa_id tanpa cascade.
    const punyaSpp =
      await sql`select 1 from spp where siswa_id = ${params.id} limit 1`;
    if (punyaSpp.length > 0) {
      return NextResponse.json(
        { ok: false, reason: "has-spp" },
        { status: 409 }
      );
    }

    const deleted =
      await sql`delete from siswa where id = ${params.id} returning id`;
    if (deleted.length === 0) {
      return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal menghapus siswa (admin):", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

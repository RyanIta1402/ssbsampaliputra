import { NextResponse } from "next/server";

import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";
import { PENDAFTARAN_STATUSES, parsePeserta } from "@/lib/peserta";
import { pindahkanPendaftaranKeSiswa } from "@/lib/siswaTransfer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Edit & hapus data pendaftaran oleh admin.
 * - PATCH  : ubah seluruh field data anak + status (foto opsional:
 *            kirim string data URL untuk ganti, null untuk hapus,
 *            atau jangan sertakan field `foto` agar tidak diubah).
 * - DELETE : hapus pendaftaran.
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
    if (
      !parsed.ok ||
      !(PENDAFTARAN_STATUSES as readonly string[]).includes(status)
    ) {
      return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
    }
    const d = parsed.data;

    const sql = getSql();
    const updated =
      d.foto === undefined
        ? await sql`
            update pendaftaran set
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
            update pendaftaran set
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

    // Pendaftaran yang diterima langsung DIPINDAH ke tabel siswa (status
    // 'siswa') dan baris pendaftarannya dihapus. UPDATE di atas memastikan
    // hasil edit ikut terbawa saat disalin. Atomik & idempoten.
    if (status === "diterima") {
      await pindahkanPendaftaranKeSiswa(sql, params.id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal mengubah pendaftaran (admin):", err);
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
    const deleted =
      await sql`delete from pendaftaran where id = ${params.id} returning id`;
    if (deleted.length === 0) {
      return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal menghapus pendaftaran (admin):", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

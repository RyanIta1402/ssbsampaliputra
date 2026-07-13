import { NextResponse } from "next/server";

import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";
import { parseIsoDate, parseUang, sppKeterangan } from "@/lib/keuangan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Edit & hapus pembayaran SPP oleh admin.
 * - PATCH  : ubah SPP DAN sinkronkan baris `penerimaan` tertaut (via spp_id).
 * - DELETE : hapus SPP; baris penerimaan tertaut ikut terhapus otomatis
 *            (foreign key ON DELETE CASCADE).
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
    const tglbayar = parseIsoDate(body.tglbayar);
    const bulan = parseIsoDate(body.bulan); // "yyyy-mm-01" dari input bulan (kolom date)
    const iuran = parseUang(body.iuran);
    const siswaId =
      typeof body.siswaId === "string" && body.siswaId.trim() !== ""
        ? body.siswaId.trim()
        : null;

    if (!bulan || iuran === null || !siswaId) {
      return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
    }

    const sql = getSql();
    const updated = await sql`
      update spp set tglbayar = ${tglbayar}, bulan = ${bulan}, iuran = ${iuran},
        siswa_id = ${siswaId}, userid = ${session.id}, updated_at = now()
      where id = ${params.id}
      returning id`;
    if (updated.length === 0) {
      return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 });
    }

    // Sinkronkan baris penerimaan yang berasal dari SPP ini.
    await sql`
      update penerimaan
      set tgl = ${tglbayar}, keterangan = ${sppKeterangan(bulan)}, nominal = ${iuran},
        userid = ${session.id}, updated_at = now()
      where spp_id = ${params.id}`;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal mengubah SPP:", err);
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
    // Baris penerimaan tertaut ikut terhapus lewat ON DELETE CASCADE.
    const deleted =
      await sql`delete from spp where id = ${params.id} returning id`;
    if (deleted.length === 0) {
      return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal menghapus SPP:", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";
import { parseIsoDate, parseUang } from "@/lib/keuangan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Edit & hapus penerimaan oleh admin.
 * PENTING: baris yang berasal dari SPP (spp_id != null) TIDAK boleh diedit
 * atau dihapus dari sini — diubah/dihapus lewat menu SPP agar tetap sinkron.
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
    const tgl = parseIsoDate(body.tgl);
    const keterangan =
      typeof body.keterangan === "string" && body.keterangan.trim()
        ? body.keterangan.trim()
        : null;
    const nominal = parseUang(body.nominal);

    if (!keterangan || nominal === null) {
      return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
    }

    const sql = getSql();
    const target =
      await sql`select spp_id from penerimaan where id = ${params.id}`;
    if (target.length === 0) {
      return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 });
    }
    if (target[0].spp_id != null) {
      return NextResponse.json({ ok: false, reason: "dari-spp" }, { status: 409 });
    }

    await sql`
      update penerimaan
      set tgl = ${tgl}, keterangan = ${keterangan}, nominal = ${nominal},
        userid = ${session.id}, updated_at = now()
      where id = ${params.id}
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal mengubah penerimaan:", err);
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
    const target =
      await sql`select spp_id from penerimaan where id = ${params.id}`;
    if (target.length === 0) {
      return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 });
    }
    if (target[0].spp_id != null) {
      return NextResponse.json({ ok: false, reason: "dari-spp" }, { status: 409 });
    }

    await sql`delete from penerimaan where id = ${params.id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal menghapus penerimaan:", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Edit & hapus pendaftaran siswa ke turnamen (`listturnamen`) oleh pengelola.
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
    const body = (await req.json()) as {
      siswaId?: string;
      turnamenId?: string;
      keterangan?: string;
    };

    const siswaId =
      typeof body.siswaId === "string" && body.siswaId.trim() !== ""
        ? body.siswaId.trim()
        : null;
    const turnamenId =
      typeof body.turnamenId === "string" && body.turnamenId.trim() !== ""
        ? body.turnamenId.trim()
        : null;
    const keterangan = body.keterangan?.trim() || null;

    if (!siswaId || !turnamenId) {
      return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
    }

    const sql = getSql();

    // Cegah duplikat (siswa+turnamen) selain baris ini sendiri.
    const dup =
      await sql`select id from listturnamen where siswa_id = ${siswaId} and turnamen_id = ${turnamenId} and id <> ${params.id}`;
    if (dup.length > 0) {
      return NextResponse.json(
        { ok: false, reason: "duplikat" },
        { status: 409 }
      );
    }

    const updated = await sql`
      update listturnamen
      set turnamen_id = ${turnamenId}, siswa_id = ${siswaId},
        keterangan = ${keterangan}, updated_at = now(), userid = ${session.id}
      where id = ${params.id}
      returning id`;
    if (updated.length === 0) {
      return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal mengubah list turnamen:", err);
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
      await sql`delete from listturnamen where id = ${params.id} returning id`;
    if (deleted.length === 0) {
      return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal menghapus list turnamen:", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

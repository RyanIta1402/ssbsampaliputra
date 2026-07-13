import { NextResponse } from "next/server";

import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";
import { parseIsoDate } from "@/lib/keuangan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Edit & hapus data master turnamen oleh pengelola (admin/pelatih).
 * - PATCH  : ubah nama, tanggal, keterangan (nama tetap unik).
 * - DELETE : hapus turnamen; ditolak bila masih dipakai di list turnamen.
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

  const id = params.id;

  try {
    const body = (await req.json()) as {
      nama?: string;
      keterangan?: string;
      tgl?: unknown;
    };

    const nama = body.nama?.trim() ?? "";
    const keterangan = body.keterangan?.trim() || null;
    const tgl = parseIsoDate(body.tgl);

    if (!nama) {
      return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
    }

    const sql = getSql();

    const target = await sql`select id from turnamen where id = ${id}`;
    if (target.length === 0) {
      return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 });
    }

    // Nama harus tetap unik (kecuali milik turnamen ini sendiri).
    const dup =
      await sql`select id from turnamen where lower(namaturnamen) = lower(${nama}) and id <> ${id}`;
    if (dup.length > 0) {
      return NextResponse.json(
        { ok: false, reason: "nama-exists" },
        { status: 409 }
      );
    }

    await sql`
      update turnamen
      set namaturnamen = ${nama}, keteranganturnamen = ${keterangan},
        tglturnamen = ${tgl}, updated_at = now(), userid = ${session.id}
      where id = ${id}
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal mengubah turnamen:", err);
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

  const id = params.id;

  try {
    const sql = getSql();

    // Turnamen yang masih dipakai di list turnamen tidak boleh dihapus.
    const dipakai =
      await sql`select 1 from listturnamen where turnamen_id = ${id} limit 1`;
    if (dipakai.length > 0) {
      return NextResponse.json(
        { ok: false, reason: "has-list" },
        { status: 409 }
      );
    }

    const deleted =
      await sql`delete from turnamen where id = ${id} returning id`;
    if (deleted.length === 0) {
      return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal menghapus turnamen:", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

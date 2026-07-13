import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Edit & hapus data master role oleh admin.
 * - PATCH  : ubah nama & deskripsi (nama tetap unik tanpa memandang kapital).
 * - DELETE : hapus role.
 */

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
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
      deskripsi?: string;
    };

    const nama = body.nama?.trim() ?? "";
    const deskripsi = body.deskripsi?.trim() || null;

    if (!nama) {
      return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
    }

    const sql = getSql();

    const target = await sql`select id from role where id = ${id}`;
    if (target.length === 0) {
      return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 });
    }

    // Nama harus tetap unik (kecuali milik role ini sendiri).
    const dup =
      await sql`select id from role where lower(role) = lower(${nama}) and id <> ${id}`;
    if (dup.length > 0) {
      return NextResponse.json(
        { ok: false, reason: "nama-exists" },
        { status: 409 }
      );
    }

    await sql`
      update role
      set role = ${nama}, deskripsi = ${deskripsi}, updated_at = now(),
        userid = ${session.id}
      where id = ${id}
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal mengubah role:", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
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
    const deleted =
      await sql`delete from role where id = ${id} returning id`;
    if (deleted.length === 0) {
      return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal menghapus role:", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

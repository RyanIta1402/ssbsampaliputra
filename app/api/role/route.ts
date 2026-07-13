import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Pembuatan data master role oleh admin.
 * Hanya admin yang boleh; nama role unik (tanpa memandang huruf besar/kecil).
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { ok: false, reason: "forbidden" },
      { status: 403 }
    );
  }
  if (!isDbConfigured) {
    return NextResponse.json(
      { ok: false, reason: "db-not-configured" },
      { status: 503 }
    );
  }

  try {
    const body = (await req.json()) as {
      nama?: string;
      deskripsi?: string;
    };

    const nama = body.nama?.trim() ?? "";
    const deskripsi = body.deskripsi?.trim() || null;

    if (!nama) {
      return NextResponse.json(
        { ok: false, reason: "invalid" },
        { status: 400 }
      );
    }

    const sql = getSql();

    const existing =
      await sql`select id from role where lower(role) = lower(${nama})`;
    if (existing.length > 0) {
      return NextResponse.json(
        { ok: false, reason: "nama-exists" },
        { status: 409 }
      );
    }

    await sql`
      insert into role (role, deskripsi, userid)
      values (${nama}, ${deskripsi}, ${session.id})
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal membuat role:", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

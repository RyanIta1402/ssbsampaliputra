import { NextResponse } from "next/server";

import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";
import { parseIsoDate } from "@/lib/keuangan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Pembuatan data master turnamen oleh pengelola (admin/pelatih).
 * Nama turnamen unik tanpa memandang huruf besar/kecil.
 */
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
    const body = (await req.json()) as {
      nama?: string;
      keterangan?: string;
      tgl?: unknown;
    };

    const nama = body.nama?.trim() ?? "";
    const keterangan = body.keterangan?.trim() || null;
    const tgl = parseIsoDate(body.tgl); // opsional (kolom nullable)

    if (!nama) {
      return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
    }

    const sql = getSql();

    const existing =
      await sql`select id from turnamen where lower(namaturnamen) = lower(${nama})`;
    if (existing.length > 0) {
      return NextResponse.json(
        { ok: false, reason: "nama-exists" },
        { status: 409 }
      );
    }

    await sql`
      insert into turnamen (namaturnamen, keteranganturnamen, tglturnamen, userid)
      values (${nama}, ${keterangan}, ${tgl}, ${session.id})
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal membuat turnamen:", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

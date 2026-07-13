import { NextResponse } from "next/server";

import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";
import { parseIsoDate, parseUang } from "@/lib/keuangan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Pembuatan penerimaan (kas masuk) manual oleh admin. Baris yang berasal
 * dari SPP TIDAK dibuat lewat sini — melainkan otomatis lewat /api/spp.
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
    await sql`
      insert into penerimaan (tgl, keterangan, nominal, userid)
      values (${tgl}, ${keterangan}, ${nominal}, ${session.id})
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal menyimpan penerimaan:", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

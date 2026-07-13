import { NextResponse } from "next/server";

import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Ubah status bayar satu baris list turnamen. Kolom `listturnamen.statusbayar`
 * bertipe bit: '1' = sudah bayar (lunas), '0' = belum bayar. Dipakai tombol
 * ikon centang (toggle) di kolom Aksi grid List Turnamen.
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
    const body = (await req.json()) as { statusbayar?: boolean };
    if (typeof body.statusbayar !== "boolean") {
      return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
    }
    const bit = body.statusbayar ? "1" : "0";

    const sql = getSql();
    const updated = await sql`
      update listturnamen
      set statusbayar = ${bit}::bit, updated_at = now(), userid = ${session.id}
      where id = ${params.id}
      returning id`;
    if (updated.length === 0) {
      return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal mengubah status bayar turnamen:", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

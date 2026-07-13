import { NextResponse } from "next/server";

import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";
import { parseIsoDate, parseUang, sppKeterangan } from "@/lib/keuangan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Pembuatan pembayaran SPP oleh admin. Saat SPP dibuat, otomatis membuat
 * satu baris `penerimaan` tertaut (kolom `spp_id`) dalam satu statement
 * atomik — jadi kas masuk selalu sinkron dengan pembayaran SPP.
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
    const tglbayar = parseIsoDate(body.tglbayar); // opsional (kolom nullable)
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
    const keterangan = sppKeterangan(bulan);

    // Insert SPP + baris penerimaan tertaut sekaligus (atomik).
    await sql`
      with s as (
        insert into spp (tglbayar, bulan, iuran, userid, siswa_id)
        values (${tglbayar}, ${bulan}, ${iuran}, ${session.id}, ${siswaId})
        returning id, tglbayar, iuran, userid
      )
      insert into penerimaan (tgl, keterangan, nominal, userid, spp_id)
      select tglbayar, ${keterangan}, iuran, userid, id from s
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal menyimpan SPP:", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

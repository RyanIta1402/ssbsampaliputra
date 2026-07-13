import { NextResponse } from "next/server";

import { canManage, getSession } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Pendaftaran siswa ke sebuah turnamen (tabel `listturnamen`) oleh pengelola.
 * Menautkan `siswa_id` + `turnamen_id`.
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

    // Cegah duplikat: satu siswa hanya sekali per turnamen.
    const dup =
      await sql`select id from listturnamen where siswa_id = ${siswaId} and turnamen_id = ${turnamenId}`;
    if (dup.length > 0) {
      return NextResponse.json(
        { ok: false, reason: "duplikat" },
        { status: 409 }
      );
    }

    // Pendaftaran baru selalu mulai "Belum Bayar" ('0') agar pengelola
    // menandai lunas lewat tombol centang di grid saat pembayaran masuk.
    await sql`
      insert into listturnamen (turnamen_id, siswa_id, keterangan, statusbayar, userid)
      values (${turnamenId}, ${siswaId}, ${keterangan}, ${"0"}::bit, ${session.id})
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal menyimpan list turnamen:", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

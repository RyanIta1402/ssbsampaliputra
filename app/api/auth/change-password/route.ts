import { NextResponse } from "next/server";

import { getSession, hashPassword, verifyPassword } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, reason: "unauthorized" },
      { status: 401 }
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
      currentPassword?: string;
      newPassword?: string;
    };
    const currentPassword = body.currentPassword ?? "";
    const newPassword = body.newPassword ?? "";

    if (newPassword.length < 6) {
      return NextResponse.json(
        { ok: false, reason: "invalid" },
        { status: 400 }
      );
    }

    const sql = getSql();
    const rows =
      await sql`select password_hash from users where id = ${session.id}`;
    if (rows.length === 0) {
      return NextResponse.json(
        { ok: false, reason: "unauthorized" },
        { status: 401 }
      );
    }

    // Verifikasi kata sandi lama sebelum mengizinkan perubahan.
    if (!verifyPassword(currentPassword, String(rows[0].password_hash))) {
      return NextResponse.json(
        { ok: false, reason: "wrong-current" },
        { status: 400 }
      );
    }

    await sql`
      update users set password_hash = ${hashPassword(newPassword)}
      where id = ${session.id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal mengubah kata sandi:", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

import { createSession, verifyPassword, type Role } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";
import { normalizeUsername } from "@/lib/username";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isDbConfigured) {
    return NextResponse.json(
      { ok: false, reason: "db-not-configured" },
      { status: 503 }
    );
  }

  try {
    const body = (await req.json()) as {
      username?: string;
      password?: string;
    };
    const username = normalizeUsername(body.username ?? "");
    const password = body.password ?? "";

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, reason: "invalid" },
        { status: 400 }
      );
    }

    const sql = getSql();
    const rows = await sql`
      select id, username, email, nama, role, password_hash
      from users where username = ${username}
    `;
    const u = rows[0] as
      | {
          id: string;
          username: string;
          email: string | null;
          nama: string;
          role: Role;
          password_hash: string;
        }
      | undefined;

    if (!u || !verifyPassword(password, u.password_hash)) {
      return NextResponse.json(
        { ok: false, reason: "invalid" },
        { status: 401 }
      );
    }

    await createSession({
      id: u.id,
      username: u.username,
      email: u.email ?? "",
      nama: u.nama,
      role: u.role,
    });
    return NextResponse.json({ ok: true, role: u.role });
  } catch (err) {
    console.error("Gagal login:", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

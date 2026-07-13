import { NextResponse } from "next/server";

import { getSession, hashPassword } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";
import { isValidUsername, normalizeUsername } from "@/lib/username";
import { isValidWa } from "@/lib/wa";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Pembuatan user oleh admin (menggantikan pendaftaran akun publik).
 * Hanya admin yang boleh; tidak membuat sesi (admin tetap login sebagai
 * dirinya sendiri) dan role bisa dipilih (member/admin).
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
      username?: string;
      email?: string;
      password?: string;
      noHp?: string;
      role?: string;
    };

    const nama = body.nama?.trim() ?? "";
    const username = normalizeUsername(body.username ?? "");
    const email = body.email?.trim().toLowerCase() || null;
    const password = body.password ?? "";
    const noHp = body.noHp?.trim() || null;
    const role = body.role?.trim() ?? "";

    if (
      !nama ||
      !isValidUsername(username) ||
      password.length < 6 ||
      !role ||
      (noHp && !isValidWa(noHp))
    ) {
      return NextResponse.json(
        { ok: false, reason: "invalid" },
        { status: 400 }
      );
    }

    const sql = getSql();

    // Role harus ada di tabel master `role` (lookup).
    const roleExists =
      await sql`select 1 from role where lower(role) = lower(${role})`;
    if (roleExists.length === 0) {
      return NextResponse.json(
        { ok: false, reason: "invalid-role" },
        { status: 400 }
      );
    }

    const existingUser =
      await sql`select id from users where username = ${username}`;
    if (existingUser.length > 0) {
      return NextResponse.json(
        { ok: false, reason: "username-exists" },
        { status: 409 }
      );
    }
    if (email) {
      const existingEmail =
        await sql`select id from users where email = ${email}`;
      if (existingEmail.length > 0) {
        return NextResponse.json(
          { ok: false, reason: "email-exists" },
          { status: 409 }
        );
      }
    }

    await sql`
      insert into users (nama, username, email, password_hash, no_hp, role)
      values (${nama}, ${username}, ${email}, ${hashPassword(password)}, ${noHp}, ${role})
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal membuat user (admin):", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

import { getSession, hashPassword } from "@/lib/auth";
import { getSql, isDbConfigured } from "@/lib/db";
import { isValidUsername, normalizeUsername } from "@/lib/username";
import { isValidWa } from "@/lib/wa";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Edit & hapus user oleh admin.
 * - PATCH  : ubah nama, username, email, no_hp, role, dan (opsional) kata sandi.
 * - DELETE : hapus user.
 *
 * Pengaman: admin tidak boleh menurunkan role dirinya sendiri dari admin
 * maupun menghapus akunnya sendiri (mencegah terkunci dari sistem).
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
      (password !== "" && password.length < 6) ||
      !role ||
      (noHp && !isValidWa(noHp))
    ) {
      return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
    }

    // Cegah admin menurunkan role dirinya sendiri (agar tak terkunci).
    if (id === session.id && role.toLowerCase() !== "admin") {
      return NextResponse.json(
        { ok: false, reason: "self-demote" },
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

    const target = await sql`select id from users where id = ${id}`;
    if (target.length === 0) {
      return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 });
    }

    // Username & email harus tetap unik (kecuali milik user ini sendiri).
    const dupUser =
      await sql`select id from users where username = ${username} and id <> ${id}`;
    if (dupUser.length > 0) {
      return NextResponse.json(
        { ok: false, reason: "username-exists" },
        { status: 409 }
      );
    }
    if (email) {
      const dupEmail =
        await sql`select id from users where email = ${email} and id <> ${id}`;
      if (dupEmail.length > 0) {
        return NextResponse.json(
          { ok: false, reason: "email-exists" },
          { status: 409 }
        );
      }
    }

    if (password !== "") {
      await sql`
        update users
        set nama = ${nama}, username = ${username}, email = ${email},
            no_hp = ${noHp}, role = ${role}, password_hash = ${hashPassword(password)},
            updated_at = now()
        where id = ${id}
      `;
    } else {
      await sql`
        update users
        set nama = ${nama}, username = ${username}, email = ${email},
            no_hp = ${noHp}, role = ${role}, updated_at = now()
        where id = ${id}
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal mengubah user (admin):", err);
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

  // Cegah admin menghapus akunnya sendiri.
  if (id === session.id) {
    return NextResponse.json(
      { ok: false, reason: "self-delete" },
      { status: 400 }
    );
  }

  try {
    const sql = getSql();
    const deleted =
      await sql`delete from users where id = ${id} returning id`;
    if (deleted.length === 0) {
      return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal menghapus user (admin):", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}

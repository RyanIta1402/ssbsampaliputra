import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

/**
 * Autentikasi sederhana berbasis email + kata sandi.
 * - Kata sandi di-hash dengan scrypt bawaan Node (tanpa dependency tambahan).
 * - Sesi login disimpan sebagai JWT di cookie httpOnly (ditandatangani jose).
 *
 * Modul server-only. Jangan diimpor ke komponen client.
 */

const COOKIE_NAME = "ssb_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 hari

export type Role = "admin" | "pelatih" | "member";

export type SessionUser = {
  id: string;
  username: string;
  email: string;
  nama: string;
  role: Role;
};

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET belum diisi. Isi di .env.local — lihat NEON_SETUP.md."
    );
  }
  return new TextEncoder().encode(secret);
}

// ---- Hash kata sandi (scrypt) -----------------------------------------

/** Menghasilkan string "salt:hash" untuk disimpan di kolom password_hash. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

/** Membandingkan kata sandi dengan hash tersimpan secara aman (timing-safe). */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const keyBuffer = Buffer.from(key, "hex");
  const derived = scryptSync(password, salt, 64);
  return (
    keyBuffer.length === derived.length && timingSafeEqual(keyBuffer, derived)
  );
}

// ---- Sesi login (JWT di cookie) ---------------------------------------

export async function createSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({
    username: user.username,
    email: user.email,
    nama: user.nama,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      username: String(payload.username ?? ""),
      email: String(payload.email ?? ""),
      nama: String(payload.nama ?? ""),
      // Normalisasi role tanpa memandang huruf besar/kecil: nilai berasal dari
      // tabel master `role` yang bisa ditulis "admin"/"Admin"/"PELATIH" dst.
      // "admin" & "pelatih" adalah peran pengelola; nilai lain diperlakukan
      // sebagai pengguna biasa ("member") untuk keperluan gating.
      role: normalizeRole(payload.role),
    };
  } catch {
    return null;
  }
}

export function destroySession(): void {
  cookies().delete(COOKIE_NAME);
}

// ---- Peran & otorisasi -------------------------------------------------

/**
 * Memetakan nilai role mentah (dari JWT / tabel master) ke salah satu peran
 * yang dikenal sistem, tanpa memandang huruf besar/kecil. Peran di luar
 * "admin"/"pelatih" diperlakukan sebagai "member".
 */
function normalizeRole(value: unknown): Role {
  const role = String(value ?? "").toLowerCase();
  if (role === "admin") return "admin";
  if (role === "pelatih") return "pelatih";
  return "member";
}

/**
 * Peran pengelola: admin atau pelatih. Keduanya boleh membuka area
 * pengelolaan (Siswa, SPP, Pendaftaran, Penerimaan, Pengeluaran, Laporan).
 * Hanya admin yang boleh mengelola Role dan Daftar User.
 */
export function canManage(role: Role): boolean {
  return role === "admin" || role === "pelatih";
}

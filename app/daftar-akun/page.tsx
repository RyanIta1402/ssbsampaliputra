import { redirect } from "next/navigation";

import { canManage, getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Pendaftaran akun publik dinonaktifkan — pembuatan akun kini dilakukan
 * admin di halaman Daftar User (/user). Rute lama ini dialihkan agar
 * tautan/bookmark tetap berfungsi.
 */
export default async function DaftarAkunPage() {
  const session = await getSession();
  if (session) redirect(canManage(session.role) ? "/dashboard" : "/akun");
  redirect("/login");
}

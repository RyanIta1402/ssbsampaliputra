import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AccountHeader from "@/components/account/AccountHeader";
import ChangePasswordForm from "@/components/account/ChangePasswordForm";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Ubah Password",
  robots: { index: false, follow: false },
};

export default async function UbahPasswordPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen bg-ink">
      <AccountHeader role={session.role} userName={session.nama} />
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <p className="tag-label mb-3">Keamanan Akun</p>
        <h1 className="font-display text-3xl uppercase leading-tight text-bone sm:text-4xl">
          Ubah <span className="text-pitch">Password</span>
        </h1>
        <p className="mt-3 max-w-lg text-bone/60">
          Masukkan kata sandi saat ini lalu kata sandi baru Anda (minimal 6
          karakter).
        </p>
        <div className="mt-8">
          <ChangePasswordForm />
        </div>
      </div>
    </main>
  );
}

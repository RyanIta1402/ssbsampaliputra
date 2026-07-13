import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import { canManage, getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Login",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(canManage(session.role) ? "/dashboard" : "/akun");

  return (
    <AuthShell title="Login" subtitle="Login ke akun SSB Sampali Putra Anda.">
      <LoginForm />
    </AuthShell>
  );
}

"use client";

import { useState } from "react";

export default function LogoutButton({
  className,
}: {
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // abaikan — tetap arahkan ke beranda
    }
    // Hard navigation: full reload ke beranda agar seluruh cache RSC/state
    // client dibuang dan server component render ulang tanpa sesi. Lebih andal
    // daripada router.push()+refresh() yang bisa saling membatalkan.
    window.location.href = "/";
  };

  return (
    <button
      onClick={logout}
      disabled={loading}
      className={
        className ??
        "btn-ghost !px-4 !py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
      }
    >
      {loading ? "Keluar..." : "Keluar"}
    </button>
  );
}

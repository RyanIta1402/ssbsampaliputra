"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const fieldClass =
  "w-full border border-bone/15 bg-coal px-4 py-3 text-bone outline-none transition-colors placeholder:text-bone/30 focus:border-pitch";
const labelClass =
  "mb-2 block font-body text-xs font-bold uppercase tracking-widest text-bone/50";

export default function ChangePasswordForm() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDone(false);
    if (next.length < 6) {
      setError("Kata sandi baru minimal 6 karakter.");
      return;
    }
    if (next !== confirm) {
      setError("Konfirmasi kata sandi tidak sama.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (data.ok) {
        setDone(true);
        setCurrent("");
        setNext("");
        setConfirm("");
        router.refresh();
      } else if (data.reason === "wrong-current") {
        setError("Kata sandi saat ini salah.");
      } else if (data.reason === "db-not-configured") {
        setError("Database belum dikonfigurasi. Hubungi admin.");
      } else {
        setError("Gagal mengubah kata sandi. Coba lagi.");
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-md space-y-5">
      <div>
        <label className={labelClass}>Kata Sandi Saat Ini</label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="••••••••"
          className={fieldClass}
        />
      </div>
      <div>
        <label className={labelClass}>Kata Sandi Baru</label>
        <input
          type="password"
          required
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          placeholder="Minimal 6 karakter"
          className={fieldClass}
        />
      </div>
      <div>
        <label className={labelClass}>Ulangi Kata Sandi Baru</label>
        <input
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Ulangi kata sandi baru"
          className={fieldClass}
        />
      </div>

      {error && <p className="text-sm font-semibold text-red-400">{error}</p>}
      {done && (
        <p className="text-sm font-semibold text-pitch">
          ✓ Kata sandi berhasil diubah.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Menyimpan..." : "Simpan Kata Sandi"}
      </button>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const fieldClass =
  "w-full border border-bone/15 bg-coal px-4 py-3 text-bone outline-none transition-colors placeholder:text-bone/30 focus:border-pitch";
const labelClass =
  "mb-2 block font-body text-xs font-bold uppercase tracking-widest text-bone/50";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.ok) {
        // Pengelola (admin/pelatih) diarahkan ke dashboard; member ke /akun.
        const role = String(data.role).toLowerCase();
        const bisaKelola = role === "admin" || role === "pelatih";
        router.push(bisaKelola ? "/dashboard" : "/akun");
        router.refresh();
        return;
      }
      if (data.reason === "db-not-configured") {
        setError("Database belum dikonfigurasi. Hubungi admin.");
      } else {
        setError("Nama user atau kata sandi salah.");
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className={labelClass}>Nama User</label>
        <input
          type="text"
          required
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nama user Anda"
          className={fieldClass}
        />
      </div>
      <div>
        <label className={labelClass}>Kata Sandi</label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className={fieldClass}
        />
      </div>

      {error && (
        <p className="text-sm font-semibold text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Memproses..." : "Login"}
      </button>
    </form>
  );
}

import AuthShell from "@/components/auth/AuthShell";

/**
 * Skeleton yang tampil SEKETIKA saat menavigasi ke /login, selagi server
 * merender halaman (lihat app/login/page.tsx yang `await getSession()`).
 *
 * Memakai ulang AuthShell agar kerangka (logo, kartu, link "kembali") identik
 * dengan halaman asli — jadi ketika LoginForm sungguhan muncul, tidak ada
 * layout shift. Judul & subjudul sengaja disamakan dengan page.tsx.
 */
export default function LoginLoading() {
  return (
    <AuthShell title="Login" subtitle="Login ke akun SSB Sampali Putra Anda.">
      <div className="animate-pulse space-y-5" aria-hidden>
        {/* Field: Nama User */}
        <div>
          <div className="mb-2 h-3 w-20 bg-bone/10" />
          <div className="h-[50px] w-full border border-bone/10 bg-bone/5" />
        </div>

        {/* Field: Kata Sandi */}
        <div>
          <div className="mb-2 h-3 w-24 bg-bone/10" />
          <div className="h-[50px] w-full border border-bone/10 bg-bone/5" />
        </div>

        {/* Tombol Login */}
        <div className="h-[52px] w-full bg-bone/10" />
      </div>

      <span className="sr-only">Memuat halaman login…</span>
    </AuthShell>
  );
}

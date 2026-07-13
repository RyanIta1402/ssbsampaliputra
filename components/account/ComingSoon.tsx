import Link from "next/link";

/**
 * Placeholder untuk halaman menu yang belum berisi fungsionalitas
 * (Role, Ubah Password, Daftar User, Siswa, Pendaftaran). Menjaga agar
 * tautan menu tetap berfungsi (tidak 404) selagi halaman digarap.
 */
export default function ComingSoon({ title }: { title: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-5 text-center">
      <p className="tag-label mb-3">Menu</p>
      <h1 className="font-display text-3xl uppercase tracking-wide text-bone sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-bone/60">
        Halaman ini sedang dikembangkan.
      </p>
      <Link href="/akun" className="btn-primary mt-8 inline-flex">
        ← Kembali ke Akun Saya
      </Link>
    </main>
  );
}

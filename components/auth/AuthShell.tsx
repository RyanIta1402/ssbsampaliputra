import Image from "next/image";
import Link from "next/link";

/**
 * Bingkai halaman autentikasi (Login / Daftar Akun).
 * Memakai gaya yang sama seperti kartu formulir pendaftaran:
 * latar gelap `ink`, kartu `card-edge`, aksen hijau `pitch`.
 */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-ink px-5 py-16">
      <div className="pointer-events-none absolute inset-0 bg-grid-faint opacity-40 [background-size:44px_44px]" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-3"
        >
          <Image
            src="/logo.png"
            alt="Logo SSB Sampali Putra"
            width={48}
            height={48}
            className="h-12 w-12 object-contain"
            priority
          />
          <span className="font-display text-xl uppercase tracking-wide text-bone">
            SSB Sampali Putra
          </span>
        </Link>

        <div className="card-edge p-8 lg:p-10">
          <h1 className="font-display text-3xl uppercase tracking-wide text-bone">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-sm text-bone/50">{subtitle}</p>}
          <div className="mt-7">{children}</div>
        </div>

        {footer && (
          <div className="mt-6 text-center text-sm text-bone/60">{footer}</div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="font-body text-xs uppercase tracking-widest text-bone/40 transition-colors hover:text-pitch"
          >
            ← Kembali ke beranda
          </Link>
        </div>
      </div>
    </main>
  );
}

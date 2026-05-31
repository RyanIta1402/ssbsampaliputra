"use client";

import { CSSProperties, ReactNode, useRef } from "react";

/**
 * AnimatedCard — wrapper card dengan efek tren 2026:
 *  - Cursor spotlight (radial gradient mengikuti mouse)
 *  - 3D tilt halus (perspective + rotateX/rotateY)
 *  - Conic gradient border yang berputar saat hover
 *  - Sheen sweep
 *  - Lift saat hover
 *
 * Isi card disisipkan via children. Komponen ini hanya menyediakan
 * kontainer & efek — layout konten ditentukan oleh caller.
 */
export default function AnimatedCard({
  children,
  className = "",
  padded = true,
  spotlightSize = 280,
  tiltMax = 4,
}: {
  children: ReactNode;
  className?: string;
  /** Tambah padding default p-6 di inner. Set false kalau child sudah punya padding sendiri. */
  padded?: boolean;
  /** Diameter radial spotlight dalam px. */
  spotlightSize?: number;
  /** Maksimum derajat tilt 3D. */
  tiltMax?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
    const tiltX = ((50 - y) / 50) * tiltMax;
    const tiltY = ((x - 50) / 50) * tiltMax;
    el.style.setProperty("--tx", `${tiltX}deg`);
    el.style.setProperty("--ty", `${tiltY}deg`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tx", `0deg`);
    el.style.setProperty("--ty", `0deg`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={
        {
          "--mx": "50%",
          "--my": "50%",
          "--tx": "0deg",
          "--ty": "0deg",
          transform:
            "perspective(900px) rotateX(var(--tx)) rotateY(var(--ty))",
          transformStyle: "preserve-3d",
        } as CSSProperties
      }
      className={`group relative h-full transition-transform duration-300 ease-out [will-change:transform] hover:[transform:perspective(900px)_rotateX(var(--tx))_rotateY(var(--ty))_translateY(-6px)] ${className}`}
    >
      {/* Conic gradient glow border */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px overflow-hidden rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      >
        <div className="absolute inset-[-50%] animate-conic bg-[conic-gradient(from_0deg,transparent_0deg,rgba(22,240,74,0.55)_60deg,transparent_120deg,transparent_240deg,rgba(245,197,66,0.4)_300deg,transparent_360deg)]" />
      </div>

      <div
        className={`relative h-full overflow-hidden rounded-xl border border-bone/10 bg-coal transition-colors duration-500 group-hover:border-pitch/40 ${
          padded ? "p-6" : ""
        }`}
      >
        {/* Spotlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle ${spotlightSize}px at var(--mx) var(--my), rgba(22,240,74,0.16), transparent 60%)`,
          }}
        />

        {/* Sheen */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100"
        >
          <div className="absolute -inset-y-1 left-0 w-1/3 bg-gradient-to-r from-transparent via-bone/8 to-transparent opacity-0 group-hover:animate-sheen group-hover:opacity-100" />
        </div>

        {/* Konten */}
        <div className="relative h-full">{children}</div>
      </div>
    </div>
  );
}

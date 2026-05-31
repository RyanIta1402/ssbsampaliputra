import Image from "next/image";
import type { Image as SanityImageType } from "sanity";

import { urlFor } from "@/sanity/lib/image";

/**
 * Menampilkan gambar dari Sanity bila tersedia.
 * Bila belum ada gambar di CMS, menampilkan placeholder bergradien
 * agar layout tetap rapi sebelum konten diisi.
 */
export default function SanityImage({
  image,
  alt,
  className = "",
  width = 1200,
  height = 800,
  fallbackLabel,
}: {
  image?: SanityImageType;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackLabel?: string;
}) {
  if (!image || !(image as { asset?: unknown }).asset) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-coal via-ink to-coal ${className}`}
        aria-label={alt}
      >
        <span className="px-4 text-center font-display text-sm uppercase tracking-widest text-bone/20">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={urlFor(image).width(width).height(height).fit("crop").url()}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}

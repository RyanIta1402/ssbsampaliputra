import type { MetadataRoute } from "next";

const SITE_URL = "https://ssbsampaliputra.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // Section di halaman utama — anchor links agar Google
  // memahami struktur halaman tunggal (single-page).
  const sections = [
    "",
    "#tentang",
    "#program",
    "#pelatih",
    "#pengurus",
    "#galeri",
    "#kontak",
  ];

  return sections.map((s) => ({
    url: `${SITE_URL}/${s}`,
    lastModified,
    changeFrequency: "weekly",
    priority: s === "" ? 1.0 : 0.8,
  }));
}

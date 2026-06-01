import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SSB Sampali Putra",
    short_name: "SSB Sampali",
    description:
      "Sekolah Sepak Bola Sampali Putra — pembinaan usia dini hingga remaja.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0e0d",
    theme_color: "#16f04a",
    lang: "id",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

import type { Metadata } from "next";
import { Anton, Archivo } from "next/font/google";

import "./globals.css";

const display = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Archivo({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SSB Sampali Putra | Sekolah Sepak Bola Sampali, Deli Serdang",
  description:
    "SSB Sampali Putra — sekolah sepak bola pembinaan usia dini hingga remaja di Sampali, Deli Serdang. Pelatih berpengalaman, kurikulum modern, dan fasilitas terbaik.",
  keywords: [
    "SSB Sampali Putra",
    "sekolah sepak bola Sampali",
    "SSB Deli Serdang",
    "akademi sepak bola Medan",
    "pendaftaran SSB",
  ],
  openGraph: {
    title: "SSB Sampali Putra",
    description: "Mencetak bibit pesepak bola sejak dini.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}

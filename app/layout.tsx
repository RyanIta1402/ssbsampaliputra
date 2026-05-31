import type { Metadata, Viewport } from "next";
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

const SITE_URL = "https://ssbsampaliputra.com";
const SITE_NAME = "SSB Sampali Putra";
const DESCRIPTION =
  "SSB Sampali Putra — sekolah sepak bola pembinaan usia dini hingga remaja di Sampali, Deli Serdang. Pelatih berpengalaman, kurikulum modern, biaya terjangkau (mulai Rp 20.000/bulan).";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Sekolah Sepak Bola Sampali, Deli Serdang`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  generator: "Next.js",
  keywords: [
    "SSB Sampali Putra",
    "sekolah sepak bola Sampali",
    "SSB Deli Serdang",
    "SSB Medan",
    "akademi sepak bola Medan",
    "akademi sepak bola Sampali",
    "sekolah sepak bola anak Medan",
    "pendaftaran SSB",
    "SSB anak usia dini",
    "SSB U-8 U-12 U-15",
    "Lapangan Garuda Deli Sampali",
    "Lapangan So Point",
    "Sampali Putra",
    "ekstrakurikuler sepak bola Sumatera Utara",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Sports",
  alternates: {
    canonical: SITE_URL,
    languages: { "id-ID": SITE_URL },
  },
  openGraph: {
    title: `${SITE_NAME} — Sekolah Sepak Bola Sampali, Deli Serdang`,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/foto-tim.jpg",
        width: 1980,
        height: 1500,
        alt: "Tim SSB Sampali Putra",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DESCRIPTION,
    images: ["/foto-tim.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  manifest: "/manifest.webmanifest",
  // Google Search Console verification — isi setelah daftar di
  // https://search.google.com/search-console
  verification: {
    google:
      "google-site-verification=_EcaFrz6MgOF8O-ZTtelBMawL25qC7IdQHxGRYTilk4",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0e0d",
  width: "device-width",
  initialScale: 1,
};

// JSON-LD: SportsClub / LocalBusiness — membantu Google menampilkan
// rich result (alamat, telepon, link sosmed, jam buka).
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsClub",
  name: SITE_NAME,
  alternateName: "Sampali Putra",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/foto-tim.jpg`,
  description: DESCRIPTION,
  foundingDate: "1995",
  sport: "Football",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Sampali, Percut Sei Tuan",
    addressRegion: "Sumatera Utara",
    postalCode: "20371",
    addressCountry: "ID",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 3.63369,
    longitude: 98.715829,
  },
  telephone: "+62 859-4326-8952",
  sameAs: [
    "https://www.facebook.com/081375312900",
    "https://wa.me/6285943268952",
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Friday"],
      opens: "16:00",
      closes: "18:00",
    },
  ],
  offers: {
    "@type": "Offer",
    name: "Iuran Bulanan SSB Sampali Putra",
    price: "20000",
    priceCurrency: "IDR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`}>
      <body className="font-body antialiased">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}

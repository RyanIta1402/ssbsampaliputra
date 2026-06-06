"use client";

import { useState } from "react";

import Reveal from "./Reveal";

type QA = { tanya: string; jawab: string };

const faqs: QA[] = [
  {
    tanya: "Di mana lokasi latihan SSB Sampali Putra?",
    jawab:
      "Latihan SSB Sampali Putra berlokasi di kawasan Sampali, Percut Sei Tuan, Deli Serdang, Sumatera Utara. Sesi latihan diadakan di Lapangan So Point dan Lapangan Garuda Deli Sampali. Lokasi mudah dijangkau dari Medan dan sekitarnya.",
  },
  {
    tanya: "Berapa biaya pendaftaran dan iuran bulanan?",
    jawab:
      "Iuran latihan sangat terjangkau, mulai dari Rp 20.000 per bulan, dengan uang kas mulai Rp 5.000. SSB Sampali Putra berkomitmen menyediakan sekolah sepak bola berkualitas dengan biaya yang ramah untuk semua kalangan.",
  },
  {
    tanya: "Anak usia berapa yang bisa mendaftar?",
    jawab:
      "Kami menerima anak usia dini hingga remaja, mulai dari U-6, U-8, U-12, hingga U-15. Tersedia kelas Pemula, Menengah, dan Pra-Kompetisi sesuai kelompok usia dan kemampuan anak.",
  },
  {
    tanya: "Kapan jadwal latihan SSB Sampali Putra?",
    jawab:
      "Latihan rutin diadakan tiga kali seminggu, yaitu hari Selasa, Rabu, dan Jumat sore. Jadwal lengkap beserta lokasi lapangan dapat dilihat pada bagian Kontak di halaman ini.",
  },
  {
    tanya: "Bagaimana cara mendaftar di SSB Sampali Putra?",
    jawab:
      "Pendaftaran sangat mudah. Anda dapat mengisi formulir pendaftaran online di bagian Kontak, lalu data akan otomatis terkirim ke WhatsApp admin kami. Tim kami akan segera menghubungi Anda untuk proses selanjutnya.",
  },
  {
    tanya: "Apakah ada kesempatan mengikuti turnamen atau kompetisi?",
    jawab:
      "Ya. SSB Sampali Putra rutin mengikuti turnamen sepak bola anak dan kompetisi usia dini di Medan dan Sumatera Utara. Ini menjadi sarana bagi pemain untuk mengasah jam terbang dan mental bertanding.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.tanya,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.jawab,
    },
  })),
};

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative bg-coal py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,rgba(22,240,74,0.05),transparent_55%)]" />

      <div className="relative mx-auto max-w-4xl px-5 lg:px-8">
        <Reveal className="mb-12 text-center">
          <p className="tag-label mb-5">Pertanyaan Umum</p>
          <h2 className="font-display text-4xl uppercase leading-tight text-bone sm:text-5xl">
            Sering <span className="text-pitch">Ditanyakan</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-bone/70">
            Pertanyaan seputar lokasi, biaya, jadwal, dan pendaftaran sekolah
            sepak bola SSB Sampali Putra di Sampali, Deli Serdang.
          </p>
        </Reveal>

        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={i} delay={i * 60}>
                <div className="overflow-hidden rounded-2xl border border-bone/10 bg-ink/50 transition-colors hover:border-pitch/40">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left lg:px-7"
                    aria-expanded={isOpen}
                  >
                    <h3 className="font-display text-base uppercase tracking-wide text-bone sm:text-lg">
                      {f.tanya}
                    </h3>
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-bone/20 text-pitch transition-transform duration-300 ${
                        isOpen ? "rotate-45 bg-pitch text-ink" : ""
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 font-body text-sm leading-relaxed text-bone/70 lg:px-7">
                        {f.jawab}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Structured data FAQPage — rich result Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </section>
  );
}

import About from "@/components/About";
import Achievements from "@/components/Achievements";
import Coaches from "@/components/Coaches";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Navbar from "@/components/Navbar";
import Pengurus from "@/components/Pengurus";
import Programs from "@/components/Programs";
import Testimonials from "@/components/Testimonials";
import {
  getAbout,
  getAchievements,
  getCoaches,
  getGallery,
  getHero,
  getPrograms,
  getSiteSettings,
  getTestimonials,
} from "@/sanity/lib/queries";

// Ambil data Sanity dengan aman. Jika project Sanity belum
// dikonfigurasi (env kosong) atau gagal, halaman tetap tampil
// dengan data contoh bawaan komponen.
async function safe<T>(fn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fn();
  } catch {
    return undefined;
  }
}

export default async function Home() {
  const [
    settings,
    hero,
    about,
    programs,
    coaches,
    gallery,
    achievements,
    testimonials,
  ] = await Promise.all([
    safe(getSiteSettings),
    safe(getHero),
    safe(getAbout),
    safe(getPrograms),
    safe(getCoaches),
    safe(getGallery),
    safe(getAchievements),
    safe(getTestimonials),
  ]);

  const namaKlub =
    (settings as { namaKlub?: string })?.namaKlub || "SSB Sampali Putra";

  return (
    <main>
      <Navbar namaKlub={namaKlub} />
      <Hero data={hero} />
      <Marquee />
      <About data={about} />
      <Programs programs={programs as never} />
      <Coaches coaches={coaches as never} />
      <Pengurus />
      <Achievements achievements={achievements as never} />
      <Gallery items={gallery as never} />
      <Testimonials testimonials={testimonials as never} />
      <Contact settings={settings} />
      <Footer settings={settings} />
    </main>
  );
}

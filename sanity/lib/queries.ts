import { groq } from "next-sanity";

import { client } from "./client";

// Pengaturan situs umum + konten hero
export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]{
  namaKlub,
  tagline,
  deskripsiSingkat,
  logo,
  alamat,
  telepon,
  email,
  whatsapp,
  instagram,
  facebook,
  youtube,
  jamLatihan[]{ hari, jam, lapangan, biaya, mapsUrl }
}`;

export const heroQuery = groq`*[_type == "hero"][0]{
  judulBaris1,
  judulBaris2,
  subjudul,
  teksTombolUtama,
  teksTombolKedua,
  gambarLatar,
  statistik[]{ angka, label }
}`;

export const aboutQuery = groq`*[_type == "about"][0]{
  judul,
  ringkasan,
  poinKeunggulan[]{ judul, deskripsi },
  gambar,
  tahunBerdiri
}`;

export const programsQuery = groq`*[_type == "program"] | order(urutan asc){
  _id,
  nama,
  kelompokUsia,
  deskripsi,
  hariLatihan,
  biaya,
  uangKas,
  gambar,
  fitur
}`;

export const coachesQuery = groq`*[_type == "coach"] | order(urutan asc){
  _id,
  nama,
  jabatan,
  lisensi,
  bio,
  foto
}`;

export const galleryQuery = groq`*[_type == "galleryItem"] | order(urutan asc){
  _id,
  judul,
  gambar,
  kategori
}`;

export const achievementsQuery = groq`*[_type == "achievement"] | order(tahun desc){
  _id,
  judul,
  tahun,
  keterangan
}`;

export const testimonialsQuery = groq`*[_type == "testimonial"] | order(urutan asc){
  _id,
  nama,
  peran,
  pesan,
  foto
}`;

export const pengumumanQuery = groq`*[_type == "pengumuman" && isAktif == true] | order(urutan asc){
  _id,
  judul,
  kategori,
  deskripsiSingkat,
  poster,
  tanggal,
  hari,
  lokasi,
  format,
  persyaratan,
  biayaPendaftaran,
  hadiah[]{ juara, hadiah },
  kontak,
  teksTombolUtama,
  linkTombol
}`;

// Helper fetch dengan revalidasi (ISR) setiap 60 detik
const REVALIDATE = 60;

export async function getSiteSettings() {
  return client.fetch(siteSettingsQuery, {}, { next: { revalidate: REVALIDATE } });
}
export async function getHero() {
  return client.fetch(heroQuery, {}, { next: { revalidate: REVALIDATE } });
}
export async function getAbout() {
  return client.fetch(aboutQuery, {}, { next: { revalidate: REVALIDATE } });
}
export async function getPrograms() {
  return client.fetch(programsQuery, {}, { next: { revalidate: REVALIDATE } });
}
export async function getCoaches() {
  return client.fetch(coachesQuery, {}, { next: { revalidate: REVALIDATE } });
}
export async function getGallery() {
  return client.fetch(galleryQuery, {}, { next: { revalidate: REVALIDATE } });
}
export async function getAchievements() {
  return client.fetch(achievementsQuery, {}, { next: { revalidate: REVALIDATE } });
}
export async function getTestimonials() {
  return client.fetch(testimonialsQuery, {}, { next: { revalidate: REVALIDATE } });
}
export async function getPengumuman() {
  return client.fetch(pengumumanQuery, {}, { next: { revalidate: REVALIDATE } });
}

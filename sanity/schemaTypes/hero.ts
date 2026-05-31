import { defineField, defineType } from "sanity";

export const hero = defineType({
  name: "hero",
  title: "Bagian Hero (Beranda Atas)",
  type: "document",
  fields: [
    defineField({
      name: "judulBaris1",
      title: "Judul Baris 1",
      type: "string",
      initialValue: "LAHIRKAN",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "judulBaris2",
      title: "Judul Baris 2",
      type: "string",
      initialValue: "JUARA MASA DEPAN",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "subjudul",
      title: "Subjudul",
      type: "text",
      rows: 3,
      initialValue:
        "Sekolah Sepak Bola Sampali Putra membina anak usia dini hingga remaja dengan kurikulum modern, pelatih berpengalaman, dan fasilitas terbaik di Sampali, Deli Serdang.",
    }),
    defineField({
      name: "teksTombolUtama",
      title: "Teks Tombol Utama",
      type: "string",
      initialValue: "Daftar Sekarang",
    }),
    defineField({
      name: "teksTombolKedua",
      title: "Teks Tombol Kedua",
      type: "string",
      initialValue: "Lihat Program",
    }),
    defineField({
      name: "gambarLatar",
      title: "Gambar Latar",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "statistik",
      title: "Statistik (3-4 angka)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "angka", title: "Angka", type: "string" },
            { name: "label", title: "Label", type: "string" },
          ],
          preview: { select: { title: "angka", subtitle: "label" } },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Bagian Hero" }) },
});

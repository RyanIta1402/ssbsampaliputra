import { defineField, defineType } from "sanity";

export const galleryItem = defineType({
  name: "galleryItem",
  title: "Galeri",
  type: "document",
  fields: [
    defineField({ name: "judul", title: "Judul / Caption", type: "string" }),
    defineField({
      name: "gambar",
      title: "Gambar",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "kategori",
      title: "Kategori",
      type: "string",
      options: {
        list: [
          { title: "Latihan", value: "latihan" },
          { title: "Pertandingan", value: "pertandingan" },
          { title: "Prestasi", value: "prestasi" },
          { title: "Fasilitas", value: "fasilitas" },
        ],
      },
    }),
    defineField({
      name: "urutan",
      title: "Urutan Tampil",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: { select: { title: "judul", subtitle: "kategori", media: "gambar" } },
});

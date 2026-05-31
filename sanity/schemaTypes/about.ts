import { defineField, defineType } from "sanity";

export const about = defineType({
  name: "about",
  title: "Tentang Kami",
  type: "document",
  fields: [
    defineField({
      name: "judul",
      title: "Judul",
      type: "string",
      initialValue: "Tentang SSB Sampali Putra",
    }),
    defineField({
      name: "ringkasan",
      title: "Ringkasan",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "tahunBerdiri",
      title: "Tahun Berdiri",
      type: "string",
      initialValue: "1995",
    }),
    defineField({
      name: "gambar",
      title: "Gambar",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "poinKeunggulan",
      title: "Poin Keunggulan",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "judul", title: "Judul", type: "string" },
            { name: "deskripsi", title: "Deskripsi", type: "text", rows: 2 },
          ],
          preview: { select: { title: "judul", subtitle: "deskripsi" } },
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Tentang Kami" }) },
});

import { defineField, defineType } from "sanity";

export const program = defineType({
  name: "program",
  title: "Program Latihan",
  type: "document",
  fields: [
    defineField({
      name: "nama",
      title: "Nama Program",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "kelompokUsia",
      title: "Kelompok Usia",
      type: "string",
      description: "Contoh: U-8, U-10, U-12, U-15",
    }),
    defineField({
      name: "deskripsi",
      title: "Deskripsi",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "hariLatihan",
      title: "Hari Latihan",
      type: "string",
      description: "Contoh: Selasa, Kamis, Sabtu",
    }),
    defineField({
      name: "biaya",
      title: "Biaya / Bulan",
      type: "string",
      description: "Contoh: Rp 150.000",
    }),
    defineField({
      name: "fitur",
      title: "Fitur / Yang Didapat",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "gambar",
      title: "Gambar",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "urutan",
      title: "Urutan Tampil",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "nama", subtitle: "kelompokUsia", media: "gambar" },
  },
});

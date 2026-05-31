import { defineField, defineType } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimoni",
  type: "document",
  fields: [
    defineField({
      name: "nama",
      title: "Nama",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "peran",
      title: "Peran",
      type: "string",
      description: "Contoh: Orang Tua Siswa U-12",
    }),
    defineField({
      name: "pesan",
      title: "Pesan Testimoni",
      type: "text",
      rows: 4,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "foto",
      title: "Foto (opsional)",
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
  preview: { select: { title: "nama", subtitle: "peran", media: "foto" } },
});

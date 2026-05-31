import { defineField, defineType } from "sanity";

export const coach = defineType({
  name: "coach",
  title: "Pelatih",
  type: "document",
  fields: [
    defineField({
      name: "nama",
      title: "Nama Pelatih",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "jabatan", title: "Jabatan", type: "string" }),
    defineField({
      name: "lisensi",
      title: "Lisensi Kepelatihan",
      type: "string",
      description: "Contoh: Lisensi C AFC",
    }),
    defineField({ name: "bio", title: "Biografi Singkat", type: "text", rows: 3 }),
    defineField({
      name: "foto",
      title: "Foto",
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
  preview: { select: { title: "nama", subtitle: "jabatan", media: "foto" } },
});

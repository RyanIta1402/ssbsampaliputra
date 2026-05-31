import { defineField, defineType } from "sanity";

export const achievement = defineType({
  name: "achievement",
  title: "Prestasi",
  type: "document",
  fields: [
    defineField({
      name: "judul",
      title: "Judul Prestasi",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "tahun", title: "Tahun", type: "string" }),
    defineField({
      name: "keterangan",
      title: "Keterangan",
      type: "text",
      rows: 2,
    }),
  ],
  preview: { select: { title: "judul", subtitle: "tahun" } },
});

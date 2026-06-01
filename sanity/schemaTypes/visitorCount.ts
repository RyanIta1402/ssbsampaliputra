import { defineField, defineType } from "sanity";

export const visitorCount = defineType({
  name: "visitorCount",
  title: "Penghitung Pengunjung",
  type: "document",
  fields: [
    defineField({
      name: "count",
      title: "Jumlah Pengunjung",
      type: "number",
      initialValue: 0,
      readOnly: true,
    }),
  ],
  preview: {
    select: { count: "count" },
    prepare: ({ count }) => ({
      title: "Penghitung Pengunjung",
      subtitle: `${count ?? 0} pengunjung`,
    }),
  },
});

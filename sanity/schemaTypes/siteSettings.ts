import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Pengaturan Situs",
  type: "document",
  fields: [
    defineField({
      name: "namaKlub",
      title: "Nama Klub",
      type: "string",
      initialValue: "SSB Sampali Putra",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline / Slogan",
      type: "string",
      initialValue: "Mencetak Bibit Pesepak Bola Sejak Dini",
    }),
    defineField({
      name: "deskripsiSingkat",
      title: "Deskripsi Singkat",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({ name: "alamat", title: "Alamat", type: "text", rows: 2 }),
    defineField({ name: "telepon", title: "Telepon", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({
      name: "whatsapp",
      title: "Nomor WhatsApp (format 62xxx)",
      type: "string",
    }),
    defineField({ name: "instagram", title: "Link Instagram", type: "url" }),
    defineField({ name: "facebook", title: "Link Facebook", type: "url" }),
    defineField({ name: "youtube", title: "Link YouTube", type: "url" }),
    defineField({
      name: "jamLatihan",
      title: "Jadwal Latihan",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "hari", title: "Hari", type: "string" },
            { name: "jam", title: "Jam", type: "string" },
            { name: "lapangan", title: "Lapangan / Lokasi", type: "string" },
            {
              name: "biaya",
              title: "Biaya Latihan (contoh: Rp 5.000)",
              type: "string",
            },
            {
              name: "mapsUrl",
              title: "Link Google Maps",
              type: "url",
            },
          ],
          preview: {
            select: { title: "hari", subtitle: "jam" },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Pengaturan Situs" }),
  },
});

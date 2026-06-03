import { defineField, defineType } from "sanity";

export const pengumuman = defineType({
  name: "pengumuman",
  title: "Pengumuman / Event",
  type: "document",
  fields: [
    defineField({
      name: "judul",
      title: "Judul Event",
      type: "string",
      description: "Contoh: Trophy Wali Kota Medan 20th Anniversary",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "kategori",
      title: "Kategori / Subjudul",
      type: "string",
      description: "Contoh: Sepakbola Anak Usia Dini U11 Kelahiran 2015/2016",
    }),
    defineField({
      name: "deskripsiSingkat",
      title: "Deskripsi Singkat",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "poster",
      title: "Poster Event",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tanggal",
      title: "Tanggal Pelaksanaan",
      type: "string",
      description: "Contoh: 27-28 Juni 2026",
    }),
    defineField({
      name: "hari",
      title: "Hari",
      type: "string",
      description: "Contoh: Sabtu-Minggu",
    }),
    defineField({
      name: "lokasi",
      title: "Lokasi",
      type: "string",
      description: "Contoh: SSB Patriot Medan, Jln. Air Bersih Medan Kota",
    }),
    defineField({
      name: "format",
      title: "Format Pertandingan",
      type: "string",
      description: 'Contoh: 8 vs 8 - 12 Pemain - Durasi 2 x 10"',
    }),
    defineField({
      name: "persyaratan",
      title: "Persyaratan Pendaftaran",
      type: "array",
      of: [{ type: "string" }],
      description: "Contoh: Raport, KK, Akte",
    }),
    defineField({
      name: "biayaPendaftaran",
      title: "Biaya Pendaftaran",
      type: "string",
      description: "Contoh: 350K Per Team",
    }),
    defineField({
      name: "hadiah",
      title: "Daftar Hadiah",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "juara", title: "Juara", type: "string" },
            { name: "hadiah", title: "Hadiah", type: "string" },
          ],
          preview: { select: { title: "juara", subtitle: "hadiah" } },
        },
      ],
    }),
    defineField({
      name: "kontak",
      title: "Nomor Kontak Pendaftaran",
      type: "string",
      description: "Contoh: 081375284462",
    }),
    defineField({
      name: "teksTombolUtama",
      title: "Teks Tombol Utama",
      type: "string",
      initialValue: "Daftar via WhatsApp",
    }),
    defineField({
      name: "linkTombol",
      title: "Link Tombol (opsional)",
      type: "url",
      description: "Kalau kosong, akan otomatis pakai WhatsApp ke nomor kontak.",
    }),
    defineField({
      name: "isAktif",
      title: "Tampilkan di Beranda?",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "urutan",
      title: "Urutan Tampil",
      type: "number",
      initialValue: 1,
    }),
  ],
  preview: {
    select: { title: "judul", subtitle: "tanggal", media: "poster" },
  },
});

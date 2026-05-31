import { defineField, defineType } from "sanity";

export const pendaftaran = defineType({
  name: "pendaftaran",
  title: "Pendaftaran Masuk",
  type: "document",
  // Dibuat dari website; admin umumnya hanya membaca/mengubah status.
  fields: [
    defineField({
      name: "namaLengkap",
      title: "Nama Lengkap",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "namaPanggilan", title: "Nama Panggilan", type: "string" }),
    defineField({
      name: "jenisKelamin",
      title: "Jenis Kelamin",
      type: "string",
      options: {
        list: [
          { title: "Laki-laki", value: "Laki-laki" },
          { title: "Perempuan", value: "Perempuan" },
        ],
      },
    }),
    defineField({ name: "tempatLahir", title: "Tempat Lahir", type: "string" }),
    defineField({ name: "tanggalLahir", title: "Tanggal Lahir", type: "date" }),
    defineField({ name: "noHp", title: "Nomor Telepon / HP", type: "string" }),
    defineField({ name: "namaSekolah", title: "Nama Sekolah", type: "string" }),
    defineField({ name: "kelas", title: "Kelas", type: "string" }),
    defineField({ name: "beratBadan", title: "Berat Badan (kg)", type: "string" }),
    defineField({ name: "tinggiBadan", title: "Tinggi Badan (cm)", type: "string" }),
    defineField({
      name: "golonganDarah",
      title: "Golongan Darah",
      type: "string",
    }),
    defineField({
      name: "namaOrangTua",
      title: "Nama Orang Tua / Wali",
      type: "string",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "baru",
      options: {
        list: [
          { title: "🆕 Baru", value: "baru" },
          { title: "📞 Sudah Dihubungi", value: "dihubungi" },
          { title: "✅ Diterima", value: "diterima" },
          { title: "❌ Ditolak", value: "ditolak" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "catatan",
      title: "Catatan Admin",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "tanggalDaftar",
      title: "Tanggal Daftar",
      type: "datetime",
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: "Terbaru",
      name: "terbaru",
      by: [{ field: "tanggalDaftar", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "namaLengkap",
      sekolah: "namaSekolah",
      status: "status",
      tgl: "tanggalDaftar",
    },
    prepare({ title, sekolah, status, tgl }) {
      const tanggal = tgl
        ? new Date(tgl).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "";
      const label: Record<string, string> = {
        baru: "🆕",
        dihubungi: "📞",
        diterima: "✅",
        ditolak: "❌",
      };
      return {
        title: `${label[status] || ""} ${title}`.trim(),
        subtitle: [sekolah, tanggal].filter(Boolean).join(" • "),
      };
    },
  },
});

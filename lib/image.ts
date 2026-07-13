/**
 * Utilitas gambar sisi browser untuk form CRUD (foto siswa/pendaftaran).
 * Membaca file gambar, menyusutkan sisi terpanjang ke `maxDim`, lalu
 * mengembalikan data URL JPEG ter-kompres — sama seperti perilaku form
 * pendaftaran publik, agar ukuran yang tersimpan ke database tetap kecil.
 *
 * HANYA boleh dipakai di komponen client (butuh DOM: FileReader, canvas).
 */
export async function compressImage(
  file: File,
  maxDim = 512,
  quality = 0.7
): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("gagal membaca file"));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("gagal memuat gambar"));
    el.src = dataUrl;
  });

  let { width, height } = img;
  if (width > height && width > maxDim) {
    height = Math.round((height * maxDim) / width);
    width = maxDim;
  } else if (height > maxDim) {
    width = Math.round((width * maxDim) / height);
    height = maxDim;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

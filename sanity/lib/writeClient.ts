import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

/**
 * Client KHUSUS SERVER untuk menulis data ke Sanity (mis. menyimpan
 * pendaftaran dari website). Menggunakan token rahasia, jadi JANGAN
 * pernah diimpor ke komponen client / browser.
 */
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

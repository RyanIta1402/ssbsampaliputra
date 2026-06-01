import { NextResponse } from "next/server";

import { isSanityConfigured } from "@/sanity/env";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/writeClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOC_ID = "visitorCount";

async function readCount(): Promise<number> {
  if (!isSanityConfigured) return 0;
  try {
    const doc = await client
      .withConfig({ useCdn: false })
      .fetch<{ count?: number } | null>(
        `*[_id == $id][0]{ count }`,
        { id: DOC_ID }
      );
    return doc?.count ?? 0;
  } catch {
    return 0;
  }
}

export async function GET() {
  const count = await readCount();
  return NextResponse.json(
    { count },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST() {
  if (!isSanityConfigured || !process.env.SANITY_API_WRITE_TOKEN) {
    const count = await readCount();
    return NextResponse.json({ ok: false, reason: "not-configured", count });
  }

  try {
    await writeClient.createIfNotExists({
      _id: DOC_ID,
      _type: "visitorCount",
      count: 0,
    });

    const updated = await writeClient
      .patch(DOC_ID)
      .setIfMissing({ count: 0 })
      .inc({ count: 1 })
      .commit();

    const newCount = (updated as { count?: number }).count ?? 0;

    return NextResponse.json(
      { ok: true, count: newCount },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("Gagal menambah counter pengunjung:", err);
    const count = await readCount();
    return NextResponse.json(
      { ok: false, reason: "error", count },
      { status: 500 }
    );
  }
}

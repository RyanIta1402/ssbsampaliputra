"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "ssb-visited";

function IconEye() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const alreadyVisited =
          typeof window !== "undefined" &&
          window.localStorage.getItem(STORAGE_KEY) === "1";

        const res = await fetch("/api/visitor", {
          method: alreadyVisited ? "GET" : "POST",
          cache: "no-store",
        });
        const data = (await res.json()) as { count?: number };
        if (!cancelled && typeof data.count === "number") {
          setCount(data.count);
        }
        if (!alreadyVisited && typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, "1");
        }
      } catch {
        // diam saja — counter sekadar info tambahan
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null || count <= 0) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold">
      <IconEye />
      <span>
        <span>{count.toLocaleString("id-ID")}</span> pengunjung
      </span>
    </span>
  );
}

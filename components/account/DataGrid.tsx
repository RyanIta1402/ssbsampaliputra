"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/**
 * Grid data generik untuk halaman pengelolaan (User, Role, Pendaftaran, Siswa).
 *
 * Fitur (client-side, tanpa dependency tambahan):
 * - Pencarian global (semua kolom teks).
 * - Filter dropdown per kolom (opsional, via prop `filters`).
 * - Sort kolom (klik judul kolom yang punya `sortValue`).
 * - Lazy loading: baris dirender bertahap dan bertambah otomatis saat
 *   di-scroll ke bawah (IntersectionObserver pada baris pemuat).
 * - Slot `action` di toolbar (mis. tombol "Tambah").
 */

export type Column<T> = {
  key: string;
  header: string;
  /** Bila diisi, kolom bisa di-sort berdasarkan nilai ini. */
  sortValue?: (row: T) => string | number;
  render: (row: T) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
};

export type SelectFilter<T> = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  match: (row: T, value: string) => boolean;
};

// Jumlah baris yang dirender per tahap lazy loading.
const CHUNK = 20;

export default function DataGrid<T>({
  rows,
  columns,
  getRowId,
  searchText,
  searchPlaceholder = "Cari...",
  filters = [],
  action,
  emptyText = "Belum ada data.",
  minTableWidth = "640px",
  selectable = false,
  leadRow,
}: {
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  /** Teks gabungan yang dicocokkan dengan kotak pencarian. */
  searchText: (row: T) => string;
  searchPlaceholder?: string;
  filters?: SelectFilter<T>[];
  /**
   * Slot kanan toolbar, mis. tombol "Tambah" / "Report". Bila berupa fungsi,
   * dipanggil dengan baris hasil pencarian/filter/sort saat ini (bukan yang
   * dibatasi lazy-loading) — dipakai agar laporan PDF mengikuti data di grid.
   */
  action?: ReactNode | ((rows: T[]) => ReactNode);
  emptyText?: string;
  minTableWidth?: string;
  /**
   * Bila true, klik pada baris (di luar tombol/link) menandai baris itu
   * sebagai terpilih dan menyorotnya. Klik ulang membatalkan pilihan.
   */
  selectable?: boolean;
  /**
   * Baris tetap yang selalu dirender paling atas di badan tabel — di luar
   * pencarian/filter/sort/lazy-load, dan tetap tampil saat data kosong.
   * Harus berupa satu `<tr>` dengan `<td>` yang jumlah/urutannya sesuai
   * `columns` (mis. baris "Saldo Awal" pada laporan transaksi).
   */
  leadRow?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [visibleCount, setVisibleCount] = useState(CHUNK);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLTableRowElement>(null);

  const hasActiveFilter =
    query.trim() !== "" || Object.values(filterValues).some((v) => v !== "");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (q !== "" && !searchText(row).toLowerCase().includes(q)) return false;
      for (const f of filters) {
        const val = filterValues[f.key] ?? "";
        if (val !== "" && !f.match(row, val)) return false;
      }
      return true;
    });
  }, [rows, query, filters, filterValues, searchText]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return filtered;
    const sv = col.sortValue;
    return [...filtered].sort((a, b) => {
      const va = sv(a);
      const vb = sv(b);
      if (typeof va === "number" && typeof vb === "number") {
        return (va - vb) * sort.dir;
      }
      return (
        String(va).localeCompare(String(vb), "id", { sensitivity: "base" }) *
        sort.dir
      );
    });
  }, [filtered, sort, columns]);

  // Lazy loading: render bertahap, mulai lagi dari awal saat data/filter/
  // sort berubah agar baris teratas hasil baru langsung terlihat.
  useEffect(() => {
    setVisibleCount(CHUNK);
  }, [rows, query, filterValues, sort]);

  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  // Tambah baris otomatis saat baris pemuat mendekati viewport.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((c) => c + CHUNK);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, sorted.length]);

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: 1 };
      if (prev.dir === 1) return { key, dir: -1 };
      return null;
    });
  };

  const resetFilters = () => {
    setQuery("");
    setFilterValues({});
  };

  return (
    <div>
      {/* Toolbar: pencarian, filter, dan aksi */}
      <div className="flex flex-wrap items-center gap-3 border border-b-0 border-bone/10 bg-coal/60 p-4">
        <div className="relative min-w-[200px] flex-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bone/30"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full border border-bone/15 bg-ink py-2.5 pl-9 pr-9 text-sm text-bone outline-none transition-colors placeholder:text-bone/30 focus:border-pitch"
          />
          {query !== "" && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Bersihkan pencarian"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-1 text-bone/40 transition-colors hover:text-bone"
            >
              ×
            </button>
          )}
        </div>

        {filters.map((f) => (
          <label key={f.key} className="flex items-center gap-2">
            <span className="font-body text-[11px] font-bold uppercase tracking-widest text-bone/40">
              {f.label}
            </span>
            <select
              value={filterValues[f.key] ?? ""}
              onChange={(e) =>
                setFilterValues((prev) => ({
                  ...prev,
                  [f.key]: e.target.value,
                }))
              }
              className={`border bg-ink px-3 py-2.5 text-sm outline-none transition-colors focus:border-pitch ${
                (filterValues[f.key] ?? "") !== ""
                  ? "border-pitch/50 text-pitch"
                  : "border-bone/15 text-bone"
              }`}
            >
              <option value="">Semua</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ))}

        {hasActiveFilter && (
          <button
            type="button"
            onClick={resetFilters}
            className="border border-bone/15 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-bone/50 transition-colors hover:border-bone/40 hover:text-bone"
          >
            Reset
          </button>
        )}

        {action && (
          <div className="ml-auto">
            {typeof action === "function" ? action(sorted) : action}
          </div>
        )}
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto border border-bone/10">
        <table
          className="w-full border-collapse text-left"
          style={{ minWidth: minTableWidth }}
        >
          <thead>
            <tr className="border-b border-bone/10 bg-coal/60 font-body text-xs font-bold uppercase tracking-widest text-bone/40">
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3 ${col.headerClassName ?? ""}`}>
                  {col.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={`inline-flex items-center gap-1.5 uppercase tracking-widest transition-colors hover:text-pitch ${
                        sort?.key === col.key ? "text-pitch" : ""
                      }`}
                    >
                      {col.header}
                      <span className="text-[10px]" aria-hidden="true">
                        {sort?.key === col.key
                          ? sort.dir === 1
                            ? "▲"
                            : "▼"
                          : "↕"}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-bone/5">
            {leadRow}
            {visible.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-14 text-center text-bone/40"
                >
                  <span className="mb-2 block text-2xl" aria-hidden="true">
                    ⚽
                  </span>
                  {rows.length === 0 ? emptyText : "Tidak ada data yang cocok."}
                  {rows.length > 0 && (
                    <span className="mt-1 block text-xs text-bone/30">
                      Coba ubah kata kunci atau filter, atau tekan Reset.
                    </span>
                  )}
                </td>
              </tr>
            ) : (
              visible.map((row) => {
                const id = getRowId(row);
                const isSelected = selectable && selectedId === id;
                return (
                  <tr
                    key={id}
                    onClick={
                      selectable
                        ? (e) => {
                            // Abaikan klik pada elemen interaktif (tombol, link,
                            // dsb.) agar aksi baris tetap berfungsi normal.
                            if (
                              (e.target as HTMLElement).closest(
                                "button, a, select, input, label"
                              )
                            ) {
                              return;
                            }
                            setSelectedId((prev) => (prev === id ? null : id));
                          }
                        : undefined
                    }
                    aria-selected={selectable ? isSelected : undefined}
                    className={`text-sm transition-colors ${
                      selectable ? "cursor-pointer" : ""
                    } ${
                      isSelected
                        ? "bg-gradient-to-r from-pitch/[0.14] via-pitch/[0.05] to-transparent text-bone"
                        : "text-bone/80 hover:bg-pitch/[0.04]"
                    }`}
                  >
                    {columns.map((col, i) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 ${
                          isSelected && i === 0
                            ? "shadow-[inset_3px_0_0_0_#16f04a]"
                            : ""
                        } ${col.cellClassName ?? ""}`}
                      >
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
            {hasMore && (
              // Baris pemuat: saat terlihat, IntersectionObserver menambah
              // baris. Tombol jadi cadangan bila observer tak berjalan.
              <tr ref={sentinelRef}>
                <td colSpan={columns.length} className="px-4 py-4 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((c) => c + CHUNK)}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bone/40 transition-colors hover:text-pitch"
                  >
                    <span
                      className="h-3 w-3 animate-spin rounded-full border border-bone/20 border-t-pitch"
                      aria-hidden="true"
                    />
                    Memuat lebih banyak...
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: ringkasan jumlah data yang sudah dirender */}
      <div className="flex flex-wrap items-center gap-3 border border-t-0 border-bone/10 bg-coal/60 px-4 py-3 text-xs text-bone/50">
        <span>
          {sorted.length === 0
            ? "0 data"
            : `Menampilkan ${visible.length} dari ${sorted.length} data`}
          {hasActiveFilter && rows.length !== sorted.length && (
            <span className="text-bone/30"> (difilter dari {rows.length})</span>
          )}
        </span>
        {hasMore && (
          <span className="ml-auto text-bone/30">
            Scroll ke bawah untuk memuat lainnya
          </span>
        )}
      </div>
    </div>
  );
}

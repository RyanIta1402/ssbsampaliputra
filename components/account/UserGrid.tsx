"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import DataGrid, { type Column, type SelectFilter } from "@/components/account/DataGrid";
import ReportButton, { type ReportColumn } from "@/components/account/ReportButton";
import {
  ActionButtons,
  AddButton,
  ConfirmDialog,
  DeleteButton,
  EditButton,
  fieldClass,
  formatDate,
  labelClass,
  Modal,
} from "@/components/account/ui";
import { isValidUsername } from "@/lib/username";
import { isValidWa } from "@/lib/wa";

export type UserRow = {
  id: string;
  nama: string;
  username: string;
  email: string | null;
  no_hp: string | null;
  role: string;
  created_at: string;
  updated_at: string | Date | null;
};

/**
 * Grid daftar user (admin): pencarian, filter role, sort, pagination,
 * plus CRUD lewat modal — Tambah (POST /api/users), Edit (PATCH
 * /api/users/[id]), dan Hapus dengan dialog konfirmasi (DELETE).
 * Baris milik admin yang sedang login ditandai "Anda" dan tak bisa dihapus.
 */
const REPORT_COLUMNS: ReportColumn<UserRow>[] = [
  { header: "Nama", value: (u) => u.nama },
  { header: "Username", value: (u) => u.username },
  { header: "Email", value: (u) => u.email || "-" },
  { header: "No. HP", value: (u) => u.no_hp || "-" },
  { header: "Role", value: (u) => u.role },
  { header: "Dibuat", value: (u) => formatDate(u.created_at) },
];

export default function UserGrid({
  users,
  currentUserId,
  roles,
}: {
  users: UserRow[];
  currentUserId: string;
  roles: string[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState<UserRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteError("");
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/users/${deleting.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        setDeleting(null);
        router.refresh();
      } else if (data.reason === "self-delete") {
        setDeleteError("Anda tidak bisa menghapus akun sendiri.");
      } else if (data.reason === "forbidden") {
        setDeleteError("Hanya admin yang boleh menghapus user.");
      } else {
        setDeleteError("Gagal menghapus user. Coba lagi.");
      }
    } catch {
      setDeleteError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: Column<UserRow>[] = [
    {
      key: "nama",
      header: "Nama / User",
      sortValue: (u) => u.nama,
      render: (u) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pitch/10 text-sm font-bold uppercase text-pitch ring-1 ring-pitch/20">
            {u.nama.trim().charAt(0) || "?"}
          </span>
          <div>
            <div className="font-semibold text-bone">
              {u.nama}
              {u.id === currentUserId && (
                <span className="ml-2 text-xs font-normal text-pitch">(Anda)</span>
              )}
            </div>
            <div className="text-xs text-bone/40">@{u.username}</div>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      sortValue: (u) => u.email ?? "",
      render: (u) => u.email || "—",
    },
    {
      key: "no_hp",
      header: "No. HP",
      render: (u) => u.no_hp || "—",
    },
    {
      key: "role",
      header: "Role",
      sortValue: (u) => u.role,
      render: (u) => (
        <span
          className={
            "inline-block border px-2.5 py-1 text-xs font-bold uppercase tracking-wider " +
            (u.role.toLowerCase() === "admin"
              ? "border-gold/40 text-gold"
              : "border-bone/15 text-bone/60")
          }
        >
          {u.role}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Dibuat",
      sortValue: (u) => new Date(u.created_at).getTime(),
      render: (u) => <span className="text-bone/50">{formatDate(u.created_at)}</span>,
    },
    {
      key: "updated_at",
      header: "Tgl Ubah",
      sortValue: (u) => (u.updated_at ? new Date(u.updated_at).getTime() : 0),
      render: (u) =>
        u.updated_at ? (
          <span className="text-bone/50">{formatDate(u.updated_at)}</span>
        ) : (
          <span className="text-bone/25">—</span>
        ),
    },
    {
      key: "aksi",
      header: "Aksi",
      headerClassName: "text-right",
      render: (u) => {
        const isSelf = u.id === currentUserId;
        return (
          <ActionButtons>
            <EditButton onClick={() => setEditing(u)} />
            <DeleteButton
              onClick={() => {
                setDeleteError("");
                setDeleting(u);
              }}
              disabled={isSelf}
              title={isSelf ? "Tidak bisa menghapus akun sendiri" : "Hapus"}
            />
          </ActionButtons>
        );
      },
    },
  ];

  const filters: SelectFilter<UserRow>[] = [
    {
      key: "role",
      label: "Role",
      options: roles.map((r) => ({ value: r.toLowerCase(), label: r })),
      match: (u, v) => u.role.toLowerCase() === v,
    },
  ];

  return (
    <>
      <DataGrid
        rows={users}
        columns={columns}
        getRowId={(u) => u.id}
        searchText={(u) =>
          [u.nama, u.username, u.email ?? "", u.no_hp ?? "", u.role].join(" ")
        }
        searchPlaceholder="Cari nama, username, email..."
        filters={filters}
        emptyText="Belum ada user."
        minTableWidth="760px"
        selectable
        action={(filtered) => (
          <div className="flex items-center gap-2">
            <ReportButton
              title="Daftar User"
              columns={REPORT_COLUMNS}
              rows={filtered}
            />
            <AddButton label="Tambah User" onClick={() => setAdding(true)} />
          </div>
        )}
      />

      {adding && (
        <UserFormModal
          roles={roles}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            router.refresh();
          }}
        />
      )}
      {editing && (
        <UserFormModal
          user={editing}
          isSelf={editing.id === currentUserId}
          roles={roles}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Hapus User"
          message={
            <>
              Hapus user{" "}
              <strong className="text-bone">
                {deleting.nama} (@{deleting.username})
              </strong>
              ? Tindakan ini tidak bisa dibatalkan.
            </>
          }
          loading={deleteLoading}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}

/**
 * Form user dalam modal — dipakai untuk Tambah (tanpa `user`) dan Edit.
 * Saat edit, kata sandi opsional (kosongkan bila tidak diubah).
 */
function UserFormModal({
  user,
  isSelf = false,
  roles,
  onClose,
  onSaved,
}: {
  user?: UserRow;
  isSelf?: boolean;
  roles: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(user);
  // Default role: "member" bila ada; jika tidak, role non-admin pertama agar
  // user baru tak otomatis jadi admin. Saat edit, cocokkan role user ke opsi
  // tanpa memandang huruf besar/kecil agar tak muncul opsi ganda.
  const matchedRole = user
    ? roles.find((r) => r.toLowerCase() === user.role.toLowerCase())
    : undefined;
  const defaultRole = user
    ? matchedRole ?? user.role
    : roles.find((r) => r.toLowerCase() === "member") ??
      roles.find((r) => r.toLowerCase() !== "admin") ??
      roles[0] ??
      "";

  const [nama, setNama] = useState(user?.nama ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [noHp, setNoHp] = useState(user?.no_hp ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(defaultRole);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roleOptions = user && !matchedRole ? [user.role, ...roles] : roles;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValidUsername(username)) {
      setError(
        "Nama user 3–30 karakter: huruf kecil, angka, titik, garis (tanpa spasi)."
      );
      return;
    }
    // Saat edit, kata sandi boleh kosong (tidak diubah).
    if ((!isEdit || password.trim() !== "") && password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }
    if (noHp.trim() !== "" && !isValidWa(noHp)) {
      setError("Masukkan nomor WhatsApp yang benar (mis. 081234567890).");
      return;
    }
    if (!role) {
      setError("Belum ada role. Tambahkan role dulu di menu Role.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(isEdit ? `/api/users/${user!.id}` : "/api/users", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, username, email, noHp, password, role }),
      });
      const data = await res.json();
      if (data.ok) {
        onSaved();
      } else if (data.reason === "username-exists") {
        setError("Nama user sudah dipakai. Pilih nama user lain.");
      } else if (data.reason === "email-exists") {
        setError("Email sudah terdaftar.");
      } else if (data.reason === "invalid-role") {
        setError("Role tidak valid. Pilih role dari daftar.");
      } else if (data.reason === "self-demote") {
        setError("Anda tidak bisa menurunkan role akun sendiri dari admin.");
      } else if (data.reason === "forbidden") {
        setError("Hanya admin yang boleh mengelola user.");
      } else if (data.reason === "db-not-configured") {
        setError("Database belum dikonfigurasi. Hubungi admin.");
      } else {
        setError("Gagal menyimpan. Periksa kembali data.");
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit User" : "Tambah User"}
      subtitle={isEdit ? `@${user!.username}` : "Buat akun login baru."}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelClass}>
            Nama Lengkap <span className="text-pitch">*</span>
          </label>
          <input
            required
            value={nama}
            onChange={(e) => setNama(e.target.value.toUpperCase())}
            placeholder="Nama user"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            Nama User <span className="text-pitch">*</span>
          </label>
          <input
            required
            autoComplete="off"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Untuk login, mis. budi_santoso"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@contoh.com (opsional)"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>No WhatsApp</label>
          <input
            type="tel"
            inputMode="numeric"
            value={noHp}
            onChange={(e) => setNoHp(e.target.value)}
            placeholder="Contoh: 081234567890 (opsional)"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            {isEdit ? (
              <>
                Kata Sandi Baru
                <span className="ml-1 font-normal normal-case tracking-normal text-bone/30">
                  (kosongkan bila tidak diubah)
                </span>
              </>
            ) : (
              <>
                Kata Sandi <span className="text-pitch">*</span>
              </>
            )}
          </label>
          <input
            type="password"
            required={!isEdit}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={isSelf || roleOptions.length === 0}
            title={isSelf ? "Tidak bisa mengubah role akun sendiri" : undefined}
            className={`${fieldClass} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {roleOptions.length === 0 ? (
              <option value="">Belum ada role</option>
            ) : (
              roleOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))
            )}
          </select>
          {isSelf && (
            <p className="mt-1.5 text-xs text-bone/40">
              Role akun sendiri tidak bisa diubah dari sini.
            </p>
          )}
        </div>

        {error && <p className="text-sm font-semibold text-red-400">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-bone/20 py-3 font-body text-xs font-bold uppercase tracking-widest text-bone/70 transition-colors hover:border-bone/40 hover:text-bone"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

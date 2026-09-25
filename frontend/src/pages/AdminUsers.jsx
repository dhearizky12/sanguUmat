import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import Avatar from "../components/Avatar";
import Breadcrumb from "../components/Breadcrumb";
import MonoLabel from "../components/MonoLabel";
import { Input, Select } from "../components/Field";
import { FilterChip, FilterRow } from "../components/Filters";
import { PageBody, PageHeader, PageLead, PageTitle } from "../components/Page";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import { formatDate } from "../lib/date";

const ROLES = [
  { key: "User", label: "Anggota" },
  { key: "Guru", label: "Guru" },
  { key: "Admin", label: "Admin" },
];

const ROLE_FILTERS = [{ key: "semua", label: "Semua" }, ...ROLES];

// Wide screens read the list as a table: person, joined, last sign-in, role.
const ROW_GRID = "md:grid md:grid-cols-[minmax(0,1fr)_130px_130px_170px] md:items-center md:gap-x-6";

function AdminUsers() {
  const { me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("semua");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (role !== "semua") params.set("role", role);

        const res = await fetch(`${API_URL}/api/admin/users?${params.toString()}`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();

        if (!cancelled) {
          setUsers(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const timeout = setTimeout(fetchUsers, 300);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [search, role]);

  const changeRole = async (userId, newRole) => {
    setSavingId(userId);
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      } else {
        alert("Gagal mengubah peran pengguna.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal mengubah peran pengguna.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        <PageHeader>
          <Breadcrumb items={[{ label: "Panel Admin" }]} />
          <div className="flex flex-col gap-2.5">
            <PageTitle>Panel Admin</PageTitle>
            <PageLead>Kelola pengguna Sangu Umat dan peran mereka.</PageLead>
          </div>
          <Input
            type="search"
            size="lg"
            aria-label="Cari pengguna"
            placeholder="Cari nama atau email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </PageHeader>

        <PageBody>
          <div className="pb-6">
            <FilterRow label="Peran">
              {ROLE_FILTERS.map((r) => (
                <FilterChip key={r.key} active={role === r.key} onClick={() => setRole(r.key)}>
                  {r.label}
                </FilterChip>
              ))}
            </FilterRow>
          </div>

          <div className="pb-3 border-b border-ink">
            <MonoLabel className="text-ink-muted">{loading ? "Memuat…" : `${users.length} pengguna`}</MonoLabel>
          </div>

          {loading ? (
            <LoadingState message="Memuat pengguna…" />
          ) : users.length === 0 ? (
            <EmptyState className="mt-6" title="Tidak ada pengguna yang cocok." message="Coba kata kunci atau saringan peran yang lain." />
          ) : (
            <div role="table" aria-label="Daftar pengguna">
              <div role="row" className={`hidden ${ROW_GRID} py-3 border-b border-stone-line`}>
                {["Pengguna", "Bergabung", "Terakhir masuk", "Peran"].map((h) => (
                  <MonoLabel key={h} role="columnheader" size="sm" className="tracking-[0.14em] text-ink-faint">
                    {h}
                  </MonoLabel>
                ))}
              </div>
              {users.map((u) => {
                const isSelf = u.id === me?.id;

                return (
                  <div key={u.id} role="row" className={`flex flex-col gap-3 py-4 border-b border-stone-line-soft ${ROW_GRID}`}>
                    <div role="cell" className="flex items-center gap-3 min-w-0">
                      <Avatar name={u.name} size={36} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[17px] text-ink truncate">
                          {u.name}
                          {isSelf && <span className="text-ink-faint"> (Anda)</span>}
                        </span>
                        <span className="font-mono text-mono-label tracking-[0.04em] text-ink-muted truncate">{u.email}</span>
                      </div>
                    </div>
                    <MonoLabel role="cell" size="sm" className="text-ink-muted">
                      <span className="md:hidden text-ink-faint">Bergabung </span>
                      {formatDate(u.createdAt)}
                    </MonoLabel>
                    <MonoLabel role="cell" size="sm" className="text-ink-muted">
                      <span className="md:hidden text-ink-faint">Terakhir masuk </span>
                      {formatDate(u.lastLogin)}
                    </MonoLabel>
                    <div role="cell" className="max-w-[220px] md:max-w-none">
                      <Select
                        compact
                        aria-label={`Peran ${u.name}`}
                        value={u.role}
                        disabled={isSelf || savingId === u.id}
                        title={isSelf ? "Anda tidak dapat mengubah peran sendiri" : undefined}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                      >
                        {ROLES.map((r) => (
                          <option key={r.key} value={r.key}>
                            {r.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PageBody>
      </main>
      <Footer />
    </div>
  );
}

export default AdminUsers;

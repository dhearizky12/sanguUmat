import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../lib/api";
import { formatDate } from "../lib/date";

const ROLE_FILTERS = [
  { key: "semua", label: "Semua" },
  { key: "User", label: "Jamaah" },
  { key: "Guru", label: "Guru" },
  { key: "Admin", label: "Admin" },
];

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
        alert("Gagal mengubah role pengguna.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal mengubah role pengguna.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="font-body-md min-h-screen flex flex-col">
      <Header />
      <main className="grow">
        <section className="max-w-container-max mx-auto px-gutter py-section-gap">
          <div className="mb-8">
            <h1 className="font-headline-lg text-headline-lg text-primary-container mb-2">Panel Admin</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Kelola pengguna dan peran (role) di Sangu Umat.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline text-[20px]">search</span>
              </div>
              <input
                className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
                placeholder="Cari nama atau email..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filter role">
              {ROLE_FILTERS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  role="radio"
                  aria-checked={role === r.key}
                  onClick={() => setRole(r.key)}
                  className={`px-4 py-2 rounded-full font-label-sm text-label-sm border transition-colors whitespace-nowrap ${
                    role === r.key
                      ? "bg-primary-container text-on-primary border-primary-container"
                      : "bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container-low"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <LoadingState message="Memuat pengguna..." />
          ) : users.length === 0 ? (
            <EmptyState icon="person_search" title="Tidak Ada Pengguna Ditemukan" message="Coba kata kunci atau filter role yang lain." />
          ) : (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant">Nama</th>
                    <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant">Email</th>
                    <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant">Bergabung</th>
                    <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant">Terakhir Masuk</th>
                    <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = u.id === me?.id;

                    return (
                      <tr key={u.id} className="border-b border-outline-variant/50 last:border-0">
                        <td className="px-6 py-3 font-body-md text-body-md text-on-surface font-medium">{u.name}</td>
                        <td className="px-6 py-3 font-body-md text-body-md text-on-surface-variant">{u.email}</td>
                        <td className="px-6 py-3 font-body-md text-body-md text-on-surface-variant">{formatDate(u.createdAt)}</td>
                        <td className="px-6 py-3 font-body-md text-body-md text-on-surface-variant">{formatDate(u.lastLogin)}</td>
                        <td className="px-6 py-3">
                          <select
                            value={u.role}
                            disabled={isSelf || savingId === u.id}
                            title={isSelf ? "Anda tidak dapat mengubah role sendiri" : undefined}
                            onChange={(e) => changeRole(u.id, e.target.value)}
                            className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-label-sm text-label-sm text-on-surface outline-none focus:border-primary-container disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <option value="User">Jamaah</option>
                            <option value="Guru">Guru</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default AdminUsers;

import { useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import AdminNav from "../components/AdminNav";
import Breadcrumb from "../components/Breadcrumb";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import MonoLabel from "../components/MonoLabel";
import { FormError, Input } from "../components/Field";
import { PageBody, PageHeader, PageLead, PageTitle } from "../components/Page";
import { API_URL } from "../lib/api";
import { refreshCategories, useCategories, useCategoriesLoaded } from "../lib/category";

// Sends one admin category request; returns null on success or the Bahasa message to show.
async function send(method, path, body) {
  try {
    const res = await fetch(`${API_URL}/api/admin/categories${path}`, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok) return null;
    const text = await res.text();
    return text || "Gagal menyimpan perubahan. Silakan coba lagi.";
  } catch (err) {
    console.error(err);
    return "Gagal menyimpan perubahan. Silakan coba lagi.";
  }
}

function CategoryRow({ category, index, count, busy, run }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);

  const save = async (e) => {
    e.preventDefault();
    if (await run("PUT", `/${category.key}`, { name })) setEditing(false);
  };

  const remove = () => {
    const n = category.questionCount;
    const message =
      n > 0
        ? `Hapus kategori "${category.name}"? ${n} pertanyaan akan menjadi "Lainnya".`
        : `Hapus kategori "${category.name}"?`;
    if (window.confirm(message)) run("DELETE", `/${category.key}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 py-4 border-b border-stone-line-soft">
      <MonoLabel className="w-6 shrink-0 text-ink-faint">{String(index + 1).padStart(2, "0")}</MonoLabel>

      {editing ? (
        <form onSubmit={save} className="flex-1 min-w-[220px] flex flex-wrap items-center gap-3">
          <Input aria-label={`Nama baru untuk ${category.name}`} value={name} onChange={(e) => setName(e.target.value)} className="flex-1 min-w-[180px]" />
          <Button type="submit" disabled={busy} className="px-4 py-3">
            Simpan
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setName(category.name);
              setEditing(false);
            }}
            className="px-4 py-3"
          >
            Batal
          </Button>
        </form>
      ) : (
        <div className="flex-1 min-w-[180px] flex flex-col gap-0.5">
          <span className="text-[17px] text-ink">{category.name}</span>
          <span className="font-mono text-mono-label tracking-[0.04em] text-ink-faint">
            {category.key} &middot; {category.questionCount} pertanyaan
          </span>
        </div>
      )}

      {!editing && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Button variant="link" disabled={busy || index === 0} onClick={() => run("PUT", `/${category.key}`, { sortOrder: index })}>
            Naik
          </Button>
          <Button
            variant="link"
            disabled={busy || index === count - 1}
            onClick={() => run("PUT", `/${category.key}`, { sortOrder: index + 2 })}
          >
            Turun
          </Button>
          <Button variant="link" disabled={busy} onClick={() => setEditing(true)}>
            Ubah
          </Button>
          <Button variant="danger" disabled={busy} onClick={remove}>
            Hapus
          </Button>
        </div>
      )}
    </div>
  );
}

function AdminCategories() {
  const categories = useCategories();
  const loaded = useCategoriesLoaded();
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Every change goes through here: send it, then re-read the shared list so the rest of the
  // app (filters, picker, labels) sees it too. Returns true on success.
  const run = async (method, path, body) => {
    setBusy(true);
    setError("");
    const problem = await send(method, path, body);
    await refreshCategories();
    setBusy(false);
    if (problem) setError(problem);
    return !problem;
  };

  const add = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError("Nama kategori harus diisi.");
      return;
    }
    if (await run("POST", "", { name: newName.trim() })) setNewName("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <Header />
      <main className="grow">
        <PageHeader>
          <Breadcrumb items={[{ label: "Panel Admin", to: "/admin/users" }, { label: "Kategori" }]} />
          <div className="flex flex-col gap-2.5">
            <PageTitle>Panel Admin</PageTitle>
            <PageLead>Kelola kategori yang dipakai untuk menyaring pertanyaan dan jawaban.</PageLead>
          </div>
          <AdminNav />
        </PageHeader>

        <PageBody>
          <div className="max-w-[860px] flex flex-col gap-6">
            <form onSubmit={add} className="flex flex-wrap items-stretch gap-3">
              <Input
                aria-label="Nama kategori baru"
                placeholder="Nama kategori baru, misalnya: Adab"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setError("");
                }}
                className="flex-1 min-w-[220px]"
              />
              <Button type="submit" disabled={busy} className="px-6">
                Tambah
              </Button>
            </form>

            {error && <FormError>{error}</FormError>}

            <div>
              <MonoLabel as="div" className="text-ink-muted pb-3 border-b border-ink">
                {loaded ? `${categories.length} kategori` : "Memuat…"}
              </MonoLabel>
              {!loaded ? (
                <LoadingState message="Memuat kategori…" />
              ) : categories.length === 0 ? (
                <EmptyState className="mt-6" title="Belum ada kategori." message="Tambahkan kategori pertama di atas." />
              ) : (
                categories.map((c, i) => (
                  <CategoryRow key={c.key} category={c} index={i} count={categories.length} busy={busy} run={run} />
                ))
              )}
            </div>
          </div>
        </PageBody>
      </main>
      <Footer />
    </div>
  );
}

export default AdminCategories;

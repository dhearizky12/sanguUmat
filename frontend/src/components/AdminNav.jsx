import { NavLink } from "react-router-dom";
import MonoLabel from "./MonoLabel";

const TABS = [
  { label: "Ringkasan", to: "/admin", end: true },
  { label: "Pertanyaan", to: "/admin/pertanyaan" },
  { label: "Komentar", to: "/admin/komentar" },
  { label: "Konten", to: "/admin/konten" },
  { label: "Pengguna", to: "/admin/users" },
  { label: "Kategori", to: "/admin/categories" },
];

// Switches between the Panel Admin pages; sits in their header band.
export default function AdminNav() {
  return (
    <MonoLabel as="nav" aria-label="Panel Admin" className="flex flex-wrap gap-x-6 gap-y-2 border-b border-stone-line">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `-mb-px pb-2.5 border-b-[1.5px] transition-colors ${
              isActive ? "text-forest border-gold-deep" : "text-ink-muted border-transparent hover:text-ink"
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </MonoLabel>
  );
}

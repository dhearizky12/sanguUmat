import { NavLink } from "react-router-dom";
import LogoMark from "./LogoMark";
import MonoLabel from "./MonoLabel";
import AutoGrid from "./AutoGrid";

const EXPLORE_LINKS = [
  { label: "Tanya Jawab", to: "/questions" },
  { label: "Artikel", to: "/articles" },
  { label: "Ngaji Bareng", to: "/live" },
];

const ABOUT_LINKS = [
  { label: "Dewan Ustadz", to: "#" },
  { label: "Metode Verifikasi", to: "#" },
  { label: "Keanggotaan", to: "#" },
];

const HELP_LINKS = [
  { label: "Hubungi Kami", to: "#" },
  { label: "Kebijakan Privasi", to: "#" },
  { label: "Syarat Layanan", to: "#" },
];

function FooterColumn({ title, links }) {
  return (
    <div className="flex flex-col gap-2.5 text-[15px]">
      <MonoLabel size="sm" className="text-sage-dark">{title}</MonoLabel>
      {links.map((link) => (
        <NavLink key={link.label} to={link.to} className="text-cream-link hover:text-gold transition-colors">
          {link.label}
        </NavLink>
      ))}
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-forest-darker text-sage mt-auto">
      <AutoGrid min={200} className="max-w-container-max mx-auto px-page py-12 gap-9">
        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-2.5">
            <LogoMark tone="light" />
            <span className="font-serif text-xl text-cream-text">Sangu Umat</span>
          </span>
          <p className="text-[15px] leading-relaxed max-w-[32ch]">Menjembatani kearifan tradisional dengan kejelasan modern.</p>
        </div>

        <FooterColumn title="Jelajahi" links={EXPLORE_LINKS} />
        <FooterColumn title="Tentang" links={ABOUT_LINKS} />
        <FooterColumn title="Bantuan" links={HELP_LINKS} />
      </AutoGrid>
      <div className="border-t border-forest">
        <MonoLabel as="div" className="max-w-container-max mx-auto px-page py-5 text-sage-dark">Sangu Umat &copy; 2026</MonoLabel>
      </div>
    </footer>
  );
}

export default Footer;

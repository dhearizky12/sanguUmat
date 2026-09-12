import { NavLink } from "react-router-dom";

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
      <span className="label-mono text-[10px] text-sage-dark">{title}</span>
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
      <div
        className="max-w-container-max mx-auto px-gutter py-12 grid gap-9"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))" }}
      >
        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-2.5">
            <span className="w-6 h-6 bg-forest-darker [box-shadow:inset_0_0_0_1px_#E8C96F,inset_0_0_0_3px_#05271D,inset_0_0_0_4px_#E8C96F]" />
            <span className="font-serif text-xl text-cream-text">Sangu Umat</span>
          </span>
          <p className="text-[15px] leading-relaxed max-w-[32ch]">Menjembatani kearifan tradisional dengan kejelasan modern.</p>
        </div>

        <FooterColumn title="Jelajahi" links={EXPLORE_LINKS} />
        <FooterColumn title="Tentang" links={ABOUT_LINKS} />
        <FooterColumn title="Bantuan" links={HELP_LINKS} />
      </div>
      <div className="border-t border-forest">
        <div className="max-w-container-max mx-auto px-gutter py-5 label-mono text-sage-dark">Sangu Umat &copy; 2026</div>
      </div>
    </footer>
  );
}

export default Footer;

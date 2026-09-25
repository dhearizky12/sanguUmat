import { Link } from "react-router-dom";
import { API_URL } from "../lib/api";
import AutoGrid from "../components/AutoGrid";
import Brand from "../components/Brand";
import MonoLabel from "../components/MonoLabel";

// The Masuk canvas, Google path only. The canvas's WhatsApp OTP path (phone
// entry, code boxes, resend countdown) has no backend yet and is left out.
const PERKS = [
  { tag: "Tanya Jawab", text: "Ajukan pertanyaan langsung ke dewan ustadz dan pantau jawabannya." },
  { tag: "Ngaji Bareng", text: "Pengingat sebelum kajian dimulai, plus rekaman penuh tanpa jeda." },
  { tag: "Catatan", text: "Simpan artikel dan catatan ngaji untuk dibaca lagi nanti." },
];

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
      <path className="fill-google-blue" d="M23 12.2c0-.8-.1-1.6-.2-2.3H12v4.4h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.5z" />
      <path className="fill-google-green" d="M12 23.5c3.1 0 5.6-1 7.5-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.8 1.1a6.7 6.7 0 0 1-6.3-4.6H2v3A11.5 11.5 0 0 0 12 23.5z" />
      <path className="fill-google-yellow" d="M5.7 14.3a6.9 6.9 0 0 1 0-4.4v-3H2a11.5 11.5 0 0 0 0 10.4l3.7-3z" />
      <path className="fill-google-red" d="M12 5.4c1.7 0 3.3.6 4.5 1.8l3.3-3.3A11.5 11.5 0 0 0 2 6.9l3.7 3A6.7 6.7 0 0 1 12 5.4z" />
    </svg>
  );
}

function Login() {
  const loginGoogle = () => {
    window.location.href = `${API_URL}/api/auth/login`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream font-serif text-ink">
      <header className="border-b border-stone-line">
        <div className="max-w-container-max mx-auto px-page min-h-[68px] py-2.5 flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
          <Brand />
          <MonoLabel as={Link} to="/" size="xs" className="tracking-[0.13em] text-ink-muted hover:text-ink transition-colors">
            &larr; Kembali ke beranda
          </MonoLabel>
        </div>
      </header>

      <div className="relative flex-1 flex">
        {/* Carries the green panel's background to the window's right edge once the two
            panels sit side by side (two 420px columns plus the page gutter = 896px). The
            container is centred, so its midline and the window's midline coincide. */}
        <div aria-hidden="true" className="hidden min-[896px]:block absolute inset-y-0 left-1/2 right-0 girih-pattern-gold-soft" />

        <AutoGrid as="main" min={420} className="relative flex-1 w-full max-w-container-max mx-auto px-page">
          <section className="flex items-center py-[clamp(32px,6vw,72px)] md:pr-page">
            <div className="w-full max-w-[420px] flex flex-col gap-[clamp(22px,3vw,30px)]">
              <div className="flex flex-col gap-2.5">
                <MonoLabel as="div" size="sm" className="tracking-[0.16em] text-gold-dark">
                  Masuk
                </MonoLabel>
                <h1 className="text-[clamp(30px,4vw,40px)] leading-[1.1] font-normal tracking-[-0.02em]">Selamat datang di Sangu Umat</h1>
                <p className="text-base leading-relaxed text-ink-soft max-w-[42ch] text-pretty">
                  Masuk dengan akun Google Anda untuk melanjutkan.
                </p>
              </div>
  
              <div className="flex flex-col gap-[22px]">
                <button
                  type="button"
                  onClick={loginGoogle}
                  className="flex items-center justify-center gap-3 cursor-pointer w-full min-h-14 px-[18px] py-3.5 bg-paper border border-stone-border text-ink text-[17px] hover:bg-cream-hover transition-colors"
                >
                  <GoogleMark />
                  Lanjut dengan Google
                </button>
  
                <div className="flex items-start gap-[9px] font-mono text-mono-label-sm leading-[1.7] tracking-[0.06em] text-ink-faint">
                  <span aria-hidden="true" className="shrink-0 size-[7px] mt-1.5 bg-gold-deep" />
                  <span className="flex-1">Belum punya akun? Akun otomatis dibuat saat Anda masuk pertama kali.</span>
                </div>
  
                <p className="text-sm leading-[1.65] text-ink-faint max-w-[44ch]">
                  Dengan melanjutkan, Anda menyetujui{" "}
                  <a href="#" className="text-forest hover:text-gold-dark transition-colors">
                    Syarat Layanan
                  </a>{" "}
                  dan{" "}
                  <a href="#" className="text-forest hover:text-gold-dark transition-colors">
                    Kebijakan Privasi
                  </a>{" "}
                  Sangu Umat.
                </p>
              </div>
            </div>
          </section>
  
          <aside className="girih-pattern-gold-soft flex items-center">
            <div className="w-full max-w-[460px] mx-auto py-[clamp(40px,7vw,84px)] px-[clamp(22px,5vw,40px)] flex flex-col gap-[clamp(22px,3vw,32px)]">
              <h2 className="text-[clamp(24px,3vw,33px)] font-normal leading-[1.24] tracking-[-0.015em] text-cream-text max-w-[26ch] text-pretty">
                Satu akun untuk tanya jawab, artikel, dan ngaji bareng.
              </h2>
              <div className="flex flex-col">
                {PERKS.map((perk) => (
                  <div key={perk.tag} className="flex gap-3.5 py-[18px] border-t border-forest-line">
                    <span aria-hidden="true" className="shrink-0 size-[9px] mt-[7px] bg-gold" />
                    <span className="flex-1 min-w-0 flex flex-col gap-[5px]">
                      <MonoLabel size="sm" className="tracking-[0.14em] text-gold">
                        {perk.tag}
                      </MonoLabel>
                      <span className="text-base leading-relaxed text-sage">{perk.text}</span>
                    </span>
                  </div>
                ))}
              </div>
              <MonoLabel as="div" size="sm" className="text-sage-dark">
                Butuh bantuan?{" "}
                <a href="#" className="text-gold border-b border-forest-line">
                  Hubungi kami
                </a>
              </MonoLabel>
            </div>
          </aside>
        </AutoGrid>
      </div>
    </div>
  );
}

export default Login;

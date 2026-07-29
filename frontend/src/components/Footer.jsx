function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant w-full mt-auto">
      <div className="max-w-container-max mx-auto px-gutter py-section-gap flex flex-col md:flex-row justify-between items-center gap-base">
        <div>
          <div className="font-title-md text-title-md font-bold text-primary-container  mb-4 md:mb-0">
            Sangu Umat <small>© 2026 </small>
          </div>

          <div>Menjembatani kearifan tradisional dengan kejelasan modern.</div>
        </div>
        <div className="hidden flex flex-col flex-wrap justify-center gap-6">
          <a className="text-on-surface-variant font-body-md text-body-md hover:text-secondary-container transition-colors" href="#">
            Panduan Komunitas
          </a>
          <a className="text-on-surface-variant font-body-md text-body-md hover:text-secondary-container transition-colors" href="#">
            Verifikasi Ustadz
          </a>
          <a className="text-on-surface-variant font-body-md text-body-md hover:text-secondary-container transition-colors" href="#">
            Kebijakan Privasi
          </a>
          <a className="text-on-surface-variant font-body-md text-body-md hover:text-secondary-container transition-colors" href="#">
            Hubungi Kami
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

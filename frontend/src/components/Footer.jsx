function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant w-full mt-auto">
      <div className="max-w-container-max mx-auto px-gutter py-section-gap flex flex-col md:flex-row justify-between items-center gap-base">
        <div>
          <div className="font-title-md text-title-md font-bold text-primary-container  mb-4 md:mb-0">
            Sangu Umat <small>© 2026 </small>
          </div>

          <div>Bridging traditional wisdom with modern clarity.</div>
        </div>
        <div className="flex flex-col flex-wrap justify-center gap-6">
          <a className="text-on-surface-variant font-body-md text-body-md hover:text-secondary-container transition-colors" href="#">
            Community Guidelines
          </a>
          <a className="text-on-surface-variant font-body-md text-body-md hover:text-secondary-container transition-colors" href="#">
            Scholar Verification
          </a>
          <a className="text-on-surface-variant font-body-md text-body-md hover:text-secondary-container transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="text-on-surface-variant font-body-md text-body-md hover:text-secondary-container transition-colors" href="#">
            Contact Support
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

import { NavLink } from "react-router-dom";

function ArticleMemberCard({
  slug,
  category = "Seri Fiqih Lanjutan",
  title = "Seluk-Beluk Akad Perdagangan dalam Keuangan Islam",
  image,
}) {
  return (
    <NavLink
      to={`/detail-article/${slug}`} className="relative bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden flex flex-col shadow-sm">
      <div className="absolute top-4 right-4 z-20">
        <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm font-semibold">
          <span className="material-symbols-outlined text-[16px]" data-icon="lock">
            lock
          </span>{" "}
          Khusus Anggota
        </span>
      </div>
      <div className="h-40 bg-surface-container-high relative">
        {image ? (
          <img alt="Manuskrip" className="w-full h-full object-cover opacity-60" src={image} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary-container/15 to-secondary-container/20">
            <span className="material-symbols-outlined text-primary-container text-5xl!" data-icon="menu_book">
              menu_book
            </span>
          </div>
        )}
      </div>
      <div className="p-6 grow flex flex-col relative overflow-hidden">
        <span className="text-primary-container font-label-sm text-label-sm mb-2 font-semibold">{category}</span>
        <h3 className="font-title-md text-title-md text-on-surface mb-2">{title}</h3>
        <div className="relative grow overflow-hidden">
          <p className="font-body-md text-body-md text-on-surface-variant blur-sm select-none">
            Konten ini hanya dapat dibaca oleh anggota premium. Berlangganan untuk membuka akses penuh ke seluruh pembahasan mendalam mengenai
            topik ini beserta rujukan dan dalil-dalilnya secara lengkap.
          </p>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-container-lowest/40 backdrop-blur-[2px]">
            <button className="bg-primary-container text-on-primary font-label-sm text-label-sm px-6 py-2.5 rounded-full hover:bg-tertiary transition-colors shadow-md flex items-center gap-2">
              Buka Premium
            </button>
          </div>
        </div>
      </div>
    </NavLink>
  );
}

export default ArticleMemberCard;

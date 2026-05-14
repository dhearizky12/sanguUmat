import { NavLink } from "react-router-dom";

function ArticleCard({ slug, isMember }) {
  return (
    <div className="relative bg-surface-container-lowest rounded-2xl border border-outline-variant/30 flex flex-col shadow-sm hover:shadow-md  overflow-hidden">
      {isMember && (
        <div className="absolute top-4 right-4 z-20">
          <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm font-semibold">
            <span className="material-symbols-outlined text-[16px]" data-icon="lock">
              lock
            </span>{" "}
            Members Only
          </span>
        </div>
      )}
      <NavLink to={`/detail-article/${slug}`} className="h-40 bg-surface-container-high relative">
        <img
          alt="Manuscript"
          className="w-full h-full object-cover opacity-60"
          data-alt="A close-up image of an ancient, handwritten Islamic manuscript with elegant Arabic calligraphy in black and gold ink. The parchment is textured and slightly weathered. Soft, warm lighting highlights the intricate script, conveying a sense of profound historical depth and scholarly prestige."
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpmfkssMkPTKHL-677652GIUTLAwGq3O0MiVLSKWM7Ws_ERL4bhaF8jNkDKUn_-PQTDc7UL6irwCOxvmKYiwqwz4DVOOCXtpszWQ8acN25qkF2wert8icM4jY6KWiKmFLTquiPOYen_nP3HWuK0uGeLojmIHl2F7g5ZXL3zfmAO_YXv2KyO82AqYUcrx2UDJeWrVH5WFrGT49kwjd8uuvOclm97z7_B2TN_GjoEVgvVKox9YXDydsrvR_ak5qd23gTtTSrzyd2pjM"
        />
      </NavLink>
      <div className="p-6 grow flex flex-col relative overflow-hidden">
        <span className="text-primary-container font-label-sm text-label-sm mb-2 font-semibold">Advanced Fiqh Series</span>
        <NavLink to={`/detail-article/${slug}`}>
          <h3 className="font-title-md text-title-md text-on-surface mb-2">The Nuances of Commercial Contracts in Islamic Finance</h3>
        </NavLink>
        <div className="relative grow overflow-hidden">
          <NavLink to={`/detail-article/${slug}`}>
            <p className="font-body-md text-body-md text-on-surface-variant line-clamp-4 grow">
              A practical guide to understanding ingredients, cross-contamination, and dining out while adhering strictly to Halal dietary principles.
            </p>
          </NavLink>
          {isMember && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-container-lowest/40 backdrop-blur-[2px]">
              <button className="bg-primary-container text-on-primary font-label-sm text-label-sm px-6 py-2.5 rounded-full hover:bg-tertiary transition-colors shadow-md flex items-center gap-2">
                Unlock Premium
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArticleCard;

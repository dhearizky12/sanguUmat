import { NavLink } from "react-router-dom";

function QuestionCard({ slug, adminId, question }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border-primary-container border p-6 flex flex-col">
      <NavLink to={`/detail-question/${slug}`}>
        <div className="flex items-start gap-3 mb-4 cursor-pointer">
          <span className="material-symbols-outlined text-secondary-container icon-fill" data-icon="help_outline">
            help_outline
          </span>
          <h3 className="font-title-md text-title-md text-on-surface line-clamp-2">
            {question.title}
          </h3>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3 mb-6 grow">
          {question.content}
        </p>
      </NavLink>
      <div className="border-t border-outline-variant/20 pt-4 mt-auto">
        <NavLink to={`/detail-admin/${adminId}`} className="flex items-center gap-3 cursor-pointer">
          <img
            alt="Scholar Avatar"
            className="w-10 h-10 rounded-full object-cover"
            data-alt="A headshot of a dignified older man with a grey beard, wearing a traditional white kufi. The background is a soft, warm beige. The lighting is gentle and professional, conveying wisdom and approachability within a serene, modern context."
            src={
              question.userPicture
                ? "http://localhost:5236" +
                  question.userPicture
                : "/default-avatar.png"
            }
          />
          <div>
            <p className="font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1">
              {question.userName}
              <span className="material-symbols-outlined text-[14px] text-secondary-container icon-fill" data-icon="verified">
                verified
              </span>
            </p>
            <p className="text-[12px] text-outline">{new Date(question.createdAt).toLocaleDateString()}</p>
          </div>
        </NavLink>
      </div>
    </div>
  );
}

export default QuestionCard;

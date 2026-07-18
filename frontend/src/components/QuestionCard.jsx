import { NavLink } from "react-router-dom";
import { API_URL } from "../lib/api";
import { handleAvatarError } from "../lib/image";
import { formatDate } from "../lib/date";

function QuestionCard({ slug, adminId, question }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border-primary-container border p-6 flex flex-col">
      <NavLink to={`/question/detail/${slug}`}>
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
            alt="Foto Ustadz"
            className="w-10 h-10 rounded-full object-cover"
            src={question.userPicture ? API_URL + question.userPicture : "/default-avatar.png"}
            onError={handleAvatarError}
          />
          <div>
            <p className="font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1">
              {question.userName}
              {
                question.role == "Guru" &&
                (
                  <span className="material-symbols-outlined text-secondary-container text-[18px]">
                    verified
                </span>
                )
              }
            </p>
            <p className="text-[12px] text-outline">{formatDate(question.createdAt)}</p>
          </div>
        </NavLink>
      </div>
    </div>
  );
}

export default QuestionCard;

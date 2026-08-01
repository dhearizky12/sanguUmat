import { NavLink } from "react-router-dom";
import { API_URL } from "../lib/api";
import { handleAvatarError } from "../lib/image";
import { formatDate } from "../lib/date";
import { formatCount } from "../lib/format";

function QuestionCard({ slug, adminId, question }) {
  const isAnswered = Boolean(question.isAnswered);

  return (
    <div className="bg-surface-container-lowest rounded-xl border-primary-container border p-6 flex flex-col">
      <NavLink to={`/question/detail/${slug}`}>
        <div className="flex items-start justify-between gap-3 mb-4 cursor-pointer">
          <h3 className="font-title-md text-title-md text-on-surface line-clamp-2">
            {question.title}
          </h3>
          <span
            className={`shrink-0 flex items-center gap-1 font-label-sm text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              isAnswered ? "bg-secondary-container text-on-secondary-container" : "text-on-surface/50"
            }`}
          >
            {isAnswered ? "Terjawab" : "Menunggu"}
            <span className="material-symbols-outlined text-[13px]">{isAnswered ? "check_circle" : "schedule"}</span>
          </span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3 mb-4 grow">
          {question.content}
        </p>
      </NavLink>
      <div className="border-t border-outline-variant/20 pt-4 mt-auto flex items-center justify-between gap-3">
        <NavLink to={`/detail-admin/${adminId}`} className="flex items-center gap-2 cursor-pointer min-w-0">
          <img
            alt="Foto Ustadz"
            className="w-9 h-9 rounded-full object-cover shrink-0"
            src={question.userPicture ? API_URL + question.userPicture : "/default-avatar.png"}
            onError={handleAvatarError}
          />
          <div className="min-w-0">
            <p className="font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1">
              <span className="truncate">{question.userName}</span>
              {
                question.role == "Guru" &&
                (
                  <span className="material-symbols-outlined icon-fill text-secondary-container text-[18px] shrink-0">
                    verified
                </span>
                )
              }
            </p>
            <p className="text-[12px] text-outline">{formatDate(question.createdAt)}</p>
          </div>
        </NavLink>
        <div className="flex items-center gap-3 text-outline shrink-0">
          <span className="flex items-center gap-1 font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            {formatCount(question.views)}
          </span>
          <span className="flex items-center gap-1 font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px]">chat_bubble_outline</span>
            {formatCount(question.commentCount)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default QuestionCard;

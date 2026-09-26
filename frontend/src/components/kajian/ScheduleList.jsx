import { Link } from "react-router-dom";
import MonoLabel from "../MonoLabel";
import { calendarLink, wibDate, wibDay, wibTime } from "../../lib/wib";
import { absoluteAppUrl } from "../../lib/basePath";

// "Jadwal pekan ini": the next seven days of kajian, in WIB. "Tambah ke kalender" opens a
// Google Calendar event, standing in for the canvas's reminders.
export default function ScheduleList({ schedule }) {
  if (schedule.length === 0) {
    return <p className="py-6 text-base text-ink-muted">Belum ada jadwal kajian pekan ini.</p>;
  }
  return (
    <div className="flex flex-col">
      {schedule.map((k) => (
        <div key={k.id} className="flex flex-wrap items-center gap-x-[clamp(18px,3vw,32px)] gap-y-3 py-5 border-b border-stone-line">
          <div className="w-[92px] shrink-0 flex flex-col gap-1">
            <MonoLabel size="sm" className="tracking-[0.14em] text-ink-faint">
              {wibDay(k.startsAt)}
            </MonoLabel>
            <span className="text-[21px] leading-[1.1] text-ink">{wibDate(k.startsAt)}</span>
            <span className="font-mono text-mono-label tracking-[0.08em] text-forest">{wibTime(k.startsAt)} WIB</span>
          </div>
          <Link to={`/live/${k.id}`} className="flex-[1_1_260px] min-w-0 flex flex-col gap-[7px] group">
            <MonoLabel as="span" className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5 tracking-[0.12em]">
              <span className="text-forest">{k.series}</span>
              <span className="text-ink-faint">{k.durationMinutes} menit</span>
            </MonoLabel>
            <span className="text-[clamp(19px,2.1vw,22px)] leading-[1.28] tracking-[-0.01em] text-ink max-w-[40ch] text-pretty group-hover:text-forest transition-colors">
              {k.title}
            </span>
            <span className="font-mono text-mono-label tracking-[0.08em] text-ink-muted">{k.ustadz?.name}</span>
          </Link>
          <a
            href={calendarLink(k, absoluteAppUrl(`/live/${k.id}`))}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 font-mono text-mono-label-sm tracking-[0.14em] uppercase text-forest border border-stone-border px-4 py-3 hover:bg-cream-hover transition-colors"
          >
            Tambah ke kalender
          </a>
        </div>
      ))}
    </div>
  );
}

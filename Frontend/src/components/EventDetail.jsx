import {
  Calendar,
  CheckCircle,
  Clock3,
  IndianRupee,
  MapPin,
  ShieldCheck,
  Tags,
  Users,
} from "lucide-react";
import { createElement } from "react";
import { Link } from "react-router-dom";
import { formatEventDate } from "../utils/eventHelpers";

const fallbackImage =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80";

export default function EventDetail({ event, user, isRegistered, onRegister }) {
  if (!event) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-white/60">
        Event not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="text-sm text-[#f4b860] hover:text-[#ffd081]">
        Back to events
      </Link>

      <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-[#17191c]">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <img
            src={event.image || fallbackImage}
            alt={event.title}
            className="h-full min-h-[340px] w-full object-cover"
          />

          <div className="p-6 lg:p-8">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-md bg-[#f4b860] px-3 py-1 text-xs font-bold uppercase text-[#101214]">
                {event.category}
              </span>
              <span className="rounded-md bg-white/10 px-3 py-1 text-xs font-semibold text-white/75">
                {event.eventType}
              </span>
              <span className="rounded-md bg-white/10 px-3 py-1 text-xs font-semibold text-white/75">
                {event.status}
              </span>
            </div>

            <h1 className="text-3xl font-black text-white sm:text-4xl">{event.title}</h1>
            <p className="mt-4 text-base leading-7 text-white/68">{event.description}</p>

            <div className="mt-6 grid gap-3 text-sm text-white/72 sm:grid-cols-2">
              <InfoRow icon={Calendar} text={formatEventDate(event.date)} />
              <InfoRow icon={Clock3} text={event.time} />
              <InfoRow icon={MapPin} text={event.location} />
              <InfoRow
                icon={IndianRupee}
                text={Number(event.price || 0) === 0 ? "Free" : `₹${event.price}`}
              />
              <InfoRow
                icon={Users}
                text={`${event.registered}/${event.capacity} registered`}
              />
              <InfoRow icon={ShieldCheck} text={`Organized by ${event.organizer}`} />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {(event.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md bg-white/8 px-2.5 py-1.5 text-xs text-white/70"
                >
                  <Tags size={12} />
                  {tag}
                </span>
              ))}
            </div>

            <button
              onClick={() => onRegister(event.id)}
              disabled={isRegistered}
              className={`mt-8 w-full rounded-md px-4 py-3 text-sm font-bold transition ${
                isRegistered
                  ? "cursor-not-allowed bg-emerald-500/15 text-emerald-200"
                  : "bg-[#f4b860] text-[#101214] hover:bg-[#ffd081]"
              }`}
            >
              {isRegistered ? (
                <span className="inline-flex items-center gap-2">
                  <CheckCircle size={16} />
                  Already Registered
                </span>
              ) : user ? (
                Number(event.price || 0) > 0 ? "Pay and Register" : "Register"
              ) : (
                "Login to Register"
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-[#17191c] p-5">
          <h2 className="text-lg font-bold text-white">Who Should Attend</h2>
          <p className="mt-3 leading-7 text-white/66">
            {event.targetAudience || "Anyone interested in the topic."}
          </p>

          <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-white/45">
            Prerequisites
          </h3>
          <p className="mt-2 leading-7 text-white/66">
            {event.prerequisites || "No strict prerequisites."}
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#17191c] p-5">
          <h2 className="text-lg font-bold text-white">Agenda</h2>
          {event.agenda?.length ? (
            <ul className="mt-4 space-y-3">
              {event.agenda.map((item) => (
                <li key={item} className="rounded-md bg-white/6 px-4 py-3 text-white/70">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-white/60">Agenda will be shared by the organizer.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2">
      {createElement(Icon, { size: 16, className: "text-[#f4b860]" })}
      <span>{text}</span>
    </div>
  );
}

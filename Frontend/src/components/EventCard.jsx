import { Calendar, CheckCircle, IndianRupee, MapPin, Tag, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { formatEventDate } from "../utils/eventHelpers";

const fallbackImage =
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80";

export default function EventCard({ event, onRegister, user, isRegistered }) {
  const seatsLeft = Math.max(Number(event.capacity || 0) - Number(event.registered || 0), 0);

  return (
    <article className="overflow-hidden rounded-lg border border-white/10 bg-[#17191c] shadow-lg">
      <div className="relative aspect-[16/9] overflow-hidden bg-[#24272b]">
        <img
          src={event.image || fallbackImage}
          alt={event.title}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
        <div className="absolute left-3 top-3 rounded-md bg-[#f6f1e8] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#17191c]">
          {event.category}
        </div>
        {isRegistered && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
            <CheckCircle size={14} />
            Registered
          </div>
        )}
      </div>

      <div className="flex min-h-[320px] flex-col p-5">
        <div className="flex-1">
          <div className="mb-3 flex flex-wrap gap-2">
            {(event.tags || []).slice(0, 3).map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-white/8 px-2 py-1 text-xs text-white/70">
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>

          <Link to={`/events/${event.id}`} className="text-xl font-bold text-white hover:text-[#f4b860]">
            {event.title}
          </Link>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/68">{event.description}</p>

          <div className="mt-5 space-y-2 text-sm text-white/72">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#f4b860]" />
              <span>
                {formatEventDate(event.date)} at {event.time}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#82c0cc]" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#b8e986]" />
              <span>
                {seatsLeft} seats left · {event.registered}/{event.capacity} registered
              </span>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee size={16} className="text-[#ff8fab]" />
              <span>{Number(event.price || 0) === 0 ? "Free" : `₹${event.price}`}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onRegister(event.id)}
          disabled={isRegistered || seatsLeft === 0}
          className={`mt-6 w-full rounded-md px-4 py-3 text-sm font-bold transition ${
            isRegistered || seatsLeft === 0
              ? "cursor-not-allowed bg-white/10 text-white/45"
              : "bg-[#f4b860] text-[#17191c] hover:bg-[#ffd081]"
          }`}
        >
          {isRegistered ? "Already Registered" : seatsLeft === 0 ? "Full" : user ? "Register" : "Login to Register"}
        </button>
        <Link
          to={`/events/${event.id}`}
          className="mt-3 block text-center text-sm font-semibold text-[#82c0cc] hover:text-white"
        >
          View details
        </Link>
      </div>
    </article>
  );
}

import { Calendar, Clock, MapPin, Star, Users } from "lucide-react";
import { formatEventDate } from "../utils/eventHelpers";

const fallbackImage =
  "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80";

export default function DashboardEventCard({ event, actionButton, showMetrics = false }) {
  return (
    <article className="overflow-hidden rounded-lg border border-white/10 bg-[#17191c]">
      <div className="grid md:grid-cols-[220px_1fr]">
        <img src={event.image || fallbackImage} alt={event.title} className="h-48 w-full object-cover md:h-full" />

        <div className="p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-white/8 px-2 py-1 text-xs font-bold uppercase text-white/70">
              {event.status}
            </span>
            <span className="rounded-md bg-[#82c0cc]/15 px-2 py-1 text-xs font-bold text-[#82c0cc]">
              {event.category}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white">{event.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/60">{event.description}</p>

          <div className="mt-4 grid gap-2 text-sm text-white/70 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#f4b860]" />
              {formatEventDate(event.date)}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#82c0cc]" />
              {event.time}
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <MapPin size={16} className="text-[#ff8fab]" />
              {event.location}
            </div>
          </div>

          {showMetrics && (
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-white/8 p-3">
                <Users size={16} className="mx-auto mb-1 text-[#b8e986]" />
                <div className="font-black">{event.registered}</div>
                <div className="text-xs text-white/45">Registered</div>
              </div>
              <div className="rounded-md bg-white/8 p-3">
                <Users size={16} className="mx-auto mb-1 text-[#82c0cc]" />
                <div className="font-black">{event.checkedIn}</div>
                <div className="text-xs text-white/45">Checked in</div>
              </div>
              <div className="rounded-md bg-white/8 p-3">
                <Star size={16} className="mx-auto mb-1 text-[#f4b860]" />
                <div className="font-black">{event.averageRating || "0"}</div>
                <div className="text-xs text-white/45">Rating</div>
              </div>
            </div>
          )}

          <div className="mt-5">{actionButton}</div>
        </div>
      </div>
    </article>
  );
}

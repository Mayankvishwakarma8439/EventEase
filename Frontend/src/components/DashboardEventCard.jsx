import { Calendar, Clock, MapPin } from "lucide-react";

export default function DashboardEventCard({ event, actionButton }) {
  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl overflow-hidden">
      <div className="h-40 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white/90 text-lg line-clamp-1">
          {event.title}
        </h3>

        <div className="space-y-1 mt-2 text-sm text-white/60">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-purple-300" />
            {event.date}
          </div>

          <div className="flex items-center gap-2">
            <Clock size={16} className="text-cyan-300" />
            {event.time}
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-pink-300" />
            {event.location}
          </div>
        </div>

        <div className="mt-4">{actionButton}</div>
      </div>
    </div>
  );
}

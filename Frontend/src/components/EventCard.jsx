import { Calendar, CheckCircle, MapPin, Users } from "lucide-react";

export default function EventCard({ event, onRegister, user, isRegistered }) {
  return (
    <div className="relative group rounded-2xl overflow-hidden border border-white/6 bg-gradient-to-tr from-white/4 to-white/3 backdrop-blur-md p-0 shadow-lg transform transition hover:-translate-y-2">
      {/* image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

        <div
          className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2"
          style={{
            background: isRegistered
              ? "linear-gradient(90deg,#10b981,#34d399)"
              : "rgba(255,255,255,0.06)",
          }}
        >
          {isRegistered ? <CheckCircle className="w-4 h-4 text-white" /> : null}
          <span
            className={`text-xs ${
              isRegistered ? "text-white" : "text-white/90"
            }`}
          >
            {event.registered}/{event.capacity}
          </span>
        </div>
      </div>

      {/* content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-white/95 line-clamp-1">
          {event.title}
        </h3>
        <p className="mt-2 text-sm text-white/70 line-clamp-2">
          {event.description}
        </p>

        <div className="mt-4 grid grid-cols-1 gap-2">
          <div className="flex items-center text-xs text-white/70 gap-2">
            <Calendar className="w-4 h-4 text-[#a78bfa]" />
            <span>
              {event.date} • {event.time}
            </span>
          </div>

          <div className="flex items-center text-xs text-white/70 gap-2">
            <MapPin className="w-4 h-4 text-[#67e8f9]" />
            <span>{event.location}</span>
          </div>

          <div className="flex items-center text-xs text-white/70 gap-2">
            <Users className="w-4 h-4 text-[#fca5a5]" />
            <span>By {event.organizer}</span>
          </div>
        </div>

        <div className="mt-5">
          <button
            onClick={() => onRegister(event.id)}
            disabled={isRegistered}
            className={`w-full py-2 rounded-lg cursor-pointer font-semibold text-sm transition transform ${
              isRegistered
                ? "bg-white/10 text-white/60 cursor-not-allowed"
                : "bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-black hover:scale-105"
            }`}
          >
            {isRegistered
              ? "Registered"
              : user
              ? "Register Now"
              : "Login to Register"}
          </button>
        </div>
      </div>
    </div>
  );
}

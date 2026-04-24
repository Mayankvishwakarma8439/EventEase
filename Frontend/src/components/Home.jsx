import { BarChart3, BrainCircuit, QrCode, ShieldCheck } from "lucide-react";
import { createElement } from "react";
import EventCard from "./EventCard";
import { isUserRegistered } from "../utils/eventHelpers";

export default function HomePage({ events, onRegister, user, isLoading }) {
  return (
    <div>
      <section className="border-b border-white/10 bg-[#f6f1e8] text-[#17191c]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#b34234]">
              AI-powered campus event operations
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              EventEase helps students discover events and organizers run them end to end.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#34383d]">
              Build event pages with AI, collect registrations, track capacity, approve events, check in attendees,
              and turn feedback into useful reports.
            </p>
          </div>

          <div className="grid content-end gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              [BrainCircuit, "AI event drafting"],
              [ShieldCheck, "Admin approval workflow"],
              [QrCode, "Ticket and check-in ready"],
              [BarChart3, "Organizer analytics"],
            ].map(([Icon, label]) => (
              <div key={label} className="flex items-center gap-3 rounded-lg border border-[#17191c]/12 bg-white px-4 py-3">
                {createElement(Icon, { size: 20, className: "text-[#b34234]" })}
                <span className="font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold text-white">Approved Events</h2>
            <p className="mt-1 text-white/60">Browse workshops, seminars, cultural programs, and networking sessions.</p>
          </div>
          <div className="rounded-md bg-white/8 px-3 py-2 text-sm text-white/70">
            {events.length} event{events.length === 1 ? "" : "s"} available
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-12 text-center text-white/70">
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-12 text-center text-white/70">
            No approved events found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRegister={onRegister}
                user={user}
                isRegistered={isUserRegistered(event, user)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

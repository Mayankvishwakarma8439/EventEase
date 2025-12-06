import EventCard from "./EventCard";

export default function HomePage({
  events,
  onRegister,
  user,
  registeredEvents,
}) {
  const registeredEventIds = (registeredEvents || []).map((e) => e.id);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-gradient-to-tr from-white/4 to-white/3 border border-white/6 p-10 backdrop-blur-md shadow-xl">
            <h1 className="text-4xl pb-1 md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-tr from-[#c4b5fd] to-[#67e8f9]">
              EventEase — Effortless Event Discovery & Management
            </h1>

            <p className="mt-4 text-white/80 max-w-2xl">
              From meetups to mega-conferences, EventEase brings every event to
              your fingertips. Explore, register, and organize with a platform
              designed to make event planning feel intuitive, fast, and
              stress-free.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() =>
                  window.scrollTo({ top: 600, behavior: "smooth" })
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-tr from-[#7c3aed] to-[#06b6d4] text-black font-semibold hover:scale-105 transform transition"
              >
                Browse Events
              </button>
            </div>
          </div>
        </div>

        <aside className="hidden lg:block h-full">
          <div className="rounded-2xl bg-white/3 border border-white/6 p-4 backdrop-blur-md shadow-lg h-full">
            <h3 className="text-sm font-semibold text-white/90">
              Recent Events
            </h3>
            {events.length == 0 ? (
              <div className="flex justify-center text-white/70 items-center">
                No recent events
              </div>
            ) : (
              <ul className="mt-3 space-y-3">
                {events.slice(0, 4).map((ev) => (
                  <li
                    key={ev.id}
                    className="flex gap-3 items-center p-2 rounded-md hover:bg-white/5 transition cursor-pointer"
                  >
                    <img
                      src={ev.image}
                      alt={ev.title}
                      className="w-12 h-8 object-cover rounded-md"
                    />
                    <div className="text-sm">
                      <div className="font-medium text-white/90 line-clamp-1">
                        {ev.title}
                      </div>
                      <div className="text-xs text-white/60">
                        {ev.date} • {ev.location}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </section>

      <section className="mt-10">
        {events.length === 0 ? (
          <div className="rounded-xl p-12 bg-white/3 border border-white/6 text-center text-white/70">
            No events found matching your search criteria.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRegister={onRegister}
                user={user}
                isRegistered={registeredEventIds.includes(event.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

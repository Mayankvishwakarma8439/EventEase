import DashboardEventCard from "./DashboardEventCard";

export default function RegisteredEventsSection({
  registeredEvents,
  onCancelRegistration,
}) {
  if (!registeredEvents.length)
    return (
      <div className="p-10 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg text-center text-white/70 shadow-xl">
        You haven’t registered for any events yet.
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {registeredEvents.map((event) => (
        <DashboardEventCard
          key={event.id}
          event={event}
          actionButton={
            <button
              onClick={() => onCancelRegistration(event.id)}
              className="w-full py-2 rounded-lg bg-red-500/20 border border-red-400/40 text-red-300 font-medium hover:bg-red-500/30 transition"
            >
              Cancel Registration
            </button>
          }
        />
      ))}
    </div>
  );
}

import DashboardEventCard from "./DashboardEventCard";
import { getUserId } from "../utils/eventHelpers";

export default function RegisteredEventsSection({
  registeredEvents,
  onCancelRegistration,
  user,
}) {
  if (!registeredEvents.length)
    return (
      <div className="p-10 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg text-center text-white/70 shadow-xl">
        You haven’t registered for any events yet.
      </div>
    );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {registeredEvents.map((event) => (
        <DashboardEventCard
          key={event.id}
          event={event}
          actionButton={
            <TicketActions event={event} user={user} onCancelRegistration={onCancelRegistration} />
          }
        />
      ))}
    </div>
  );
}

function TicketActions({ event, user, onCancelRegistration }) {
  const attendee = event.attendees?.find((item) => {
    const attendeeId = item.user?._id || item.user || item._id;
    return attendeeId === getUserId(user) && item.status !== "cancelled";
  });

  return (
    <div className="space-y-3">
      {attendee && (
        <div className="rounded-md border border-[#f4b860]/30 bg-[#f4b860]/10 p-3">
          <div className="text-xs font-bold uppercase text-[#f4b860]">Ticket Code</div>
          <div className="mt-1 font-mono text-2xl font-black tracking-widest text-white">
            {attendee.ticketCode}
          </div>
          <div className="mt-1 text-xs text-white/50">
            {attendee.paymentStatus} · {attendee.status}
          </div>
        </div>
      )}
      <button
        onClick={() => onCancelRegistration(event.id)}
        className="w-full rounded-md border border-red-400/40 bg-red-500/15 px-3 py-2 font-semibold text-red-200 transition hover:bg-red-500/25"
      >
        Cancel Registration
      </button>
    </div>
  );
}

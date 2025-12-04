import { Plus } from "lucide-react";
import DashboardEventCard from "./DashboardEventCard";

export default function CreatedEventsSection({
  createdEvents,
  onDeleteEvent,
  showCreateForm,
  setShowCreateForm,
  formData,
  setFormData,
  handleCreateSubmit,
}) {
  return (
    <div>
      {/* header with button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white/90">
          Events You Organized
        </h2>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 cursor-pointer rounded-lg bg-gradient-to-tr from-[#7c3aed] to-[#06b6d4] text-black font-semibold hover:scale-105 transition shadow-lg flex items-center gap-2"
        >
          <Plus size={18} />
          {showCreateForm ? "Close Form" : "Create Event"}
        </button>
      </div>

      {/* CREATE EVENT FORM */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-black/80 border border-white/15 rounded-2xl shadow-2xl p-8 animate-fadeIn">
            <h3 className="text-xl text-cyan-200 font-semibold mb-6">
              Create New Event
            </h3>

            <form
              onSubmit={handleCreateSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <input
                type="text"
                required
                placeholder="Event Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="glass-input"
              />

              <input
                type="text"
                required
                placeholder="Location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="glass-input"
              />

              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="glass-input"
              />

              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="glass-input"
              />

              <input
                type="number"
                required
                placeholder="Capacity"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
                className="glass-input"
              />

              <input
                type="url"
                placeholder="Image URL"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                className="glass-input"
              />

              <textarea
                required
                placeholder="Event Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows="3"
                className="glass-input sm:col-span-2"
              />

              <button
                type="submit"
                className="sm:col-span-2 py-3 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#06b6d4] text-black font-semibold hover:scale-[1.03] transition"
              >
                Create Event
              </button>
            </form>

            {/* close button */}
            <button
              onClick={() => setShowCreateForm(false)}
              className="absolute top-4 cursor-pointer right-4 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg text-white/80"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* CREATED EVENTS LIST */}
      {createdEvents.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg text-center text-white/70 shadow-xl">
          You haven’t created any events yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {createdEvents.map((event) => (
            <DashboardEventCard
              key={event.id}
              event={event}
              actionButton={
                <button
                  onClick={() => onDeleteEvent(event.id)}
                  className="w-full py-2 rounded-lg bg-red-500/20 border border-red-400/40 text-red-300 font-medium hover:bg-red-500/30 transition"
                >
                  Delete Event
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

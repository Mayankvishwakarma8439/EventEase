import { BrainCircuit, Check, Pencil, Plus, WandSparkles, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { EVENT_CATEGORIES, EVENT_TYPES } from "../constants/eventOptions";
import { aiApi } from "../services/api";
import DashboardEventCard from "./DashboardEventCard";

export default function CreatedEventsSection({
  createdEvents,
  onDeleteEvent,
  onApproveEvent,
  showCreateForm,
  setShowCreateForm,
  formData,
  setFormData,
  handleCreateSubmit,
  editingEventId,
  setEditingEventId,
  user,
}) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const applyAiDraft = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Describe the event idea first");
      return;
    }

    try {
      setIsGenerating(true);
      const data = await aiApi.draftEvent(aiPrompt);
      const draft = data.draft;
      setFormData((prev) => ({
        ...prev,
        title: draft.title || prev.title,
        description: draft.description || prev.description,
        category: draft.category || prev.category,
        eventType: draft.eventType || prev.eventType,
        targetAudience: draft.targetAudience || prev.targetAudience,
        prerequisites: draft.prerequisites || prev.prerequisites,
        tags: Array.isArray(draft.tags) ? draft.tags.join(", ") : prev.tags,
        agenda: Array.isArray(draft.agenda) ? draft.agenda.join(", ") : prev.agenda,
      }));
      toast.success("AI draft applied");
    } catch (err) {
      toast.error(err.message || "AI draft failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const editEvent = (event) => {
    setEditingEventId(event.id);
    setFormData({
      title: event.title || "",
      description: event.description || "",
      category: event.category || "workshop",
      eventType: event.eventType || "in-person",
      date: event.date ? new Date(event.date).toISOString().slice(0, 10) : "",
      time: event.time || "",
      location: event.location || "",
      venueDetails: event.venueDetails || "",
      capacity: event.capacity || "",
      price: event.price || "0",
      tags: (event.tags || []).join(", "),
      agenda: (event.agenda || []).join(", "),
      targetAudience: event.targetAudience || "",
      prerequisites: event.prerequisites || "",
      image: "",
    });
    setShowCreateForm(true);
  };

  return (
    <section>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Organizer Console</h2>
          <p className="mt-1 text-sm text-white/55">Create events, monitor approvals, and manage attendee flow.</p>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f4b860] px-4 py-2 font-bold text-[#17191c] transition hover:bg-[#ffd081]"
        >
          {showCreateForm ? <X size={18} /> : <Plus size={18} />}
          {showCreateForm ? "Close" : "Create Event"}
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-8 rounded-lg border border-white/10 bg-[#17191c] p-5">
          <div className="mb-5 rounded-lg border border-[#f4b860]/30 bg-[#f4b860]/10 p-4">
            <div className="mb-3 flex items-center gap-2 text-[#f4b860]">
              <BrainCircuit size={20} />
              <span className="font-bold">AI Event Assistant</span>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
                placeholder="Example: React workshop for first-year students next Friday"
                className="glass-input flex-1"
              />
              <button
                type="button"
                onClick={applyAiDraft}
                disabled={isGenerating}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#82c0cc] px-4 py-3 font-bold text-[#101214] disabled:opacity-60"
              >
                <WandSparkles size={18} />
                {isGenerating ? "Generating" : "Generate Draft"}
              </button>
            </div>
          </div>

          <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input required placeholder="Event title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="glass-input" />
            <input required placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="glass-input" />
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="glass-input">
              {EVENT_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <select value={formData.eventType} onChange={(e) => setFormData({ ...formData, eventType: e.target.value })} className="glass-input">
              {EVENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="glass-input" />
            <input type="time" required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="glass-input" />
            <input type="number" min="1" required placeholder="Capacity" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} className="glass-input" />
            <input type="number" min="0" placeholder="Price" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="glass-input" />
            <input placeholder="Tags, comma separated" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="glass-input md:col-span-2" />
            <input placeholder="Venue details" value={formData.venueDetails} onChange={(e) => setFormData({ ...formData, venueDetails: e.target.value })} className="glass-input md:col-span-2" />
            <input placeholder="Target audience" value={formData.targetAudience} onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })} className="glass-input md:col-span-2" />
            <input placeholder="Prerequisites" value={formData.prerequisites} onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })} className="glass-input md:col-span-2" />
            <textarea required placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="4" className="glass-input md:col-span-2" />
            <textarea placeholder="Agenda items, comma separated" value={formData.agenda} onChange={(e) => setFormData({ ...formData, agenda: e.target.value })} rows="3" className="glass-input md:col-span-2" />
            <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })} className="glass-input md:col-span-2" />
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f4b860] px-4 py-3 font-bold text-[#17191c] md:col-span-2">
              <Check size={18} />
              {editingEventId ? "Update Event" : "Submit For Approval"}
            </button>
          </form>
        </div>
      )}

      {createdEvents.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/5 p-10 text-center text-white/65">
          No organized events yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {createdEvents.map((event) => (
            <DashboardEventCard
              key={event.id}
              event={event}
              showMetrics
              actionButton={
                <div className="grid gap-2">
                  {user.role === "admin" && event.status === "pending" && (
                    <button onClick={() => onApproveEvent(event.id)} className="rounded-md bg-emerald-500 px-3 py-2 font-semibold text-white">
                      Approve Event
                    </button>
                  )}
                  <button onClick={() => editEvent(event)} className="inline-flex items-center justify-center gap-2 rounded-md bg-white/10 px-3 py-2 font-semibold text-white">
                    <Pencil size={16} />
                    Edit Event
                  </button>
                  <button onClick={() => onDeleteEvent(event.id)} className="rounded-md border border-red-400/40 bg-red-500/15 px-3 py-2 font-semibold text-red-200">
                    Delete Event
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

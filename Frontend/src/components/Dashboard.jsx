import { useState } from "react";
import CreatedEventsSection from "./CreatedEvents";
import RegisteredEventsSection from "./RegisteredEvents";

export default function DashboardPage({
  user,
  registeredEvents,
  createdEvents,
  onCreateEvent,
  onDeleteEvent,
  onCancelRegistration,
}) {
  const [activeTab, setActiveTab] = useState("registered");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    capacity: "",
    image: "",
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const result = await onCreateEvent(formData);

    if (result.success) {
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        capacity: "",
        image:
          "https://images.unsplash.com/photo-1505373877841-8e2e717b171c?q=80&w=1770&auto=format&fit=crop",
      });
      setShowCreateForm(false);
      setActiveTab("created");
      alert("Event created successfully!");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="border-b border-white/10 pb-6 mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-br from-purple-200 to-cyan-200 bg-clip-text text-transparent">
          Welcome back, {user.name}
        </h1>
        <p className="text-white/60 mt-2">Manage your events and activity</p>
      </div>

      <div className="flex items-center gap-6 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("registered")}
          className={`pb-2 text-md font-semibold transition ${
            activeTab === "registered"
              ? "text-cyan-300 border-b-2 border-cyan-300"
              : "text-white/60 hover:text-white"
          }`}
        >
          Registered Events ({registeredEvents.length})
        </button>

        <button
          onClick={() => setActiveTab("created")}
          className={`pb-2 text-md font-semibold transition ${
            activeTab === "created"
              ? "text-cyan-300 border-b-2 border-cyan-300"
              : "text-white/60 hover:text-white"
          }`}
        >
          My Created Events ({createdEvents.length})
        </button>
      </div>

      <div className="mt-10">
        {activeTab === "registered" ? (
          <RegisteredEventsSection
            registeredEvents={registeredEvents}
            onCancelRegistration={onCancelRegistration}
          />
        ) : (
          <CreatedEventsSection
            createdEvents={createdEvents}
            onDeleteEvent={onDeleteEvent}
            showCreateForm={showCreateForm}
            setShowCreateForm={setShowCreateForm}
            formData={formData}
            setFormData={setFormData}
            handleCreateSubmit={handleCreateSubmit}
          />
        )}
      </div>
    </div>
  );
}

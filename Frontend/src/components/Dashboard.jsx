import { useState } from "react";
import AdminPanel from "./AdminPanel";
import CheckInPanel from "./CheckInPanel";
import CreatedEventsSection from "./CreatedEvents";
import RegisteredEventsSection from "./RegisteredEvents";
import { emptyEventForm } from "../constants/eventOptions";

export default function DashboardPage({
  user,
  registeredEvents,
  createdEvents,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  onCancelRegistration,
  onApproveEvent,
  adminEvents,
  onCheckedIn,
  onRefresh,
  onUserRoleUpdate,
}) {
  const canOrganize = ["organizer", "admin"].includes(user.role);
  const checkInEvents = user.role === "admin" ? adminEvents : createdEvents;
  const [activeTab, setActiveTab] = useState("created");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState(emptyEventForm);
  const [editingEventId, setEditingEventId] = useState("");

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    const result = editingEventId
      ? await onUpdateEvent(editingEventId, formData)
      : await onCreateEvent(formData);

    if (result.success) {
      setFormData(emptyEventForm);
      setEditingEventId("");
      setShowCreateForm(false);
      setActiveTab("created");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 rounded-lg border border-white/10 bg-[#17191c] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#f4b860]">{user.role}</p>
            <h1 className="mt-1 text-3xl font-black text-white">Welcome back, {user.name}</h1>
            <p className="mt-2 text-white/60">
              Run real event operations from draft to attendance, tickets, payments, and approvals.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-md bg-white/8 p-3">
              <div className="text-2xl font-black">{registeredEvents.length}</div>
              <div className="text-xs text-white/55">Registered</div>
            </div>
            <div className="rounded-md bg-white/8 p-3">
              <div className="text-2xl font-black">{createdEvents.length}</div>
              <div className="text-xs text-white/55">Created</div>
            </div>
            <div className="rounded-md bg-white/8 p-3">
              <div className="text-2xl font-black">
                {createdEvents.reduce((sum, event) => sum + Number(event.checkedIn || 0), 0)}
              </div>
              <div className="text-xs text-white/55">Check-ins</div>
            </div>
          </div>
        </div>
      </header>

      <div className="mb-8 flex gap-2 border-b border-white/10">
        {canOrganize && (
          <button
            onClick={() => setActiveTab("created")}
            className={`px-4 py-3 text-sm font-bold ${activeTab === "created" ? "border-b-2 border-[#f4b860] text-[#f4b860]" : "text-white/55"}`}
          >
            Organizer
          </button>
        )}
        <button
          onClick={() => setActiveTab("registered")}
          className={`px-4 py-3 text-sm font-bold ${activeTab === "registered" ? "border-b-2 border-[#f4b860] text-[#f4b860]" : "text-white/55"}`}
        >
          My Registrations
        </button>
        {canOrganize && (
          <button
            onClick={() => setActiveTab("checkin")}
            className={`px-4 py-3 text-sm font-bold ${activeTab === "checkin" ? "border-b-2 border-[#f4b860] text-[#f4b860]" : "text-white/55"}`}
          >
            Check-in
          </button>
        )}
        {user.role === "admin" && (
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-4 py-3 text-sm font-bold ${activeTab === "admin" ? "border-b-2 border-[#f4b860] text-[#f4b860]" : "text-white/55"}`}
          >
            Admin
          </button>
        )}
      </div>

      {activeTab === "registered" ? (
        <RegisteredEventsSection
          user={user}
          registeredEvents={registeredEvents}
          onCancelRegistration={onCancelRegistration}
        />
      ) : activeTab === "checkin" ? (
        <CheckInPanel events={checkInEvents} onCheckedIn={onCheckedIn} />
      ) : activeTab === "admin" ? (
        <AdminPanel
          events={adminEvents}
          onApproveEvent={onApproveEvent}
          onRefresh={onRefresh}
          onUserRoleUpdate={onUserRoleUpdate}
        />
      ) : (
        <CreatedEventsSection
          user={user}
          createdEvents={createdEvents}
          onDeleteEvent={onDeleteEvent}
          onApproveEvent={onApproveEvent}
          showCreateForm={showCreateForm}
          setShowCreateForm={setShowCreateForm}
          formData={formData}
          setFormData={setFormData}
          handleCreateSubmit={handleCreateSubmit}
          editingEventId={editingEventId}
          setEditingEventId={setEditingEventId}
        />
      )}
    </div>
  );
}

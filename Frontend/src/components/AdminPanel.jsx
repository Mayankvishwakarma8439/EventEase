import { CheckCircle, Mail, RefreshCcw, Shield, Users } from "lucide-react";
import { createElement } from "react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "../services/api";
import DashboardEventCard from "./DashboardEventCard";

export default function AdminPanel({
  events,
  onApproveEvent,
  onRefresh,
  onUserRoleUpdate,
}) {
  const [overview, setOverview] = useState({ users: [], emails: [], payments: [] });

  useEffect(() => {
    adminApi
      .overview()
      .then((data) => setOverview(data))
      .catch((err) => toast.error(err.message));
  }, []);

  const pending = events.filter((event) => event.status === "pending");

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Admin Control Center</h2>
          <p className="mt-1 text-sm text-white/55">Approve events, inspect users, and monitor local payment/email activity.</p>
        </div>
        <button onClick={onRefresh} className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white">
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Pending approvals" value={pending.length} icon={CheckCircle} />
        <Metric label="Total events" value={events.length} icon={CheckCircle} />
        <Metric label="Users" value={overview.users.length} icon={Users} />
        <Metric label="Emails sent" value={overview.emails.length} icon={Mail} />
      </div>

      <div>
        <h3 className="mb-3 font-bold text-white">Approval Queue</h3>
        {pending.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center text-white/60">No pending events.</div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {pending.map((event) => (
              <DashboardEventCard
                key={event.id}
                event={event}
                showMetrics
                actionButton={
                  <button onClick={() => onApproveEvent(event.id)} className="w-full rounded-md bg-emerald-500 px-3 py-2 font-bold text-white">
                    Approve and Publish
                  </button>
                }
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <LogTable title="Recent Payment Intents" rows={overview.payments} empty="No payments yet." />
        <LogTable title="Email Outbox" rows={overview.emails} empty="No emails sent yet." />
      </div>

      <div className="rounded-lg border border-white/10 bg-[#17191c] p-4">
        <div className="mb-4 flex items-center gap-2 text-white">
          <Shield size={18} className="text-[#f4b860]" />
          <h3 className="font-bold">User Role Management</h3>
        </div>
        <div className="space-y-2">
          {overview.users.map((user) => (
            <div
              key={user._id}
              className="grid gap-3 rounded-md bg-white/6 p-3 sm:grid-cols-[1fr_auto]"
            >
              <div>
                <div className="font-semibold text-white">{user.username}</div>
                <div className="text-sm text-white/55">
                  {user.email} · {user.department || "No department"}
                </div>
              </div>
              <select
                defaultValue={user.role}
                onChange={async (event) => {
                  const updatedUser = await onUserRoleUpdate(user._id, event.target.value);
                  if (updatedUser) {
                    setOverview((prev) => ({
                      ...prev,
                      users: prev.users.map((item) =>
                        item._id === user._id ? { ...item, role: updatedUser.role } : item
                      ),
                    }));
                    toast.success(`Role updated for ${user.username}`);
                  }
                }}
                className="glass-input"
              >
                <option value="student">student</option>
                <option value="organizer">organizer</option>
                <option value="admin">admin</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#17191c] p-4">
      {createElement(Icon, { size: 20, className: "mb-3 text-[#f4b860]" })}
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-xs text-white/50">{label}</div>
    </div>
  );
}

function LogTable({ title, rows, empty }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#17191c] p-4">
      <h3 className="mb-3 font-bold text-white">{title}</h3>
      {rows.length === 0 ? (
        <div className="text-sm text-white/50">{empty}</div>
      ) : (
        <div className="max-h-72 space-y-2 overflow-auto">
          {rows.slice(0, 8).map((row) => (
            <div key={row.id} className="rounded-md bg-white/6 p-3 text-sm text-white/70">
              <div className="font-semibold text-white">{row.subject || row.id}</div>
              <div>{row.to || row.status}</div>
              <div className="text-xs text-white/40">{row.sentAt || row.createdAt}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

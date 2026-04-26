import { useCallback, useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./components/Home";
import LoginPage from "./components/Login";
import SignupPage from "./components/Signup";
import DashboardPage from "./components/Dashboard";
import EventDetail from "./components/EventDetail";
import { authApi, eventApi } from "./services/api";
import { buildEventFormData, isUserRegistered } from "./utils/eventHelpers";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [myCreatedEvents, setMyCreatedEvents] = useState([]);
  const [adminEvents, setAdminEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const [publicData, myEventsData, myRegistrationsData, adminEventsData] =
        await Promise.all([
          eventApi.list(),
          user
            ? eventApi.myEvents().catch(() => ({ events: [] }))
            : Promise.resolve({ events: [] }),
          user
            ? eventApi.myRegistrations().catch(() => ({ events: [] }))
            : Promise.resolve({ events: [] }),
          user?.role === "admin"
            ? eventApi.adminEvents().catch(() => ({ events: [] }))
            : Promise.resolve({ events: [] }),
        ]);

      setEvents(publicData.events || []);
      setMyCreatedEvents(myEventsData.events || []);
      setRegisteredEvents(myRegistrationsData.events || []);
      setAdminEvents(adminEventsData.events || []);
    } catch (err) {
      toast.error(err.message || "Unable to load events");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) setUser(JSON.parse(userData));
    else setIsLoading(false);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleLogin = async (email, password) => {
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      toast.success("Welcome back");
      navigate("/dashboard");
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleSignup = async (payload) => {
    try {
      const data = await authApi.signup(payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      toast.success("Account created");
      navigate("/dashboard");
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleRegisterEvent = async (eventId) => {
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    try {
      const event = [...events, ...myCreatedEvents, ...registeredEvents].find(
        (item) => item.id === eventId
      );
      let paymentIntentId = "";
      let payment = null;

      if (Number(event?.price || 0) > 0) {
        const intentData = await eventApi.createPaymentIntent(eventId);
        const intent = intentData.paymentIntent;

        if (intent.provider === "razorpay") {
          payment = await openRazorpayCheckout({
            event,
            intent,
            user,
          });
          paymentIntentId = intent.id;
        } else {
          const ok = window.confirm(
            `Mock payment checkout\n\nPay ₹${intent.amount} for "${event.title}"?`
          );
          if (!ok) return;
          paymentIntentId = intent.id;
        }
      }

      const data = await eventApi.register(eventId, paymentIntentId, payment);
      syncEvent(data.event);
      if (!registeredEvents.some((item) => item.id === data.event.id)) {
        setRegisteredEvents((prev) => [...prev, data.event]);
      }
      toast.success("Registration confirmed");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      const data = await eventApi.create(buildEventFormData(eventData));
      setMyCreatedEvents((prev) => [data.event, ...prev]);
      if (data.event.status === "approved") setEvents((prev) => [data.event, ...prev]);
      if (user?.role === "admin") setAdminEvents((prev) => [data.event, ...prev]);
      toast.success(data.message || "Event submitted");
      return { success: true };
    } catch (err) {
      toast.error(err.message || "Failed to create event");
      return { success: false };
    }
  };

  const handleUpdateEvent = async (eventId, eventData) => {
    try {
      const data = await eventApi.update(eventId, buildEventFormData(eventData));
      syncEvent(data.event);
      toast.success("Event updated");
      return { success: true };
    } catch (err) {
      toast.error(err.message || "Failed to update event");
      return { success: false };
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await eventApi.delete(eventId);
      setMyCreatedEvents((prev) => prev.filter((event) => event.id !== eventId));
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      setRegisteredEvents((prev) => prev.filter((event) => event.id !== eventId));
      setAdminEvents((prev) => prev.filter((event) => event.id !== eventId));
      toast.success("Event deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancelRegistration = async (eventId) => {
    try {
      const data = await eventApi.unregister(eventId);
      setRegisteredEvents((prev) => prev.filter((event) => event.id !== eventId));
      syncEvent(data.event);
      toast.success("Registration cancelled");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleApproveEvent = async (eventId, status = "approved", adminNotes = "") => {
    try {
      const data = await eventApi.approve(eventId, status, adminNotes);
      syncEvent(data.event);
      toast.success(status === "approved" ? "Event approved" : "Event updated");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCheckedIn = (updatedEvent) => {
    syncEvent(updatedEvent);
  };

  const handleUserRoleUpdate = async (userId, role) => {
    try {
      const data = await authApi.updateUserRole(userId, role);
      if (user?.id === userId) {
        const updatedUser = { ...user, role: data.user.role };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      toast.success("Role updated");
      return data.user;
    } catch (err) {
      toast.error(err.message);
      return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setRegisteredEvents([]);
    setMyCreatedEvents([]);
    setAdminEvents([]);
    navigate("/");
  };

  const syncEvent = (updatedEvent) => {
    setEvents((prev) => syncPublicEvents(prev, updatedEvent));
    setMyCreatedEvents((prev) => upsertEvent(prev, updatedEvent));
    setRegisteredEvents((prev) => upsertEvent(prev, updatedEvent));
    setAdminEvents((prev) => upsertEvent(prev, updatedEvent));
  };

  const filteredEvents = useMemo(
    () =>
      events.filter((event) =>
        [
          event.title,
          event.description,
          event.location,
          event.organizer,
          event.category,
          ...(event.tags || []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [events, searchQuery]
  );

  return (
    <>
      <div className="min-h-screen bg-[#101214] text-gray-100">
        <Navbar
          user={user}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="pb-16">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  events={filteredEvents}
                  onRegister={handleRegisterEvent}
                  user={user}
                  isLoading={isLoading}
                />
              }
            />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/signup" element={<SignupPage onSignup={handleSignup} />} />
            <Route
              path="/dashboard"
              element={
                user ? (
                  <DashboardPage
                    user={user}
                    registeredEvents={registeredEvents}
                    createdEvents={myCreatedEvents}
                    onCreateEvent={handleCreateEvent}
                    onUpdateEvent={handleUpdateEvent}
                    onDeleteEvent={handleDeleteEvent}
                    onCancelRegistration={handleCancelRegistration}
                    onApproveEvent={handleApproveEvent}
                    adminEvents={adminEvents}
                    onCheckedIn={handleCheckedIn}
                    onRefresh={loadEvents}
                    onUserRoleUpdate={handleUserRoleUpdate}
                  />
                ) : (
                  <Navigate to="/login" replace state={{ from: location.pathname }} />
                )
              }
            />
            <Route
              path="/events/:eventId"
              element={
                <EventDetailRoute
                  user={user}
                  events={events}
                  onRegister={handleRegisterEvent}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <Toaster position="bottom-center" />
    </>
  );
}

function EventDetailRoute({ user, events, onRegister }) {
  const { eventId } = useParams();
  const [event, setEvent] = useState(
    events.find((item) => item.id === eventId) || null
  );

  useEffect(() => {
    const existing = events.find((item) => item.id === eventId);
    if (existing) {
      setEvent(existing);
      return;
    }

    eventApi
      .getById(eventId)
      .then((data) => setEvent(data.event))
      .catch(() => setEvent(null));
  }, [eventId, events]);

  return (
    <EventDetail
      event={event}
      user={user}
      onRegister={onRegister}
      isRegistered={isUserRegistered(event || {}, user)}
    />
  );
}

const upsertEvent = (events, updatedEvent) => {
  const exists = events.some((event) => event.id === updatedEvent.id);
  if (!exists) return events;
  return events.map((event) => (event.id === updatedEvent.id ? updatedEvent : event));
};

const syncPublicEvents = (events, updatedEvent) => {
  const isPublic = ["approved", "completed"].includes(updatedEvent.status);
  const exists = events.some((event) => event.id === updatedEvent.id);

  if (exists && !isPublic) {
    return events.filter((event) => event.id !== updatedEvent.id);
  }

  if (exists) {
    return events.map((event) => (event.id === updatedEvent.id ? updatedEvent : event));
  }

  return isPublic ? [updatedEvent, ...events] : events;
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const openRazorpayCheckout = async ({ event, intent, user }) => {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    throw new Error("Unable to load Razorpay checkout");
  }

  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      key: intent.keyId,
      amount: Math.round(Number(intent.amount) * 100),
      currency: intent.currency || "INR",
      name: "EventEase",
      description: event.title,
      order_id: intent.id,
      prefill: {
        name: user.name,
        email: user.email,
      },
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    });

    razorpay.open();
  });
};

export default App;

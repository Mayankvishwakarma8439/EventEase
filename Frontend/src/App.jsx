import React, { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import HomePage from "./components/Home";
import LoginPage from "./components/Login";
import SignupPage from "./components/Signup";
import DashboardPage from "./components/Dashboard";

const API_BASE_URL = "http://localhost:4000/api";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [myCreatedEvents, setMyCreatedEvents] = useState([]);

  //For getting token and user from browser
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
  }, []);
  //For Events Fetching
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/events`);
        const data = await res.json();
        if (!data.success) {
          console.error("Error fetching events:", data.message);
          return;
        }
        setEvents(data.events);
        const userData = localStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          const userId = parsedUser.id || parsedUser._id;
          const userRegistered = data.events.filter((ev) =>
            ev.attendees?.some((a) => {
              const attId = a._id || a;
              return attId === userId;
            })
          );
          const userCreated = data.events.filter((ev) => {
            const creator = ev.createdBy?._id || ev.createdBy;
            return creator === userId;
          });

          setRegisteredEvents(userRegistered);
          setMyCreatedEvents(userCreated);
        }
      } catch (err) {
        console.error("Fetch events failed:", err);
      }
    };

    fetchEvents();
  }, [user]);

  const handleLogin = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.message };
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setCurrentPage("home");
      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: "Something went wrong" };
    }
  };

  const handleSignup = async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: name, email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.message };
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setCurrentPage("home");
      return { success: true };
    } catch (err) {
      console.error("Signup error:", err);
      return { success: false, error: "Something went wrong" };
    }
  };
  const handleRegisterEvent = async (eventId) => {
    if (!user) {
      setCurrentPage("login");
      alert("Please login first");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must login again.");
        return;
      }
      const res = await fetch(`${API_BASE_URL}/register-event/${eventId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message);
        return;
      }
      const updatedEvent = data.event;
      setEvents((prev) =>
        prev.map((ev) => (ev.id === updatedEvent.id ? updatedEvent : ev))
      );
      setRegisteredEvents((prev) => {
        if (!prev.some((e) => e.id === updatedEvent.id)) {
          return [...prev, updatedEvent];
        }
        return prev;
      });

      alert("Registered successfully!");
    } catch (err) {
      console.error("Register event failed:", err);
      alert("Something went wrong while registering");
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      const token = localStorage.getItem("token");

      const form = new FormData();
      form.append("title", eventData.title);
      form.append("description", eventData.description);
      form.append("date", eventData.date);
      form.append("time", eventData.time);
      form.append("location", eventData.location);
      form.append("capacity", eventData.capacity);
      form.append("image", eventData.image);

      const res = await fetch(`${API_BASE_URL}/create-event`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to create event");
        return { success: false };
      }

      const createdEvent = data.event;
      setMyCreatedEvents((prev) => [createdEvent, ...prev]);
      setEvents((prev) => [createdEvent, ...prev]);

      return { success: true };
    } catch (err) {
      console.error("Create event failed:", err);
      return { success: false };
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }
      const res = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to delete event");
        return;
      }
      setMyCreatedEvents((prev) => prev.filter((ev) => ev.id !== eventId));
      setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
      setRegisteredEvents((prev) => prev.filter((ev) => ev.id !== eventId));
      alert("Event deleted successfully!");
    } catch (err) {
      console.error("Delete event error:", err);
      alert("Server error while deleting");
    }
  };

  const handleCancelRegistration = async (eventId) => {
    if (!user) {
      alert("Please login first");
      setCurrentPage("login");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Session expired. Login again.");
        return;
      }
      const res = await fetch(`${API_BASE_URL}/unregister-event/${eventId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message);
        return;
      }
      const updatedEvent = data.event;
      setRegisteredEvents((prev) =>
        prev.filter((e) => e.id !== updatedEvent.id)
      );
      setEvents((prev) =>
        prev.map((ev) => (ev.id === updatedEvent.id ? updatedEvent : ev))
      );
      alert("Registration cancelled successfully!");
    } catch (err) {
      console.error("Cancel registration error:", err);
      alert("Something went wrong while cancelling");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setCurrentPage("home");
    setRegisteredEvents([]);
    setMyCreatedEvents([]);
  };

  const filteredEvents = events.filter((event) =>
    [event.title, event.description, event.location, event.organizer]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1724] via-[#071020] to-[#030316] text-gray-100">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0b1220]/30 via-transparent to-transparent"></div>

      <Navbar
        user={user}
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="pt-8 pb-16">
        {currentPage === "home" && (
          <HomePage
            events={filteredEvents}
            onRegister={handleRegisterEvent}
            user={user}
            registeredEvents={registeredEvents}
          />
        )}
        {currentPage === "login" && (
          <LoginPage onLogin={handleLogin} onPageChange={setCurrentPage} />
        )}

        {currentPage === "signup" && (
          <SignupPage onSignup={handleSignup} onPageChange={setCurrentPage} />
        )}

        {currentPage === "dashboard" && user && (
          <DashboardPage
            user={user}
            registeredEvents={registeredEvents}
            createdEvents={myCreatedEvents}
            onCreateEvent={handleCreateEvent}
            onDeleteEvent={handleDeleteEvent}
            onCancelRegistration={handleCancelRegistration}
          />
        )}
      </main>
    </div>
  );
}

export default App;

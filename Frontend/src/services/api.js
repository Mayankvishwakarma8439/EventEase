const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const getToken = () => localStorage.getItem("token");

const request = async (path, options = {}) => {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

export const authApi = {
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  signup: ({ username, email, password, role, department }) =>
    request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ username, email, password, role, department }),
    }),
  updateUserRole: (id, role) =>
    request(`/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
};

export const eventApi = {
  list: () => request("/events"),
  adminEvents: () => request("/admin/events"),
  getById: (id) => request(`/event/${id}`),
  myEvents: () => request("/my-events"),
  myRegistrations: () => request("/my-registrations"),
  create: (formData) => request("/create-event", { method: "POST", body: formData }),
  update: (id, formData) => request(`/update-event/${id}`, { method: "PUT", body: formData }),
  delete: (id) => request(`/events/${id}`, { method: "DELETE" }),
  createPaymentIntent: (id) => request(`/events/${id}/payment-intent`, { method: "POST" }),
  register: (id, paymentIntentId = "", payment = null) =>
    request(`/register-event/${id}`, {
      method: "POST",
      body: JSON.stringify({ paymentIntentId, payment }),
    }),
  unregister: (id) => request(`/unregister-event/${id}`, { method: "POST" }),
  approve: (id, status = "approved", adminNotes = "") =>
    request(`/events/${id}/approval`, {
      method: "PATCH",
      body: JSON.stringify({ status, adminNotes }),
    }),
  checkIn: (eventId, payload) =>
    request(`/events/${eventId}/check-in`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const adminApi = {
  overview: () => request("/admin/overview"),
};

export const aiApi = {
  draftEvent: (prompt) =>
    request("/ai/event-draft", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    }),
};

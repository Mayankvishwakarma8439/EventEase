export const required = (value) => value !== undefined && value !== null && value !== "";

export const normalizeList = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const validateEventPayload = (body) => {
  const errors = [];
  const requiredFields = ["title", "description", "date", "time", "location", "capacity"];

  requiredFields.forEach((field) => {
    if (!required(body[field])) errors.push(`${field} is required`);
  });

  const capacity = Number(body.capacity);
  if (Number.isNaN(capacity) || capacity <= 0) errors.push("capacity must be greater than zero");

  const price = Number(body.price || 0);
  if (Number.isNaN(price) || price < 0) errors.push("price cannot be negative");

  const eventDate = new Date(body.date);
  if (Number.isNaN(eventDate.getTime())) errors.push("date must be valid");

  return { isValid: errors.length === 0, errors };
};

export const toEventPayload = (body, imageUrl) => ({
  title: String(body.title || "").trim(),
  description: String(body.description || "").trim(),
  category: body.category || "other",
  eventType: body.eventType || "in-person",
  status: body.status || "pending",
  date: new Date(body.date),
  time: String(body.time || "").trim(),
  location: String(body.location || "").trim(),
  venueDetails: String(body.venueDetails || "").trim(),
  capacity: Number(body.capacity),
  price: Number(body.price || 0),
  image: imageUrl || body.image || "",
  tags: normalizeList(body.tags),
  agenda: normalizeList(body.agenda),
  targetAudience: String(body.targetAudience || "").trim(),
  prerequisites: String(body.prerequisites || "").trim(),
});

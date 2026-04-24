import crypto from "crypto";
import Event from "../models/Event.js";

export const canManageEvent = (event, user) => {
  if (!event || !user) return false;
  return user.role === "admin" || event.createdBy.toString() === user._id.toString();
};

export const listVisibleEvents = async (user) => {
  const query = user?.role === "admin" ? {} : { status: { $in: ["approved", "completed"] } };
  return Event.find(query)
    .populate("createdBy", "username email role")
    .populate("attendees.user", "username email role")
    .sort({ date: 1, time: 1 });
};

export const listAdminEvents = async () =>
  Event.find()
    .populate("createdBy", "username email role")
    .populate("attendees.user", "username email role")
    .sort({ createdAt: -1 });

export const registerForEvent = async (event, user, payment = null) => {
  const userId = user._id || user;
  const activeAttendees = event.attendees.filter((attendee) => attendee.status !== "cancelled");
  const existing = event.attendees.find(
    (attendee) => attendee.user?.toString() === userId.toString()
  );

  if (event.status !== "approved") {
    throw new Error("Event is not open for registration");
  }

  if (existing && existing.status !== "cancelled") {
    throw new Error("User already registered");
  }

  if (event.capacity && activeAttendees.length >= event.capacity) {
    throw new Error("Event is full");
  }

  if (Number(event.price || 0) > 0 && payment?.status !== "succeeded") {
    throw new Error("Payment is required before registration");
  }

  if (existing) {
    existing.status = "registered";
    existing.ticketCode = existing.ticketCode || crypto.randomBytes(6).toString("hex").toUpperCase();
    existing.paymentStatus = Number(event.price || 0) > 0 ? "paid" : "not-required";
    existing.paymentId = payment?.id || existing.paymentId || "";
    existing.amountPaid = payment?.amount || existing.amountPaid || 0;
    existing.checkedInAt = undefined;
  } else {
    event.attendees.push({
      user: userId,
      ticketCode: crypto.randomBytes(6).toString("hex").toUpperCase(),
      status: "registered",
      paymentStatus: Number(event.price || 0) > 0 ? "paid" : "not-required",
      paymentId: payment?.id || "",
      amountPaid: payment?.amount || 0,
    });
  }

  await event.save();
  return event;
};

export const checkInAttendee = async (event, attendeeId) => {
  const attendee = event.attendees.find(
    (item) => item.user?.toString() === attendeeId.toString() && item.status !== "cancelled"
  );

  if (!attendee) throw new Error("Attendee is not registered");

  attendee.status = "checked-in";
  attendee.checkedInAt = new Date();
  await event.save();
  return event;
};

export const checkInByTicketCode = async (event, ticketCode) => {
  const attendee = event.attendees.find(
    (item) =>
      item.ticketCode?.toUpperCase() === String(ticketCode || "").trim().toUpperCase() &&
      item.status !== "cancelled"
  );

  if (!attendee) throw new Error("Ticket code not found");

  attendee.status = "checked-in";
  attendee.checkedInAt = new Date();
  await event.save();
  return event;
};

import Event from "../models/Event.js";
import mongoose from "mongoose";
import { formatEvent, getAttendeeUserId } from "../utils/eventFormatter.js";
import { toEventPayload, validateEventPayload } from "../utils/validators.js";
import {
  canManageEvent,
  checkInByTicketCode,
  checkInAttendee,
  listAdminEvents,
  listVisibleEvents,
  registerForEvent,
} from "../services/eventService.js";
import { sendApprovalEmail, sendRegistrationEmail } from "../services/emailService.js";
import { confirmPaymentIntent, createPaymentIntent } from "../services/paymentService.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getImageUrl = (req) => {
  if (!req.file) return "";
  return `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
};

export const getEvents = async (req, res) => {
  try {
    const events = await listVisibleEvents(req.user);
    return res.status(200).json({ success: true, events: events.map(formatEvent) });
  } catch (error) {
    console.error("getEvents error:", error);
    return res.status(500).json({ success: false, message: "Error fetching events" });
  }
};

export const getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    if (!isValidId(eventId)) {
      return res.status(400).json({ success: false, message: "Invalid event id" });
    }

    const event = await Event.findById(eventId)
      .populate("createdBy", "username email role")
      .populate("attendees.user", "username email role");

    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    const publicStatuses = ["approved", "completed"];
    if (!publicStatuses.includes(event.status) && !canManageEvent(event, req.user)) {
      return res.status(403).json({ success: false, message: "Not authorized to view event" });
    }

    return res.status(200).json({ success: true, event: formatEvent(event) });
  } catch (error) {
    console.error("getEventById error:", error);
    return res.status(500).json({ success: false, message: "Error fetching event" });
  }
};

export const createEvent = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const validation = validateEventPayload(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: validation.errors.join(", ") });
    }

    const payload = toEventPayload(req.body, getImageUrl(req));
    const newEvent = await Event.create({
      ...payload,
      status: req.user.role === "admin" ? payload.status || "approved" : "pending",
      organizer: req.user.username || req.user.email || "Organizer",
      createdBy: req.user._id,
      attendees: [],
    });

    return res.status(201).json({
      success: true,
      message:
        newEvent.status === "approved"
          ? "Event created"
          : "Event submitted for admin approval",
      event: formatEvent(newEvent),
    });
  } catch (error) {
    console.error("createEvent error:", error);
    return res.status(500).json({ success: false, message: "Error creating event" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    if (!isValidId(eventId)) {
      return res.status(400).json({ success: false, message: "Invalid event id" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    if (!canManageEvent(event, req.user)) {
      return res.status(403).json({ success: false, message: "Not authorized to update" });
    }

    const payload = toEventPayload(req.body, getImageUrl(req) || event.image);
    Object.assign(event, payload);
    if (req.user.role !== "admin" && event.status === "approved") event.status = "pending";
    if (req.user.role === "admin" && req.body.status) event.status = req.body.status;

    await event.save();
    return res.status(200).json({
      success: true,
      message: "Event updated",
      event: formatEvent(event),
    });
  } catch (error) {
    console.error("updateEvent error:", error);
    return res.status(500).json({ success: false, message: "Error updating event" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    if (!isValidId(eventId)) {
      return res.status(400).json({ success: false, message: "Invalid event id" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    if (!canManageEvent(event, req.user)) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this event" });
    }

    await Event.findByIdAndDelete(eventId);
    return res.status(200).json({ success: true, message: "Event deleted" });
  } catch (error) {
    console.error("deleteEvent error:", error);
    return res.status(500).json({ success: false, message: "Error deleting event" });
  }
};

export const approveEvent = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const event = await Event.findById(req.params.id).populate("createdBy", "username email role");
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    event.status = req.body.status || "approved";
    event.adminNotes = req.body.adminNotes || event.adminNotes;
    await event.save();
    if (event.status === "approved" && event.createdBy?.email) {
      await sendApprovalEmail({ user: event.createdBy, event });
    }

    return res.status(200).json({ success: true, message: "Event status updated", event: formatEvent(event) });
  } catch (error) {
    console.error("approveEvent error:", error);
    return res.status(500).json({ success: false, message: "Error updating approval" });
  }
};

export const registerEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    if (!isValidId(eventId)) {
      return res.status(400).json({ success: false, message: "Invalid event id" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    const payment =
      Number(event.price || 0) > 0
        ? confirmPaymentIntent({
            paymentIntentId: req.body.paymentIntentId,
            event,
            user: req.user,
            payment: req.body.payment,
          })
        : null;

    await registerForEvent(event, req.user, payment);
    const attendee = event.attendees.find(
      (item) => getAttendeeUserId(item) === req.user._id.toString() && item.status !== "cancelled"
    );
    const email = await sendRegistrationEmail({ user: req.user, event, attendee });
    attendee.confirmationEmailSentAt = new Date(email.sentAt);
    await event.save();

    return res.status(200).json({
      success: true,
      message: "Registered",
      event: formatEvent(event),
    });
  } catch (error) {
    console.error("registerEvent error:", error);
    return res.status(400).json({ success: false, message: error.message || "Error registering" });
  }
};

export const unregisterEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    if (!isValidId(eventId)) {
      return res.status(400).json({ success: false, message: "Invalid event id" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    const attendee = event.attendees.find(
      (item) => getAttendeeUserId(item) === req.user._id.toString() && item.status !== "cancelled"
    );
    if (!attendee) {
      return res.status(400).json({ success: false, message: "User not registered" });
    }

    attendee.status = "cancelled";
    await event.save();

    return res.status(200).json({
      success: true,
      message: "Unregistered",
      event: formatEvent(event),
    });
  } catch (error) {
    console.error("unregisterEvent error:", error);
    return res.status(500).json({ success: false, message: "Error unregistering" });
  }
};

export const checkInEventAttendee = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    if (!canManageEvent(event, req.user)) {
      return res.status(403).json({ success: false, message: "Not authorized to check in attendees" });
    }

    if (req.body.ticketCode) await checkInByTicketCode(event, req.body.ticketCode);
    else await checkInAttendee(event, req.body.userId);
    return res.status(200).json({ success: true, message: "Attendee checked in", event: formatEvent(event) });
  } catch (error) {
    console.error("checkInEventAttendee error:", error);
    return res.status(400).json({ success: false, message: error.message || "Error checking in attendee" });
  }
};

export const createEventPaymentIntent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    if (event.status !== "approved") {
      return res.status(400).json({ success: false, message: "Event is not open for payment" });
    }

    const paymentIntent = await createPaymentIntent({ event, user: req.user });
    return res.status(201).json({ success: true, paymentIntent });
  } catch (error) {
    console.error("createEventPaymentIntent error:", error);
    return res.status(500).json({ success: false, message: "Error creating payment" });
  }
};

export const getAdminEvents = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const events = await listAdminEvents();
    return res.status(200).json({ success: true, events: events.map(formatEvent) });
  } catch (error) {
    console.error("getAdminEvents error:", error);
    return res.status(500).json({ success: false, message: "Error fetching admin events" });
  }
};

export const addFeedback = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    const attendee = event.attendees.find(
      (item) => getAttendeeUserId(item) === req.user._id.toString() && item.status === "checked-in"
    );
    if (!attendee) {
      return res.status(403).json({ success: false, message: "Only checked-in attendees can leave feedback" });
    }

    event.feedback = event.feedback.filter(
      (item) => item.user?.toString() !== req.user._id.toString()
    );
    event.feedback.push({
      user: req.user._id,
      rating: Number(req.body.rating),
      comment: req.body.comment || "",
    });
    await event.save();

    return res.status(200).json({ success: true, message: "Feedback saved", event: formatEvent(event) });
  } catch (error) {
    console.error("addFeedback error:", error);
    return res.status(500).json({ success: false, message: "Error saving feedback" });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id })
      .populate("attendees.user", "username email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, events: events.map(formatEvent) });
  } catch (error) {
    console.error("getMyEvents error:", error);
    return res.status(500).json({ success: false, message: "Error fetching my events" });
  }
};

export const getMyRegistrations = async (req, res) => {
  try {
    const events = await Event.find({
      attendees: { $elemMatch: { user: req.user._id, status: { $ne: "cancelled" } } },
    })
      .populate("createdBy", "username email role")
      .populate("attendees.user", "username email role")
      .sort({ date: 1 });

    return res.status(200).json({ success: true, events: events.map(formatEvent) });
  } catch (error) {
    console.error("getMyRegistrations error:", error);
    return res.status(500).json({ success: false, message: "Error fetching registrations" });
  }
};

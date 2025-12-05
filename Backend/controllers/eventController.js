import Event from "../models/Event.js";
import mongoose from "mongoose";

const formatEvent = (evDoc) => {
  const ev = evDoc.toObject ? evDoc.toObject() : evDoc;
  return {
    id: ev._id.toString(),
    title: ev.title,
    description: ev.description,
    date: ev.date,
    time: ev.time,
    location: ev.location,
    capacity: ev.capacity,
    registered: Array.isArray(ev.attendees)
      ? ev.attendees.length
      : ev.registered || 0,
    image: ev.image || "",
    organizer:
      ev.organizer || (ev.createdBy && ev.createdBy.name) || "Organizer",
    createdBy: ev.createdBy,
    attendees: ev.attendees || [],
    createdAt: ev.createdAt,
    updatedAt: ev.updatedAt,
  };
};
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("createdBy", "name email")
      .populate("attendees", "name email")
      .sort({ date: 1, time: 1 });

    const formatted = events.map(formatEvent);
    return res.status(200).json({ success: true, events: formatted });
  } catch (error) {
    console.error("getEvents error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching events" });
  }
};
export const getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event id" });
    }

    const event = await Event.findById(eventId)
      .populate("createdBy", "name email")
      .populate("attendees", "name email");

    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    return res.status(200).json({ success: true, event: formatEvent(event) });
  } catch (error) {
    console.error("getEventById error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching event" });
  }
};
export const createEvent = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { title, description, date, time, location, capacity } = req.body;

    if (!title || !description || !date || !time || !location || !capacity) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    let imageUrl = "";
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
    }

    const newEvent = await Event.create({
      title: title.trim(),
      description: description.trim(),
      date: date.toString(),
      time: time.toString(),
      location: location.trim(),
      capacity: Number(capacity),
      image: imageUrl,
      organizer:
        req.user.username || req.user.name || req.user.email || "Organizer",
      createdBy: userId,
      attendees: [],
    });
    return res.status(201).json({
      success: true,
      message: "Event created",
      event: formatEvent(newEvent),
    });
  } catch (error) {
    console.error("createEvent error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error creating event" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user && req.user._id;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event id" });
    }

    const event = await Event.findById(eventId);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    if (event.createdBy.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to update" });
    }

    const allowed = [
      "title",
      "description",
      "date",
      "time",
      "location",
      "capacity",
      "image",
      "organizer",
    ];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) event[k] = req.body[k];
    });

    await event.save();
    return res.status(200).json({
      success: true,
      message: "Event updated",
      event: formatEvent(event),
    });
  } catch (error) {
    console.error("updateEvent error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error updating event" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user && req.user._id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event id" });
    }

    const event = await Event.findById(eventId);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    if (event.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this event",
      });
    }

    await Event.findByIdAndDelete(eventId);
    return res.status(200).json({ success: true, message: "Event deleted" });
  } catch (error) {
    console.error("deleteEvent error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting event" });
  }
};

export const registerEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user && req.user._id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event id" });
    }

    const event = await Event.findById(eventId);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    if (event.attendees.some((a) => a.toString() === userId.toString())) {
      return res
        .status(400)
        .json({ success: false, message: "User already registered" });
    }

    if (event.capacity && event.attendees.length >= event.capacity) {
      return res.status(400).json({ success: false, message: "Event is full" });
    }

    event.attendees.push(userId);
    await event.save();

    return res.status(200).json({
      success: true,
      message: "Registered",
      event: formatEvent(event),
    });
  } catch (error) {
    console.error("registerEvent error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error registering" });
  }
};

export const unregisterEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user && req.user._id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event id" });
    }

    const event = await Event.findById(eventId);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    const idx = event.attendees.findIndex(
      (a) => a.toString() === userId.toString()
    );
    if (idx === -1) {
      return res
        .status(400)
        .json({ success: false, message: "User not registered" });
    }

    event.attendees.splice(idx, 1);
    await event.save();

    return res.status(200).json({
      success: true,
      message: "Unregistered",
      event: formatEvent(event),
    });
  } catch (error) {
    console.error("unregisterEvent error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error unregistering" });
  }
};
export const getMyEvents = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const events = await Event.find({ createdBy: userId }).sort({
      createdAt: -1,
    });
    const formatted = events.map(formatEvent);
    return res.status(200).json({ success: true, events: formatted });
  } catch (error) {
    console.error("getMyEvents error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching my events" });
  }
};

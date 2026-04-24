import express from "express";
import {
  addFeedback,
  approveEvent,
  checkInEventAttendee,
  createEventPaymentIntent,
  createEvent,
  deleteEvent,
  getAdminEvents,
  getEventById,
  getEvents,
  getMyEvents,
  getMyRegistrations,
  registerEvent,
  unregisterEvent,
  updateEvent,
} from "../controllers/eventController.js";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/events", optionalAuthMiddleware, getEvents);
router.get("/admin/events", authMiddleware, getAdminEvents);
router.post("/register-event/:id", authMiddleware, registerEvent);
router.post("/events/:id/payment-intent", authMiddleware, createEventPaymentIntent);
router.post(
  "/create-event",
  authMiddleware,
  upload.single("image"),
  createEvent
);
router.delete("/events/:id", authMiddleware, deleteEvent);
router.get("/event/:id", optionalAuthMiddleware, getEventById);
router.put("/update-event/:id", authMiddleware, upload.single("image"), updateEvent);
router.get("/my-events", authMiddleware, getMyEvents);
router.get("/my-registrations", authMiddleware, getMyRegistrations);
router.post("/unregister-event/:id", authMiddleware, unregisterEvent);
router.patch("/events/:id/approval", authMiddleware, approveEvent);
router.post("/events/:id/check-in", authMiddleware, checkInEventAttendee);
router.post("/events/:id/feedback", authMiddleware, addFeedback);

export default router;

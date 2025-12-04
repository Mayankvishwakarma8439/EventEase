import express from "express";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  getMyEvents,
  registerEvent,
  unregisterEvent,
  updateEvent,
} from "../controllers/eventController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

//TODO NOW:
router.get("/events", getEvents);
router.post("/register-event/:id", authMiddleware, registerEvent);
router.post("/create-event", authMiddleware, createEvent);
router.delete("/events/:id", authMiddleware, deleteEvent);

//TODO LATER:
router.get("/event/:id", authMiddleware, getEventById);
router.put("/update-event/:id", authMiddleware, updateEvent);
router.get("/my-events", authMiddleware, getMyEvents);
router.post("/unregister-event/:id", authMiddleware, unregisterEvent);

export default router;

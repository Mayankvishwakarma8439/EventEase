import express from "express";
import { generateEventDraftController } from "../controllers/aiController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/event-draft", authMiddleware, generateEventDraftController);

export default router;

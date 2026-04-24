import express from "express";
import { getAdminOverview } from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/overview", authMiddleware, getAdminOverview);

export default router;

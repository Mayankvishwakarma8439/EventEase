import express from "express";
import { updateUserRole } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.patch("/:id/role", authMiddleware, updateUserRole);

export default router;

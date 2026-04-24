import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import connectDb from "./utility/db.js";
import { env, validateEnv } from "./config/env.js";
dotenv.config();
validateEnv();

const app = express();
const PORT = env.port;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

connectDb();
app.use("/api/auth", authRoutes);
app.use("/api/", eventRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

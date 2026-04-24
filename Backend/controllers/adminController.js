import User from "../models/User.js";
import { getEmailOutbox } from "../services/emailService.js";
import { listPaymentIntents } from "../services/paymentService.js";

export const getAdminOverview = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const users = await User.find().select("username email role department createdAt").sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      users,
      emails: getEmailOutbox(),
      payments: listPaymentIntents(),
    });
  } catch (error) {
    console.error("getAdminOverview error:", error);
    return res.status(500).json({ success: false, message: "Error fetching admin overview" });
  }
};

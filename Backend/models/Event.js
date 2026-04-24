import mongoose from "mongoose";

const attendeeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["registered", "checked-in", "cancelled"],
      default: "registered",
    },
    ticketCode: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["not-required", "pending", "paid", "refunded"],
      default: "not-required",
    },
    paymentId: { type: String, default: "" },
    amountPaid: { type: Number, default: 0 },
    confirmationEmailSentAt: { type: Date },
    checkedInAt: { type: Date },
  },
  { _id: false, timestamps: true }
);

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["technology", "cultural", "sports", "workshop", "seminar", "networking", "other"],
      default: "other",
    },
    eventType: {
      type: String,
      enum: ["in-person", "online", "hybrid"],
      default: "in-person",
    },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "completed", "cancelled"],
      default: "pending",
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    venueDetails: { type: String, default: "" },
    capacity: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    image: { type: String, default: "" },
    organizer: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    agenda: [{ type: String, trim: true }],
    targetAudience: { type: String, default: "" },
    prerequisites: { type: String, default: "" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attendees: [attendeeSchema],
    feedback: [feedbackSchema],
    aiSummary: { type: String, default: "" },
    adminNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

EventSchema.index({ title: "text", description: "text", tags: "text", location: "text" });
EventSchema.index({ status: 1, date: 1, category: 1 });

const Event = mongoose.model("Events", EventSchema);
export default Event;

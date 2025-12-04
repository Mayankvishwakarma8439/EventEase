import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, default: 0 },
    image: { type: String, default: "" },
    organizer: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Event = mongoose.model("Events", EventSchema);
export default Event;

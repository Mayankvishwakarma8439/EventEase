export const getAttendeeUserId = (attendee) => {
  if (!attendee) return "";
  if (attendee.user) return attendee.user._id?.toString() || attendee.user.toString();
  return attendee._id?.toString() || attendee.toString();
};

export const formatEvent = (evDoc) => {
  const ev = evDoc.toObject ? evDoc.toObject() : evDoc;
  const attendees = Array.isArray(ev.attendees) ? ev.attendees : [];
  const activeAttendees = attendees.filter((attendee) => attendee.status !== "cancelled");
  const checkedInCount = activeAttendees.filter(
    (attendee) => attendee.status === "checked-in"
  ).length;
  const feedback = Array.isArray(ev.feedback) ? ev.feedback : [];
  const averageRating =
    feedback.length === 0
      ? 0
      : Number(
          (
            feedback.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
            feedback.length
          ).toFixed(1)
        );

  return {
    id: ev._id.toString(),
    title: ev.title,
    description: ev.description,
    category: ev.category || "other",
    eventType: ev.eventType || "in-person",
    status: ev.status || "pending",
    date: ev.date,
    time: ev.time,
    location: ev.location,
    venueDetails: ev.venueDetails || "",
    capacity: ev.capacity,
    price: ev.price || 0,
    registered: activeAttendees.length,
    checkedIn: checkedInCount,
    image: ev.image || "",
    organizer: ev.organizer || ev.createdBy?.username || "Organizer",
    tags: ev.tags || [],
    agenda: ev.agenda || [],
    targetAudience: ev.targetAudience || "",
    prerequisites: ev.prerequisites || "",
    createdBy: ev.createdBy,
    attendees,
    feedback,
    averageRating,
    aiSummary: ev.aiSummary || "",
    adminNotes: ev.adminNotes || "",
    createdAt: ev.createdAt,
    updatedAt: ev.updatedAt,
  };
};

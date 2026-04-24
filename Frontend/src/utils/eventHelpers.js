export const formatEventDate = (date) => {
  if (!date) return "Date TBD";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

export const getUserId = (user) => user?.id || user?._id;

export const isUserRegistered = (event, user) => {
  const userId = getUserId(user);
  if (!userId) return false;
  return event.attendees?.some((attendee) => {
    const attendeeId = attendee.user?._id || attendee.user || attendee._id || attendee;
    return attendeeId === userId && attendee.status !== "cancelled";
  });
};

export const buildEventFormData = (eventData) => {
  const form = new FormData();
  Object.entries(eventData).forEach(([key, value]) => {
    if (key === "image" && !value) return;
    form.append(key, value);
  });
  return form;
};

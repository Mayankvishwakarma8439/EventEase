import test from "node:test";
import assert from "node:assert/strict";
import { formatEvent } from "../utils/eventFormatter.js";

test("formatEvent calculates registration, check-in, and rating metrics", () => {
  const event = {
    _id: { toString: () => "event1" },
    title: "Demo",
    description: "Demo event",
    date: new Date("2026-05-01"),
    time: "10:00",
    location: "Hall",
    capacity: 10,
    organizer: "Org",
    attendees: [
      { user: "u1", status: "registered" },
      { user: "u2", status: "checked-in" },
      { user: "u3", status: "cancelled" },
    ],
    feedback: [
      { rating: 4 },
      { rating: 5 },
    ],
  };

  const formatted = formatEvent(event);

  assert.equal(formatted.registered, 2);
  assert.equal(formatted.checkedIn, 1);
  assert.equal(formatted.averageRating, 4.5);
});

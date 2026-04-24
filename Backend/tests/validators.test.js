import test from "node:test";
import assert from "node:assert/strict";
import { normalizeList, validateEventPayload } from "../utils/validators.js";

test("validateEventPayload accepts a complete event", () => {
  const result = validateEventPayload({
    title: "React Lab",
    description: "Hands-on workshop",
    date: "2026-05-01",
    time: "10:00",
    location: "Auditorium",
    capacity: "50",
    price: "0",
  });

  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, []);
});

test("validateEventPayload rejects missing and invalid values", () => {
  const result = validateEventPayload({
    title: "",
    description: "x",
    date: "bad-date",
    time: "",
    location: "",
    capacity: "0",
    price: "-5",
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors.join(" "), /title is required/);
  assert.match(result.errors.join(" "), /capacity must be greater than zero/);
  assert.match(result.errors.join(" "), /price cannot be negative/);
});

test("normalizeList handles arrays and comma separated text", () => {
  assert.deepEqual(normalizeList("ai, react, , campus"), ["ai", "react", "campus"]);
  assert.deepEqual(normalizeList([" ai ", "", "events"]), ["ai", "events"]);
});

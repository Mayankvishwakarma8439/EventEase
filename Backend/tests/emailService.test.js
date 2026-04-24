import test from "node:test";
import assert from "node:assert/strict";
import { getEmailOutbox, sendEmail } from "../services/emailService.js";

test("sendEmail records a local outbox message", async () => {
  const before = getEmailOutbox().length;
  const message = await sendEmail({
    to: "student@example.com",
    subject: "Ticket confirmed",
    body: "Your ticket is ready",
  });

  assert.equal(message.to, "student@example.com");
  assert.equal(getEmailOutbox().length, before + 1);
});

import test from "node:test";
import assert from "node:assert/strict";
import { confirmPaymentIntent, createPaymentIntent } from "../services/paymentService.js";

const event = { _id: { toString: () => "event1" }, price: 499 };
const user = { _id: { toString: () => "user1" } };

test("mock payment intent can be created and confirmed", async () => {
  const intent = await createPaymentIntent({ event, user });

  assert.equal(intent.amount, 499);
  assert.equal(intent.status, "requires_confirmation");

  const confirmed = confirmPaymentIntent({ paymentIntentId: intent.id, event, user });

  assert.equal(confirmed.status, "succeeded");
  assert.equal(confirmed.id, intent.id);
});

test("free events do not require payment", async () => {
  const freeIntent = await createPaymentIntent({ event: { ...event, price: 0 }, user });

  assert.equal(freeIntent.amount, 0);
  assert.equal(freeIntent.status, "not-required");
});

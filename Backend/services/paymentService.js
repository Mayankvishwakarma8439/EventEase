import crypto from "crypto";
import { env } from "../config/env.js";

const paymentIntents = new Map();

export const createPaymentIntent = async ({ event, user }) => {
  if (Number(event.price || 0) <= 0) {
    return {
      id: `free_${crypto.randomBytes(6).toString("hex")}`,
      amount: 0,
      currency: "INR",
      status: "not-required",
    };
  }

  if (
    env.paymentProvider === "razorpay" &&
    env.razorpayKeyId &&
    env.razorpayKeySecret
  ) {
    const auth = Buffer.from(
      `${env.razorpayKeyId}:${env.razorpayKeySecret}`
    ).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(Number(event.price) * 100),
        currency: "INR",
        receipt: `evt_${event._id}_${user._id}`,
        notes: {
          eventId: event._id.toString(),
          userId: user._id.toString(),
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Razorpay order creation failed: ${text}`);
    }

    const order = await response.json();
    return {
      id: order.id,
      amount: Number(event.price),
      currency: order.currency,
      status: "created",
      provider: "razorpay",
      keyId: env.razorpayKeyId,
    };
  }

  const intent = {
    id: `pay_${crypto.randomBytes(10).toString("hex")}`,
    eventId: event._id.toString(),
    userId: user._id.toString(),
    amount: Number(event.price),
    currency: "INR",
    status: "requires_confirmation",
    provider: process.env.PAYMENT_PROVIDER || "mock",
    createdAt: new Date().toISOString(),
  };

  paymentIntents.set(intent.id, intent);
  return intent;
};

export const confirmPaymentIntent = ({ paymentIntentId, event, user, payment = null }) => {
  if (Number(event.price || 0) <= 0) {
    return {
      id: paymentIntentId || `free_${crypto.randomBytes(6).toString("hex")}`,
      amount: 0,
      status: "not-required",
    };
  }

  if (
    env.paymentProvider === "razorpay" &&
    env.razorpayKeyId &&
    env.razorpayKeySecret
  ) {
    const orderId = payment?.razorpay_order_id;
    const paymentId = payment?.razorpay_payment_id;
    const signature = payment?.razorpay_signature;

    if (!orderId || !paymentId || !signature) {
      throw new Error("Missing Razorpay payment verification fields");
    }

    const expected = crypto
      .createHmac("sha256", env.razorpayKeySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expected !== signature) {
      throw new Error("Invalid Razorpay signature");
    }

    const verifiedIntent = {
      id: paymentId,
      amount: Number(event.price),
      status: "succeeded",
      provider: "razorpay",
      orderId,
      confirmedAt: new Date().toISOString(),
    };

    paymentIntents.set(paymentId, verifiedIntent);
    return verifiedIntent;
  }

  const intent = paymentIntents.get(paymentIntentId);
  if (!intent) throw new Error("Payment intent not found");
  if (intent.eventId !== event._id.toString() || intent.userId !== user._id.toString()) {
    throw new Error("Payment intent does not match this event or user");
  }

  intent.status = "succeeded";
  intent.confirmedAt = new Date().toISOString();
  paymentIntents.set(intent.id, intent);
  return intent;
};

export const listPaymentIntents = () => Array.from(paymentIntents.values()).reverse();

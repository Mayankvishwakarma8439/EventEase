import { env } from "../config/env.js";
import nodemailer from "nodemailer";

const outbox = [];
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!env.gmailUser || !env.gmailAppPassword) return null;

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.gmailUser,
      pass: env.gmailAppPassword,
    },
  });

  return transporter;
};

export const sendEmail = async ({ to, subject, body, type = "general" }) => {
  const message = {
    id: `email_${Date.now()}_${Math.round(Math.random() * 1e6)}`,
    to,
    subject,
    body,
    type,
    provider: env.emailProvider || "local-outbox",
    sentAt: new Date().toISOString(),
  };

  if (env.emailProvider === "gmail") {
    try {
      const smtp = getTransporter();
      if (!smtp) {
        throw new Error("Missing Gmail SMTP credentials");
      }

      const payload = await smtp.sendMail({
        from: env.emailFrom,
        to,
        subject,
        text: body,
      });

      message.provider = "gmail";
      message.providerId = payload.messageId || "";
    } catch (error) {
      console.error("Gmail email failed, falling back to outbox:", error);
    }
  }

  outbox.unshift(message);
  console.log(`[email:${message.provider}] ${subject} -> ${to}`);
  return message;
};

export const sendRegistrationEmail = async ({ user, event, attendee }) =>
  sendEmail({
    to: user.email,
    type: "registration-confirmation",
    subject: `Registration confirmed: ${event.title}`,
    body: `Hi ${user.username}, your registration for ${event.title} is confirmed. Ticket code: ${attendee.ticketCode}.`,
  });

export const sendApprovalEmail = async ({ user, event }) =>
  sendEmail({
    to: user.email,
    type: "event-approval",
    subject: `Event approved: ${event.title}`,
    body: `Your event "${event.title}" is now approved and visible to attendees.`,
  });

export const getEmailOutbox = () => outbox;

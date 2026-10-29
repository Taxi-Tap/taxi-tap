// Sends transactional email (verification links, reset links, 2FA codes).
// Uses Resend's HTTP API when RESEND_API_KEY is set. Without a provider nothing is
// sent: the message is handed back to the screen through withCapturedEmails() and
// shown in a popup instead (demo mode), and is also printed in the dev console.

import { AsyncLocalStorage } from "node:async_hooks";

export type CapturedEmail = { subject: string; text: string };
const capture = new AsyncLocalStorage<CapturedEmail[]>();

/** Run an auth call and collect any emails it would have sent. Only used when no provider is set. */
export async function withCapturedEmails<T>(fn: () => Promise<T>) {
  const messages: CapturedEmail[] = [];
  const result = await capture.run(messages, fn);
  return { result, messages };
}

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? "Taxi Tap <onboarding@resend.dev>";

/** True when a real email provider is configured. */
export const emailConfigured = Boolean(apiKey);

export async function sendEmail(message: { to: string; subject: string; text: string }) {
  if (!apiKey) {
    capture.getStore()?.push({ subject: message.subject, text: message.text });
    if (process.env.NODE_ENV !== "production") {
      console.log(`[email] to ${message.to} · ${message.subject}\n${message.text}`);
    }
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: message.to, subject: message.subject, text: message.text }),
  });
  if (!res.ok) {
    console.error("[email] send failed", res.status, await res.text());
    throw new Error("Could not send email");
  }
}

// Sends transactional email (verification links, reset links, 2FA codes).
// Uses Resend's HTTP API when RESEND_API_KEY is set. Without it nothing is sent:
// in development the message is printed to the server console so the flow can
// still be tested; in production it is dropped and sign-up does not require
// verified email (see `emailConfigured` below).

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? "Taxi Tap <onboarding@resend.dev>";

/** True when a real email provider is configured. */
export const emailConfigured = Boolean(apiKey);

export async function sendEmail(message: { to: string; subject: string; text: string }) {
  if (!apiKey) {
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

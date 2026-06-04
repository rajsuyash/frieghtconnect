// Provider-agnostic email. Dev logs to the console; production sends via Resend
// (wired at ship). Callers always `await sendEmail(...)`.

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

async function sendViaResend(msg: EmailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Global Trade Collective <noreply@freightconnect.example>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: msg.to, subject: msg.subject, text: msg.text }),
  });
  if (!res.ok) {
    throw new Error(`Resend send failed: ${res.status}`);
  }
}

export async function sendEmail(msg: EmailMessage): Promise<void> {
  if (process.env.RESEND_API_KEY) {
    await sendViaResend(msg);
    return;
  }
  // Dev fallback — surface the message (and any links) in the server log.
  console.info(
    `\n[email:dev] to=${msg.to} subject="${msg.subject}"\n${msg.text}\n`,
  );
}

export function appBaseUrl(): string {
  return process.env.APP_URL || "http://localhost:3000";
}

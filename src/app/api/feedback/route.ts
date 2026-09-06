import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body.message !== "string") {
    return NextResponse.json({ error: "Feedback message is required." }, { status: 400 });
  }

  const message = body.message.trim();
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!message) {
    return NextResponse.json({ error: "Feedback message is required." }, { status: 400 });
  }

  try {
    await sendEmail({
      to: "hello@fourthapp.co",
      subject: "New feedback on Fourth",
      html: `
        <p><strong>Feedback:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
        ${email ? `<p><strong>From:</strong> ${escapeHtml(email)}</p>` : "<p><em>No reply email given.</em></p>"}
      `,
    });
  } catch {
    return NextResponse.json({ error: "Could not send feedback. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

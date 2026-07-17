import { NextResponse } from "next/server";

type Inquiry = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  context?: string;
  company?: string;
};

export async function POST(request: Request) {
  let body: Inquiry;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.company) return NextResponse.json({ ok: true });

  const name = body.name?.trim();
  const email = body.email?.trim();
  const message = body.message?.trim();
  if (!name || !email || !message || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Name, valid email, and message are required." }, { status: 400 });
  }
  if (name.length > 120 || email.length > 200 || message.length > 5000) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO_EMAIL;
  const from = process.env.INQUIRY_FROM_EMAIL ?? "Jewel Stone <inquiries@jewelstonenyc.com>";
  if (!apiKey || !to) {
    return NextResponse.json(
      { error: "Online delivery is being configured. Please email or call us directly." },
      { status: 503 },
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `Jewel Stone inquiry · ${body.context?.trim() || "Website"}`,
      text: [`Name: ${name}`, `Email: ${email}`, `Phone: ${body.phone?.trim() || "—"}`, "", message].join("\n"),
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Message could not be delivered. Please try again or contact us directly." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

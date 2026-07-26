import { NextResponse } from "next/server";
import { saveAppointment } from "@/lib/admin/leads";

export const runtime = "nodejs";

type Appointment = {
  name?: string;
  email?: string;
  phone?: string;
  date?: string;
  time?: string;
  interest?: string;
  notes?: string;
  company?: string; // honeypot
};

export async function POST(request: Request) {
  let body: Appointment;
  try {
    body = (await request.json()) as Appointment;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.company) return NextResponse.json({ ok: true }); // bot trap

  const name = body.name?.trim();
  const email = body.email?.trim();
  const phone = body.phone?.trim() ?? "";
  const date = body.date?.trim() ?? "";
  const time = body.time?.trim() ?? "";
  const interest = (body.interest?.trim() || "General appointment").slice(0, 120);
  const notes = body.notes?.trim() ?? "";

  if (!name || !email || !/^\S+@\S+\.\S+$/.test(email) || !date) {
    return NextResponse.json({ error: "Name, valid email, and a preferred date are required." }, { status: 400 });
  }
  if (name.length > 120 || email.length > 200 || phone.length > 80 || notes.length > 3000) {
    return NextResponse.json({ error: "One of the fields is too long." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO_EMAIL ?? "ishan@thejewelstone.com";
  const from = process.env.INQUIRY_FROM_EMAIL ?? "Jewel Stone <onboarding@resend.dev>";
  if (!apiKey) {
    return NextResponse.json(
      { error: "Online booking is being configured. Please call or email us to book directly." },
      { status: 503 },
    );
  }

  await saveAppointment({
    name,
    email,
    phone,
    requestedDate: date,
    requestedTime: time,
    interest,
    notes,
  }).catch((error) => console.error("appointment admin record failed", error));

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `Appointment request · ${name} · ${date}${time ? ` ${time}` : ""}`,
      text: [
        "New appointment request from thejewelstone.com",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "—"}`,
        `Preferred date: ${date}`,
        `Preferred time: ${time || "—"}`,
        `Interested in: ${interest}`,
        "",
        `Notes: ${notes || "—"}`,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Resend appointment error", response.status, detail);
    let reason = "Could not send the request. Please try again or call us.";
    try {
      const parsed = JSON.parse(detail) as { message?: string };
      if (parsed.message) reason = parsed.message;
    } catch {}
    return NextResponse.json({ error: reason }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

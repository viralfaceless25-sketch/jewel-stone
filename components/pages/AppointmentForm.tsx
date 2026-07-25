"use client";

import { useState } from "react";
import styles from "./enquiry.module.css";

const INTERESTS = [
  "Engagement ring",
  "Wedding band",
  "Natural PIECUT",
  "Lab-grown diamond",
  "Loose diamond",
  "Custom design",
  "Just browsing",
] as const;

export function AppointmentForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  if (status === "sent") {
    return (
      <div className={styles.sent}>
        <div className={styles.check}>✓</div>
        <h3>Appointment requested.</h3>
        <p>Thank you — Ishan will confirm your time by email or phone, usually the same day.</p>
      </div>
    );
  }

  return (
    <form
      className={styles.form}
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus("sending");
        setError("");
        const form = new FormData(e.currentTarget);
        const response = await fetch("/api/appointment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(form.entries())),
        });
        const result = await response.json().catch(() => ({}));
        if (response.ok) setStatus("sent");
        else { setError(result.error || "Could not send the request."); setStatus("error"); }
      }}
    >
      <label className={styles.honeypot} htmlFor="appt-company" aria-hidden="true">Company<input id="appt-company" name="company" tabIndex={-1} autoComplete="off" /></label>
      <div className={styles.row}>
        <label htmlFor="appt-name">Name<input id="appt-name" required name="name" autoComplete="name" /></label>
        <label htmlFor="appt-email">Email<input id="appt-email" required name="email" type="email" autoComplete="email" /></label>
      </div>
      <label htmlFor="appt-phone">Phone <span>(optional)</span><input id="appt-phone" name="phone" type="tel" autoComplete="tel" /></label>
      <div className={styles.row}>
        <label htmlFor="appt-date">Preferred date<input id="appt-date" required name="date" type="date" min={today} /></label>
        <label htmlFor="appt-time">Preferred time <span>(optional)</span><input id="appt-time" name="time" type="time" /></label>
      </div>
      <label htmlFor="appt-interest">Interested in
        <select id="appt-interest" name="interest" defaultValue={INTERESTS[0]}>
          {INTERESTS.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </label>
      <label htmlFor="appt-notes">Anything else? <span>(optional)</span><textarea id="appt-notes" name="notes" rows={4} placeholder="A stone, a reference, a budget, an occasion…" /></label>
      <button type="submit" className={styles.submit} disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Request appointment"}</button>
      {status === "error" ? <p className={styles.error} role="alert" aria-live="assertive">{error}</p> : null}
      <p className={styles.note}>◆ By appointment · 62 W 47th St, Suite 505 · Mon–Sat</p>
    </form>
  );
}

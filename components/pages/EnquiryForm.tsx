"use client";

import { useState } from "react";
import styles from "./enquiry.module.css";

export function EnquiryForm({ context = "General enquiry", initialMessage = "" }: { context?: string; initialMessage?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  if (status === "sent") {
    return (
      <div className={styles.sent}>
        <div className={styles.check}>✓</div>
        <h3>Message received.</h3>
        <p>Thank you — we&apos;ll reply within one business day, often the same day.</p>
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
        const response = await fetch("/api/inquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(form.entries())),
        });
        const result = await response.json().catch(() => ({}));
        if (response.ok) setStatus("sent");
        else { setError(result.error || "Message could not be delivered."); setStatus("error"); }
      }}
    >
      <input type="hidden" name="context" value={context} readOnly />
      <label className={styles.honeypot} aria-hidden="true">Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
      <div className={styles.row}>
        <label>Name<input required name="name" autoComplete="name" /></label>
        <label>Email<input required name="email" type="email" autoComplete="email" /></label>
      </div>
      <label>Phone <span>(optional)</span><input name="phone" type="tel" autoComplete="tel" /></label>
      <label>How can we help?<textarea required name="message" rows={6} defaultValue={initialMessage} placeholder="Tell us about the piece, stone, occasion, or timeline…" /></label>
      <button type="submit" className={styles.submit} disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send message"}</button>
      {status === "error" ? <p className={styles.error} role="alert">{error}</p> : null}
      <p className={styles.note}>◆ We never share your details · reply within 1 business day</p>
    </form>
  );
}

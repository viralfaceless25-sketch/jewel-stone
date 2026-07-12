"use client";

import { useState } from "react";
import styles from "./enquiry.module.css";

export function EnquiryForm({ context = "General enquiry" }: { context?: string }) {
  const [sent, setSent] = useState(false);

  if (sent) {
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
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <input type="hidden" value={context} readOnly />
      <div className={styles.row}>
        <label>Name<input required autoComplete="name" /></label>
        <label>Email<input required type="email" autoComplete="email" /></label>
      </div>
      <label>Phone <span>(optional)</span><input type="tel" autoComplete="tel" /></label>
      <label>How can we help?<textarea required rows={4} placeholder="Tell us about the piece, stone, occasion, or timeline…" /></label>
      <button type="submit" className={styles.submit}>Send message</button>
      <p className={styles.note}>◆ We never share your details · reply within 1 business day</p>
    </form>
  );
}

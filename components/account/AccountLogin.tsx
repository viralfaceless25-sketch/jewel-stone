"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/components/pages/enquiry.module.css";

export function AccountLogin() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [error, setError] = useState("");

  return (
    <form
      className={styles.form}
      onSubmit={async (event) => {
        event.preventDefault();
        setStatus("working");
        setError("");
        const form = new FormData(event.currentTarget);
        try {
          const response = await fetch("/api/account/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: String(form.get("identifier") ?? ""),
              password: String(form.get("password") ?? ""),
            }),
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(result.error || "Could not sign you in.");
          router.push("/account");
          router.refresh();
        } catch (loginError) {
          setError(loginError instanceof Error ? loginError.message : "Could not sign you in.");
          setStatus("error");
        }
      }}
    >
      <label htmlFor="account-identifier">
        E-mail or mobile
        <input id="account-identifier" name="identifier" required autoComplete="username" placeholder="you@company.com" />
      </label>
      <label htmlFor="account-password">
        Password
        <input id="account-password" name="password" type="password" required autoComplete="current-password" />
      </label>
      <button type="submit" className={styles.submit} disabled={status === "working"}>
        {status === "working" ? "Signing in…" : "Sign in"}
      </button>
      {error ? <p className={styles.error} role="alert" aria-live="assertive">{error}</p> : null}
      <p className={styles.note}>
        ◆ Accounts are issued by Jewel Stone. Need access? Call +1 551-341-3256.
      </p>
    </form>
  );
}

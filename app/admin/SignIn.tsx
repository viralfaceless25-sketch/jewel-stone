"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import styles from "./admin.module.css";

export function SignIn({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Could not sign in.");
      router.replace("/admin");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign in.");
      setPassword("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.authScreen}>
      <section className={styles.authCard}>
        <h1 className={styles.authMark}>Jewel Stone</h1>
        <p className={styles.authSub}>Private owner panel</p>
        {!configured ? (
          <div className={`${styles.notice} ${styles.noticeWarn}`}>
            Admin access is closed until <strong>ADMIN_PASSWORD</strong> is configured.
          </div>
        ) : (
          <form className={styles.authForm} onSubmit={submit}>
            <label className={styles.field}>
              <span className={styles.label}>Password</span>
              <input
                className={styles.input}
                type="password"
                autoComplete="current-password"
                autoFocus
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {error ? <p className={`${styles.notice} ${styles.noticeError}`} role="alert">{error}</p> : null}
            <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit" disabled={busy || !password}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}
        <p className={styles.authFoot}>
          This panel controls inventory, orders, customer records, invoices, and memos.
        </p>
      </section>
    </div>
  );
}


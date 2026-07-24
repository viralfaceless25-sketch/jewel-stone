"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import styles from "./custom.module.css";

const STEPS = [
  { key: "type", label: "Piece", question: "What are we making?", options: ["Engagement ring", "Wedding band", "Pendant", "Earrings", "Bracelet", "Necklace"] },
  { key: "metal", label: "Metal", question: "Which metal?", options: ["Rose gold", "Yellow gold", "White gold", "Platinum", "Sterling silver"] },
  { key: "shape", label: "Stone", question: "Choose a stone shape.", options: ["Round", "Oval", "Cushion", "Emerald", "Pear", "Heart", "Princess", "Radiant"] },
  { key: "origin", label: "Origin", question: "Natural or lab-grown?", options: ["Natural", "Lab-grown", "Either — advise me"] },
  { key: "budget", label: "Budget", question: "A comfortable budget?", options: ["Under $2k", "$2k–$5k", "$5k–$15k", "$15k+"] },
] as const;

const MAX_FILES = 6;
const MAX_FILE_SIZE = 6 * 1024 * 1024;
const MAX_TOTAL_SIZE = 24 * 1024 * 1024;
const IMAGE_EXTENSION = /\.(?:jpe?g|png|webp|heic|heif)$/i;

type Upload = { file: File; id: string; preview: string };
type Status = "idle" | "sending" | "sent" | "error";
type Submission = { id: string; statusUrl: string; notificationsConfigured: boolean };

function readableSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(bytes >= 1024 * 1024 ? 1 : 2)} MB`;
}

export function CustomBuilder() {
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [fileError, setFileError] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState("");
  const [submission, setSubmission] = useState<Submission | null>(null);
  const uploadsRef = useRef<Upload[]>([]);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const complete = STEPS.every(({ key }) => Boolean(choices[key]));

  useEffect(() => {
    uploadsRef.current = uploads;
  }, [uploads]);

  useEffect(() => () => {
    uploadsRef.current.forEach(({ preview }) => URL.revokeObjectURL(preview));
  }, []);

  const pick = (option: string) => {
    setChoices((previous) => ({ ...previous, [current.key]: option }));
    if (!isLast) window.setTimeout(() => setStep((value) => value + 1), 180);
  };

  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const candidates = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    setFileError("");
    if (!candidates.length) return;

    const existing = new Set(uploads.map(({ file }) => `${file.name}:${file.size}:${file.lastModified}`));
    const unique = candidates.filter((file) => !existing.has(`${file.name}:${file.size}:${file.lastModified}`));

    if (uploads.length + unique.length > MAX_FILES) {
      setFileError(`Choose no more than ${MAX_FILES} images total.`);
      return;
    }
    const unsupported = unique.find((file) => !(file.type.startsWith("image/") || IMAGE_EXTENSION.test(file.name)));
    if (unsupported) {
      setFileError(`${unsupported.name} is not a supported image.`);
      return;
    }
    const oversized = unique.find((file) => file.size > MAX_FILE_SIZE);
    if (oversized) {
      setFileError(`${oversized.name} is over the 6 MB per-image limit.`);
      return;
    }
    const nextTotal = [...uploads.map(({ file }) => file), ...unique].reduce((sum, file) => sum + file.size, 0);
    if (nextTotal > MAX_TOTAL_SIZE) {
      setFileError("Reference images must be 24 MB or less in total.");
      return;
    }

    setUploads((previous) => [
      ...previous,
      ...unique.map((file) => ({
        file,
        id: `${file.name}-${file.size}-${file.lastModified}`,
        preview: URL.createObjectURL(file),
      })),
    ]);
  };

  const removeFile = (id: string) => {
    setUploads((previous) => previous.filter((upload) => {
      if (upload.id === id) URL.revokeObjectURL(upload.preview);
      return upload.id !== id;
    }));
    setFileError("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!complete) {
      const firstMissing = STEPS.findIndex(({ key }) => !choices[key]);
      setStep(Math.max(0, firstMissing));
      setSubmitError("Complete all five design choices before sending your brief.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setSubmitError("");
    const form = new FormData(event.currentTarget);
    STEPS.forEach(({ key }) => form.set(key, choices[key]));
    uploads.forEach(({ file }) => form.append("referenceImages", file, file.name));

    try {
      const response = await fetch("/api/custom-requests", { method: "POST", body: form });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Custom request could not be created.");
      setSubmission({
        id: String(result.id ?? "Custom request"),
        statusUrl: String(result.statusUrl ?? "/custom"),
        notificationsConfigured: Boolean(result.notificationsConfigured),
      });
      setStatus("sent");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Custom request could not be created.");
      setStatus("error");
    }
  };

  if (status === "sent" && submission) {
    return (
      <section className={styles.done} aria-labelledby="custom-sent-title">
        <div className={styles.check} aria-hidden="true">✓</div>
        <p className={styles.doneKick}>Request {submission.id}</p>
        <h2 id="custom-sent-title">Brief received. Quotation pending.</h2>
        <p>Owner now reviews your choices{uploads.length ? ` and ${uploads.length} reference ${uploads.length === 1 ? "image" : "images"}` : ""}. Your tracking page will show the estimate, production time, and accept or decline controls.</p>
        <div className={styles.doneStatus}><span aria-hidden /> Awaiting owner quotation</div>
        <Link className={styles.trackButton} href={submission.statusUrl}>Check quotation status →</Link>
        <small>{submission.notificationsConfigured ? "Confirmation sent. We will email again when quotation is ready." : "Keep this status link. Email notifications become active when mail delivery is connected."}</small>
      </section>
    );
  }

  return (
    <form className={styles.builder} onSubmit={submit} aria-labelledby="custom-builder-title">
      <label className={styles.honeypot} htmlFor="custom-company" aria-hidden="true">Company<input id="custom-company" name="company" tabIndex={-1} autoComplete="off" /></label>

      <section className={styles.reference} aria-labelledby="reference-title">
        <header className={styles.briefHead}>
          <div>
            <p className={styles.stepKick}>Start with inspiration</p>
            <h2 id="reference-title">Show us the reference.</h2>
          </div>
          <p>Upload one image or multiple angles of the same piece. Prefer a product page, reel, or post? Paste its link instead—or send both.</p>
        </header>

        <div className={styles.referenceInputs}>
          <div>
            <input
              id="custom-reference-images"
              className={styles.fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
              multiple
              onChange={addFiles}
              aria-describedby="custom-file-help custom-file-status"
            />
            <label htmlFor="custom-reference-images" className={styles.uploadBox}>
              <span className={styles.uploadMark} aria-hidden="true">＋</span>
              <strong>{uploads.length ? "Add another angle" : "Upload reference photos"}</strong>
              <span id="custom-file-help">1–6 images · JPG, PNG, WEBP, or HEIC · 6 MB each</span>
            </label>
          </div>
          <label className={styles.linkBox} htmlFor="custom-reference-url">
            <span className={styles.linkMark} aria-hidden="true">↗</span>
            <strong>Attach a reference link</strong>
            <span>Product page, Instagram, Pinterest, TikTok, or another public URL</span>
            <input id="custom-reference-url" name="referenceUrl" type="url" inputMode="url" placeholder="https://…" />
          </label>
        </div>

        <p id="custom-file-status" className={styles.fileStatus} aria-live="polite">
          {uploads.length ? `${uploads.length} of ${MAX_FILES} selected · ${readableSize(uploads.reduce((sum, { file }) => sum + file.size, 0))} total` : "Reference images and link are optional, but help owner quote accurately."}
        </p>
        {fileError ? <p className={styles.fileError} role="alert" aria-live="assertive">{fileError}</p> : null}

        {uploads.length ? (
          <ul className={styles.previews} aria-label="Selected reference images">
            {uploads.map((upload, index) => (
              <li key={upload.id}>
                <div className={styles.previewImage}>
                  <Image src={upload.preview} alt={`Reference angle ${index + 1}: ${upload.file.name}`} fill sizes="150px" unoptimized />
                </div>
                <div>
                  <strong>Angle {index + 1}</strong>
                  <span title={upload.file.name}>{upload.file.name}</span>
                  <small>{readableSize(upload.file.size)}</small>
                </div>
                <button type="button" onClick={() => removeFile(upload.id)} aria-label={`Remove ${upload.file.name}`}>Remove</button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <ol className={styles.quoteJourney} aria-label="Custom quotation journey">
        <li><span>01</span><strong>Send request</strong><small>Photos or link + design choices</small></li>
        <li><span>02</span><strong>Receive estimate</strong><small>Owner reviews and prices design</small></li>
        <li><span>03</span><strong>Accept or decline</strong><small>Decision stays in your status page</small></li>
        <li><span>04</span><strong>Made & shipped</strong><small>Production and tracking updates</small></li>
      </ol>

      <div className={styles.progress} aria-label="Custom design steps">
        {STEPS.map((item, index) => (
          <button
            type="button"
            key={item.key}
            className={`${styles.pip} ${index === step ? styles.pipActive : ""} ${choices[item.key] ? styles.pipDone : ""}`}
            onClick={() => setStep(index)}
            aria-current={index === step ? "step" : undefined}
          >
            <span>{index + 1}</span>
            {item.label}
            {choices[item.key] ? <em>{choices[item.key]}</em> : null}
          </button>
        ))}
      </div>

      <section className={styles.stage} aria-labelledby="custom-builder-title">
        <p className={styles.stepKick}>Step {step + 1} of {STEPS.length}</p>
        <h2 id="custom-builder-title" className={styles.stepQ}>{current.question}</h2>
        <div className={styles.options}>
          {current.options.map((option) => (
            <button
              type="button"
              key={option}
              className={`${styles.option} ${choices[current.key] === option ? styles.optionActive : ""}`}
              onClick={() => pick(option)}
              aria-pressed={choices[current.key] === option}
            >
              {option}
            </button>
          ))}
        </div>

        <div className={styles.nav}>
          {step > 0 ? (
            <button type="button" className={styles.back} onClick={() => setStep((value) => value - 1)}>← Back</button>
          ) : <span />}
          {!isLast ? (
            <button type="button" className={styles.next} onClick={() => setStep((value) => Math.min(STEPS.length - 1, value + 1))}>Next →</button>
          ) : null}
        </div>
      </section>

      {complete ? (
        <section className={styles.brief} aria-labelledby="contact-title">
          <div className={styles.contactHead}>
            <p className={styles.stepKick}>Request your estimate</p>
            <h2 id="contact-title">Where should we send the quotation?</h2>
            <p>Owner reviews your references personally. You will receive a private status link, then an email when estimated price and production time are ready.</p>
          </div>
          <div className={styles.fields}>
            <label htmlFor="custom-name">Name<input id="custom-name" required name="name" autoComplete="name" /></label>
            <label htmlFor="custom-email">Email<input id="custom-email" required name="email" type="email" autoComplete="email" /></label>
            <label htmlFor="custom-phone">Phone <span>(optional)</span><input id="custom-phone" name="phone" type="tel" autoComplete="tel" /></label>
            <label className={styles.notes} htmlFor="custom-notes">Details to preserve <span>(optional)</span><textarea id="custom-notes" name="notes" rows={4} placeholder="A detail, profile, engraving, timeline, or anything the images do not show…" /></label>
          </div>
          <div className={styles.sendRow}>
            <p>References stay private. No payment is taken until you review and accept owner&apos;s quotation.</p>
            <button className={styles.submit} type="submit" disabled={status === "sending"}>{status === "sending" ? "Creating request…" : "Request quotation →"}</button>
          </div>
          {status === "error" ? <p className={styles.submitError} role="alert" aria-live="assertive">{submitError}</p> : null}
        </section>
      ) : (
        <p className={styles.builderHint}>Complete five choices. Your contact form and quotation request will appear here.</p>
      )}
    </form>
  );
}

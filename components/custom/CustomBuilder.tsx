"use client";

import { useState } from "react";
import styles from "./custom.module.css";

const STEPS = [
  { key: "type", label: "Piece", options: ["Engagement ring", "Wedding band", "Pendant", "Earrings", "Bracelet", "Necklace"] },
  { key: "metal", label: "Metal", options: ["Rose gold", "Yellow gold", "White gold", "Platinum"] },
  { key: "shape", label: "Stone", options: ["Round", "Oval", "Cushion", "Emerald", "Pear", "Heart", "Princess", "Radiant"] },
  { key: "origin", label: "Origin", options: ["Natural", "Lab-grown", "Either — advise me"] },
  { key: "budget", label: "Budget", options: ["Under $2k", "$2k–$5k", "$5k–$15k", "$15k+"] },
];

export function CustomBuilder() {
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const pick = (opt: string) => {
    setChoices((c) => ({ ...c, [current.key]: opt }));
    if (!isLast) setTimeout(() => setStep((s) => s + 1), 180);
  };

  if (sent) {
    return (
      <div className={styles.done}>
        <div className={styles.check}>✓</div>
        <h2>Your brief is on its way.</h2>
        <p>
          We&apos;ll review your {choices.type?.toLowerCase() ?? "piece"} in {choices.metal?.toLowerCase() ?? "your metal"} and
          reach out within one business day with stone options and a sketch. Thank you.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.builder}>
      <div className={styles.progress}>
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            className={`${styles.pip} ${i === step ? styles.pipActive : ""} ${choices[s.key] ? styles.pipDone : ""}`}
            onClick={() => setStep(i)}
          >
            <span>{i + 1}</span>
            {s.label}
            {choices[s.key] ? <em>{choices[s.key]}</em> : null}
          </button>
        ))}
      </div>

      <div className={styles.stage}>
        <p className={styles.stepKick}>Step {step + 1} of {STEPS.length}</p>
        <h2 className={styles.stepQ}>
          {current.key === "type" && "What are we making?"}
          {current.key === "metal" && "Which metal?"}
          {current.key === "shape" && "Choose a stone shape."}
          {current.key === "origin" && "Natural or lab-grown?"}
          {current.key === "budget" && "A comfortable budget?"}
        </h2>
        <div className={styles.options}>
          {current.options.map((opt) => (
            <button
              key={opt}
              className={`${styles.option} ${choices[current.key] === opt ? styles.optionActive : ""}`}
              onClick={() => pick(opt)}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className={styles.nav}>
          {step > 0 ? (
            <button className={styles.back} onClick={() => setStep((s) => s - 1)}>← Back</button>
          ) : <span />}
          {isLast && Object.keys(choices).length >= STEPS.length ? (
            <button className={styles.submit} onClick={() => setSent(true)}>Send my brief →</button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

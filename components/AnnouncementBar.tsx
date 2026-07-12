"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const MESSAGES = [
  "Free Shipping on All Orders",
  "GIA & IGI Certified Diamonds",
  "NYC Diamond District — 62 W 47th St, Suite 505",
  "Book a Private Consultation — By Appointment"
];

const DISMISSED_STORAGE_KEY = "jewel-stone-announcement-dismissed";

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    try {
      setIsDismissed(window.sessionStorage.getItem(DISMISSED_STORAGE_KEY) === "true");
    } catch {
      setIsDismissed(false);
    }
  }, []);

  useEffect(() => {
    if (isDismissed) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setIndex((current) => (current + 1) % MESSAGES.length);
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [isDismissed]);

  const handleDismiss = () => {
    try {
      window.sessionStorage.setItem(DISMISSED_STORAGE_KEY, "true");
    } catch {
      // Keep the dismissal for the current page view if storage is unavailable.
    }

    setIsDismissed(true);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="relative z-[70] flex h-9 items-center justify-center overflow-hidden border-b border-champagne/20 bg-ivory/95 px-10 text-center text-champagne backdrop-blur-md">
      <div className="relative flex h-full w-full max-w-5xl items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={MESSAGES[index]}
            aria-live="polite"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-0 flex items-center justify-center px-2 text-[10px] font-medium uppercase leading-none tracking-[0.16em] text-champagne sm:text-[11px] sm:tracking-[0.28em]"
          >
            <span className="truncate">{MESSAGES[index]}</span>
          </motion.p>
        </AnimatePresence>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-ink/85 transition-colors hover:bg-pearl/10 hover:text-chromehi focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <X aria-hidden="true" className="size-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

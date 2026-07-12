"use client";

import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gem, X } from "lucide-react";

const STORAGE_KEY = "js-newsletter-dismissed";

export function NewsletterPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || localStorage.getItem(STORAGE_KEY)) {
      return;
    }

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setVisible(true);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(fallback);
    };

    // Show once the visitor is genuinely engaged — scrolled ~55% down the page —
    // so it never covers the hero or the 3D showcase on arrival.
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const depth = scrolled / document.documentElement.scrollHeight;
      if (depth > 0.55) reveal();
    };

    // Fallback for visitors who don't scroll much.
    const fallback = window.setTimeout(reveal, 25000);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(fallback);
    };
  }, []);

  function dismiss() {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
    setVisible(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dismiss();
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-marble/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          />
          <div className="pointer-events-none fixed inset-0 z-[81] flex items-center justify-center p-4">
            <motion.div
              className="pointer-events-auto relative w-full max-w-md rounded-2xl bg-pearl p-8 text-center shadow-2xl"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.38, ease: [0.23, 1, 0.32, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="newsletter-title"
            >
              <button
                type="button"
                onClick={dismiss}
                className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-ink/40 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
                aria-label="Dismiss newsletter offer"
              >
                <X size={15} aria-hidden="true" />
              </button>

              <div className="mx-auto grid size-11 place-items-center rounded-full bg-rose/10 text-rose">
                <Gem size={22} strokeWidth={1.8} aria-hidden="true" />
              </div>

              <form onSubmit={handleSubmit} className="mt-5">
                <h2 id="newsletter-title" className="font-display text-3xl leading-tight text-ink">
                  Join the Inner Circle
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-ink/60">
                  Get $100 off your first piece of $1,000 or more when you join our list.
                </p>

                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder="Your email address"
                  className="mt-6 w-full rounded-full border border-rose/30 px-4 py-3 text-sm text-ink placeholder:text-ink/35 transition-colors focus:border-rose/70 focus:outline-none focus:ring-2 focus:ring-rose/20"
                />

                <button
                  type="submit"
                  className="mt-3 w-full rounded-full bg-gradient-to-br from-aurora2 to-aurora1 py-3 text-sm font-medium text-ivory shadow-[0_8px_26px_rgba(180,132,47,.4)] transition-all hover:brightness-110 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-velvet"
                >
                  Claim My Offer
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="mt-4 text-center text-xs text-ink/40 transition-colors hover:text-ink/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
                >
                  No thanks
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

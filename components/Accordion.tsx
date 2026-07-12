"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

export type AccordionItem = {
  question: string;
  answer: string;
};

export function Accordion({ items }: { items: AccordionItem[] }) {
  const id = useId();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      {items.map((item, index) => {
        const isOpen = open === index;
        const buttonId = `${id}-trigger-${index}`;
        const panelId = `${id}-panel-${index}`;

        return (
          <div key={`${item.question}-${index}`} className="border-b border-rose/15">
            <button
              id={buttonId}
              type="button"
              onClick={() => setOpen(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-lg text-ink transition-colors hover:text-velvet focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              <span>{item.question}</span>
              {isOpen ? (
                <Minus size={15} className="shrink-0 text-rose" aria-hidden="true" />
              ) : (
                <Plus size={15} className="shrink-0 text-ink/40" aria-hidden="true" />
              )}
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 text-sm leading-7 text-ink/65">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

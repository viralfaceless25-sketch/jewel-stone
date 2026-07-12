"use client";

import { FormEvent, useState } from "react";
import { ActionButton } from "@/components/Buttons";

type FormStatus = "idle" | "success";

export function ContactForm({ selectedProducts = [] }: { selectedProducts?: string[] }) {
  const [status, setStatus] = useState<FormStatus>("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("success");
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5" aria-label="Appointment inquiry form">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Name
          <input required name="name" className="min-h-12 border border-rose/25 bg-pearl/70 px-4 text-base" autoComplete="name" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Phone
          <input required name="phone" className="min-h-12 border border-rose/25 bg-pearl/70 px-4 text-base" autoComplete="tel" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium">
        Email
        <input required type="email" name="email" className="min-h-12 border border-rose/25 bg-pearl/70 px-4 text-base" autoComplete="email" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Preferred contact method
        <select name="contactMethod" className="min-h-12 border border-rose/25 bg-pearl/70 px-4 text-base">
          <option>Phone</option>
          <option>Email</option>
          <option>Text</option>
          <option>WhatsApp</option>
        </select>
      </label>
      {selectedProducts.length > 0 ? (
        <label className="grid gap-2 text-sm font-medium">
          Selected products
          <textarea readOnly name="selectedProducts" rows={3} value={selectedProducts.join("\n")} className="border border-rose/25 bg-pearl/70 px-4 py-3 text-base" />
        </label>
      ) : null}
      <label className="grid gap-2 text-sm font-medium">
        Message
        <textarea required name="message" rows={5} className="border border-rose/25 bg-pearl/70 px-4 py-3 text-base" placeholder="Tell us about the piece, stone, occasion, timing, or budget." />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <ActionButton type="submit">Submit inquiry</ActionButton>
        {status === "success" ? <p className="text-sm font-medium text-velvet">Inquiry received. Jewel Stone will contact you soon.</p> : null}
      </div>
    </form>
  );
}

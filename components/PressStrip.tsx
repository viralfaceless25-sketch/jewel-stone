const PRESS = ["VOGUE", "FORBES", "BRIDES", "ELLE", "NEW YORK POST", "THE KNOT"];

export function PressStrip() {
  return (
    <section className="border-y border-rose/10 bg-[#141416] py-8">
      <div className="luxury-shell">
        <p className="eyebrow mb-7 text-center">As Featured In</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {PRESS.map((name) => (
            <span
              key={name}
              className="select-none font-display text-[1.05rem] font-light uppercase tracking-[0.12em] text-ink/25"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

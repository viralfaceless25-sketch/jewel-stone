export function WelcomeStory() {
  return (
    <section className="editorial-section bg-ivory text-center" aria-labelledby="welcome-heading">
      <div className="mx-auto max-w-[76rem] px-6 py-8 lg:py-20">
        <p className="reveal eyebrow justify-center">Welcome to Jewel Stone</p>
        <h2 id="welcome-heading" className="reveal mt-10 font-display text-[clamp(3rem,7.4vw,7.4rem)] font-normal leading-[.98] tracking-[-.025em] text-ink">
          A small house of diamond-cutters, making <em className="editorial-italic">one-of-a-kind</em> pieces the world will only see once.
        </h2>
        <p className="reveal mx-auto mt-10 max-w-2xl text-sm leading-7 text-ink/58">Lab-grown and natural diamonds, chosen, cut and set by hand at our NYC Diamond District bench.</p>
      </div>
    </section>
  );
}

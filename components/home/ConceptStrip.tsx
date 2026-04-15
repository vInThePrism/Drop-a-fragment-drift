const steps = [
  {
    num: "01",
    title: "Drop",
    body: "Write an unfinished thought or attach an image. Pick one emotion that fits. That's all.",
    accent: "var(--color-ember)",
  },
  {
    num: "02",
    title: "Drift",
    body: "Claude reads the undercurrent of your fragment — its emotion, its theme, its slant. It finds a stranger's fragment that shares one dimension but diverges everywhere else.",
    accent: "var(--color-curious)",
  },
  {
    num: "03",
    title: "Catch & respond",
    body: "You receive their fragment. They receive yours. A small continuation is invited — a single line, an image, a word. Then it ends.",
    accent: "var(--color-grateful)",
  },
];

export function ConceptStrip() {
  return (
    <section
      aria-labelledby="concept-heading"
      className="px-6 md:px-12 py-[var(--space-section)]"
    >
      {/* Section label */}
      <p className="font-[family-name:var(--font-inter-tight)] text-xs font-semibold tracking-[0.15em] uppercase text-[var(--color-ink-dim)] mb-12">
        How it works
      </p>

      {/* Asymmetric step list — not a card grid */}
      <div className="space-y-16 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-16 max-w-5xl">
        {steps.map((step, i) => (
          <div
            key={step.num}
            className="relative"
            style={{ paddingTop: i === 1 ? "3rem" : i === 2 ? "6rem" : "0" }}
          >
            {/* Step number */}
            <span
              className="font-[family-name:var(--font-fraunces)] font-semibold leading-none mb-5 block"
              style={{
                fontSize: "clamp(3rem, 2rem + 3vw, 5rem)",
                color: step.accent,
                opacity: 0.18,
                letterSpacing: "-0.04em",
                fontVariationSettings: "'SOFT' 20",
              }}
              aria-hidden
            >
              {step.num}
            </span>

            {/* Title */}
            <h2
              id={i === 0 ? "concept-heading" : undefined}
              className="font-[family-name:var(--font-fraunces)] font-semibold text-[var(--color-ink)] mb-3"
              style={{
                fontSize: "clamp(1.5rem, 1rem + 1.5vw, 2rem)",
                letterSpacing: "-0.02em",
                fontVariationSettings: "'SOFT' 30",
              }}
            >
              {step.title}
            </h2>

            {/* Body */}
            <p className="font-[family-name:var(--font-inter-tight)] text-[var(--color-ink-mid)] leading-relaxed text-[0.9375rem]">
              {step.body}
            </p>

            {/* Accent underline */}
            <div
              className="mt-5 h-px w-8"
              style={{ backgroundColor: step.accent, opacity: 0.5 }}
              aria-hidden
            />
          </div>
        ))}
      </div>
    </section>
  );
}

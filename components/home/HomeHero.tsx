import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { DriftMark } from "@/components/ui/DriftMark";

export function HomeHero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-[90svh] flex flex-col"
    >
      {/* Asymmetric top stripe */}
      <div
        aria-hidden
        className="absolute top-0 right-0 w-1/3 h-full pointer-events-none"
        style={{
          background:
            "linear-gradient(160deg, oklch(94% 0.018 80) 0%, transparent 70%)",
        }}
      />

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-7">
        <div className="flex items-center gap-2 text-[var(--color-ink)]">
          <DriftMark size={28} />
          <span
            className="font-[family-name:var(--font-fraunces)] text-xl font-semibold tracking-tight"
            style={{ fontVariationSettings: "'SOFT' 50" }}
          >
            drift
          </span>
        </div>
        <Link href="/drop">
          <Button variant="outline" size="sm">
            Drop a fragment
          </Button>
        </Link>
      </header>

      {/* Hero copy — left-weighted, off-center */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="px-6 md:px-12 max-w-3xl mt-8 md:mt-0">
          {/* Eyebrow */}
          <p className="font-[family-name:var(--font-inter-tight)] text-xs font-semibold tracking-[0.15em] uppercase text-[var(--color-ink-dim)] mb-6">
            An experiment in distance
          </p>

          {/* Headline */}
          <h1
            id="hero-heading"
            className="font-[family-name:var(--font-fraunces)] font-semibold leading-[1.05] text-[var(--color-ink)] mb-6"
            style={{
              fontSize: "clamp(2.75rem, 1.5rem + 5.5vw, 6rem)",
              fontVariationSettings: "'SOFT' 30, 'WONK' 0",
              letterSpacing: "-0.02em",
            }}
          >
            Send a thought
            <br />
            <em
              style={{
                color: "var(--color-ember)",
                fontStyle: "italic",
                fontVariationSettings: "'SOFT' 60, 'WONK' 1",
              }}
            >
              into the current.
            </em>
          </h1>

          {/* Sub */}
          <p
            className="font-[family-name:var(--font-inter-tight)] text-[var(--color-ink-mid)] mb-10 max-w-md leading-relaxed"
            style={{ fontSize: "clamp(1rem, 0.85rem + 0.7vw, 1.2rem)" }}
          >
            Drop an unfinished fragment — a feeling, a line, an image. Drift
            matches it with a stranger's fragment that shares one dimension. You
            catch theirs. They catch yours.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 items-center">
            <Link href="/drop">
              <Button size="lg">Drop a fragment</Button>
            </Link>
            <Link href="/catch/demo">
              <Button variant="ghost" size="lg">
                See how it works ↓
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative floating fragment preview — right side */}
      <div
        aria-hidden
        className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 w-64"
        style={{ transform: "translateY(-50%) rotate(2.5deg)" }}
      >
        <div
          className="bg-[var(--color-surface)] rounded-2xl p-6"
          style={{
            boxShadow:
              "0 4px 6px -1px oklch(22% 0.02 60 / 0.06), 0 16px 40px -4px oklch(22% 0.02 60 / 0.12)",
            border: "1px solid oklch(88% 0.01 80)",
          }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-restless)] mb-3">
            · restless
          </p>
          <p
            className="font-[family-name:var(--font-fraunces)] text-[var(--color-ink)] leading-relaxed"
            style={{
              fontSize: "1.15rem",
              fontVariationSettings: "'SOFT' 40",
            }}
          >
            I keep starting letters I never send.
          </p>
          <p className="mt-4 text-xs text-[var(--color-ink-dim)] font-[family-name:var(--font-inter-tight)]">
            Someone is reading this right now →
          </p>
        </div>
      </div>

      {/* Bottom scroll hint */}
      <div className="relative z-10 px-6 md:px-12 pb-8 mt-auto">
        <div
          aria-hidden
          className="w-px h-10 bg-gradient-to-b from-[var(--color-ink-dim)] to-transparent mx-0"
        />
      </div>
    </section>
  );
}

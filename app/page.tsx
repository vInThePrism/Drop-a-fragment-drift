import { HomeHero } from "@/components/home/HomeHero";
import { ConceptStrip } from "@/components/home/ConceptStrip";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <main>
      <HomeHero />

      <ConceptStrip />

      {/* Final CTA row */}
      <section className="px-6 md:px-12 pb-[var(--space-section)] pt-4">
        <div
          className="max-w-5xl border-t pt-12"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p
            className="font-[family-name:var(--font-fraunces)] font-semibold text-[var(--color-ink)] mb-6"
            style={{
              fontSize: "clamp(1.5rem, 1rem + 2vw, 2.5rem)",
              letterSpacing: "-0.02em",
              fontVariationSettings: "'SOFT' 30",
            }}
          >
            No accounts. No followers. Just the current.
          </p>
          <Link href="/drop">
            <Button size="lg">Start drifting</Button>
          </Link>
        </div>
      </section>

      {/* Minimal footer */}
      <footer
        className="px-6 md:px-12 py-8 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p className="font-[family-name:var(--font-inter-tight)] text-xs text-[var(--color-ink-dim)]">
          Drift — fragments in motion
        </p>
      </footer>
    </main>
  );
}

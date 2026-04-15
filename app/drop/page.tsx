import Link from "next/link";
import { FragmentComposer } from "@/components/drop/FragmentComposer";
import { DriftMark } from "@/components/ui/DriftMark";

export const metadata = {
  title: "Drop a fragment — Drift",
};

export default function DropPage() {
  return (
    <main className="min-h-svh flex flex-col">
      {/* Nav */}
      <header
        className="flex items-center justify-between px-6 md:px-12 py-6 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-[var(--color-ink)] hover:text-[var(--color-ember)] transition-colors"
        >
          <DriftMark size={24} />
          <span className="font-[family-name:var(--font-fraunces)] text-lg font-semibold tracking-tight">
            drift
          </span>
        </Link>
        <p className="font-[family-name:var(--font-inter-tight)] text-xs text-[var(--color-ink-dim)] hidden md:block">
          Step 1 of 3
        </p>
      </header>

      {/* Page body */}
      <div className="flex-1 flex items-start justify-center px-6 md:px-12 py-12 md:py-20">
        <div className="w-full max-w-xl">
          {/* Page heading */}
          <div className="mb-10">
            <p className="font-[family-name:var(--font-inter-tight)] text-xs font-semibold tracking-[0.15em] uppercase text-[var(--color-ink-dim)] mb-4">
              Drop
            </p>
            <h1
              className="font-[family-name:var(--font-fraunces)] font-semibold text-[var(--color-ink)] leading-tight mb-3"
              style={{
                fontSize: "clamp(1.8rem, 1.2rem + 2.5vw, 2.8rem)",
                letterSpacing: "-0.02em",
                fontVariationSettings: "'SOFT' 30",
              }}
            >
              What have you been
              <br />
              <em
                style={{
                  fontStyle: "italic",
                  color: "var(--color-ember)",
                  fontVariationSettings: "'SOFT' 55, 'WONK' 1",
                }}
              >
                carrying?
              </em>
            </h1>
            <p className="font-[family-name:var(--font-inter-tight)] text-[var(--color-ink-mid)] text-sm leading-relaxed max-w-sm">
              Write a fragment — a feeling, a line, an image. You'll receive
              something in return that shares one dimension with yours.
            </p>
          </div>

          <FragmentComposer />
        </div>
      </div>
    </main>
  );
}

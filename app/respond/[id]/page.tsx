import Link from "next/link";
import { DriftMark } from "@/components/ui/DriftMark";
import { RespondClient } from "@/components/respond/RespondClient";
import type { Fragment } from "@/lib/validation/fragmentSchema";

export const metadata = {
  title: "Respond — Drift",
};

const DEMO_MATCHED: Fragment = {
  id: "frg_DEMO0001",
  createdAt: "2024-01-01T00:00:00.000Z",
  kind: "text",
  content: {
    text: "Some mornings I make coffee for two people out of habit, and then I remember.",
    imageUrl: null,
  },
  userTag: "restless",
  analysis: {
    theme: "presence & absence",
    emotion: "restless",
    perspectiveSignal: "observer, domestic, quietly devastated",
  },
  matchedWith: null,
  responses: [],
};

async function getMatchedFragment(id: string) {
  if (id === "demo") return DEMO_MATCHED;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/fragments/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = await res.json();
    // API returns { success, data: { fragment, matchedFragment } }
    // Show the matched fragment; fall back to the fragment itself
    return body?.data?.matchedFragment ?? body?.data?.fragment ?? null;
  } catch {
    return null;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RespondPage({ params }: PageProps) {
  const { id } = await params;
  const matched = await getMatchedFragment(id);

  if (!matched) {
    return (
      <main className="min-h-svh flex flex-col items-center justify-center px-6 text-center gap-6">
        <DriftMark size={40} className="text-[var(--color-ink-dim)]" />
        <p
          className="font-[family-name:var(--font-fraunces)] font-semibold text-[var(--color-ink)]"
          style={{ fontSize: "1.5rem", fontVariationSettings: "'SOFT' 30" }}
        >
          This fragment has already drifted on.
        </p>
        <Link
          href="/"
          className="font-[family-name:var(--font-inter-tight)] text-sm text-[var(--color-ember)] underline underline-offset-4"
        >
          Back to shore
        </Link>
      </main>
    );
  }

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
          Step 3 of 3
        </p>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 md:px-12 py-12 md:py-20">
        <div className="w-full max-w-xl flex flex-col gap-6">
          {/* Page heading */}
          <div>
            <p className="font-[family-name:var(--font-inter-tight)] text-xs font-semibold tracking-[0.15em] uppercase text-[var(--color-ink-dim)] mb-4">
              Respond
            </p>
            <h1
              className="font-[family-name:var(--font-fraunces)] font-semibold text-[var(--color-ink)] leading-tight mb-2"
              style={{
                fontSize: "clamp(1.6rem, 1rem + 2.5vw, 2.5rem)",
                letterSpacing: "-0.02em",
                fontVariationSettings: "'SOFT' 30",
              }}
            >
              Write back into it.
            </h1>
            <p className="font-[family-name:var(--font-inter-tight)] text-sm text-[var(--color-ink-dim)] leading-relaxed">
              A single continuation — then this exchange is complete.
            </p>
          </div>

          <RespondClient fragmentId={id} matched={matched} />
        </div>
      </div>
    </main>
  );
}

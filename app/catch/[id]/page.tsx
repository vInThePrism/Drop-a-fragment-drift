import Link from "next/link";
import { DriftMark } from "@/components/ui/DriftMark";
import { Button } from "@/components/ui/Button";
import { FragmentCard } from "@/components/catch/FragmentCard";
import { DriftMeta } from "@/components/catch/DriftMeta";
import type { Fragment } from "@/lib/validation/fragmentSchema";

interface CatchData {
  matched: Fragment;
  shared: "emotion" | "theme";
  sharedValue: string;
}

// Demo shown at /catch/demo
const DEMO_FRAGMENT: Fragment = {
  id: "frg_DEMO0001",
  createdAt: "2024-01-01T00:00:00.000Z",
  kind: "text",
  content: {
    text: "Some mornings I make coffee for two people out of habit, and then I remember.",
    imageUrl: null,
  },
  userTag: "restless",
  analysis: { theme: "presence & absence", emotion: "restless", perspectiveSignal: "observer" },
  matchedWith: null,
  responses: [],
};

function resolveSharedDimension(
  fragment: Fragment,
  matched: Fragment,
): { shared: "emotion" | "theme"; sharedValue: string } {
  const a = fragment.analysis;
  const b = matched.analysis;
  if (!a || !b) return { shared: "emotion", sharedValue: "feeling" };

  if (a.emotion.toLowerCase() === b.emotion.toLowerCase()) {
    return { shared: "emotion", sharedValue: a.emotion };
  }
  return { shared: "theme", sharedValue: a.theme };
}

async function getCatchData(id: string): Promise<CatchData | null> {
  if (id === "demo") {
    return { matched: DEMO_FRAGMENT, shared: "emotion", sharedValue: "restless" };
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/fragments/${id}`, { cache: "no-store" });
    if (!res.ok) return null;

    const body = await res.json();
    const { fragment, matchedFragment } = body?.data ?? {};
    if (!fragment) return null;

    // If there's no match yet, show the fragment itself as "matched" (seed fallback)
    const matched: Fragment = matchedFragment ?? fragment;
    const { shared, sharedValue } = resolveSharedDimension(fragment, matched);

    return { matched, shared, sharedValue };
  } catch {
    return null;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CatchPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getCatchData(id);

  if (!data) {
    return (
      <main className="min-h-svh flex flex-col items-center justify-center px-6 text-center gap-6">
        <DriftMark size={40} className="text-[var(--color-ink-dim)]" />
        <p
          className="font-[family-name:var(--font-fraunces)] font-semibold text-[var(--color-ink)]"
          style={{ fontSize: "1.5rem", fontVariationSettings: "'SOFT' 30" }}
        >
          This fragment has already drifted on.
        </p>
        <Link href="/">
          <Button variant="outline">Back to shore</Button>
        </Link>
      </main>
    );
  }

  const { matched, shared, sharedValue } = data;

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
          Step 2 of 3
        </p>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 md:px-12 py-12 md:py-20">
        <div className="w-full max-w-xl flex flex-col gap-10">
          {/* Heading */}
          <div>
            <p className="font-[family-name:var(--font-inter-tight)] text-xs font-semibold tracking-[0.15em] uppercase text-[var(--color-ink-dim)] mb-4">
              Catch
            </p>
            <h1
              className="font-[family-name:var(--font-fraunces)] font-semibold text-[var(--color-ink)] leading-tight"
              style={{
                fontSize: "clamp(1.6rem, 1rem + 2.5vw, 2.5rem)",
                letterSpacing: "-0.02em",
                fontVariationSettings: "'SOFT' 30",
              }}
            >
              A fragment found you.
            </h1>
            <p className="font-[family-name:var(--font-inter-tight)] text-sm text-[var(--color-ink-dim)] mt-2 leading-relaxed">
              Someone released this — and the current brought it to you.
            </p>
          </div>

          {/* The matched fragment on a rotated paper surface */}
          <div className="py-4">
            <style>{`
              @keyframes driftIn {
                from { opacity: 0; transform: rotate(-0.6deg) translateY(12px); }
                to   { opacity: 1; transform: rotate(-0.6deg) translateY(0); }
              }
              .drift-in {
                animation: driftIn 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
              }
              @media (prefers-reduced-motion: reduce) {
                .drift-in { animation: none; }
              }
            `}</style>
            <FragmentCard fragment={matched} rotate={-0.6} animate />
          </div>

          {/* Drift metadata */}
          <DriftMeta
            sharedDimension={shared as "emotion" | "theme"}
            sharedValue={sharedValue}
          />

          {/* CTA */}
          <div className="flex items-center gap-4">
            <Link href={`/respond/${id}`}>
              <Button size="lg">Continue ↗</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost">Let it drift on</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

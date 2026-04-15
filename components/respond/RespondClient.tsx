"use client";

import { useState } from "react";
import Link from "next/link";
import { ResponseComposer } from "./ResponseComposer";
import { Button } from "@/components/ui/Button";
import { DriftMark } from "@/components/ui/DriftMark";
import type { Fragment } from "@/lib/validation/fragmentSchema";

interface RespondClientProps {
  fragmentId: string;
  matched: Fragment;
}

export function RespondClient({ fragmentId, matched }: RespondClientProps) {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex flex-col items-start gap-8 py-12">
        {/* Completion mark */}
        <div className="flex items-center gap-3">
          <DriftMark size={36} className="text-[var(--color-ember)]" />
          <span
            className="font-[family-name:var(--font-fraunces)] font-semibold text-[var(--color-ember)]"
            style={{ fontSize: "1.1rem", fontVariationSettings: "'SOFT' 40" }}
          >
            Released.
          </span>
        </div>

        <div>
          <h2
            className="font-[family-name:var(--font-fraunces)] font-semibold text-[var(--color-ink)] leading-snug mb-3"
            style={{
              fontSize: "clamp(1.5rem, 1rem + 2vw, 2.25rem)",
              letterSpacing: "-0.02em",
              fontVariationSettings: "'SOFT' 30",
            }}
          >
            Your response is drifting.
          </h2>
          <p className="font-[family-name:var(--font-inter-tight)] text-sm text-[var(--color-ink-mid)] leading-relaxed max-w-sm">
            The exchange is complete. Both fragments are now part of the current.
            Nothing more is required of you.
          </p>
        </div>

        <Link href="/">
          <Button variant="outline">Drop another fragment</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* The fragment they're responding to — compact display */}
      <div>
        <p className="font-[family-name:var(--font-inter-tight)] text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-ink-dim)] mb-4">
          The fragment you caught
        </p>
        <div
          className="rounded-xl px-6 py-5"
          style={{
            border: "1px solid var(--color-border)",
            backgroundColor: "oklch(97% 0.012 80 / 0.5)",
          }}
        >
          {matched.content.imageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={matched.content.imageUrl}
                alt="Fragment image"
                className="w-full object-cover max-h-40"
              />
            </div>
          )}
          {matched.content.text && (
            <p
              className="font-[family-name:var(--font-fraunces)] text-[var(--color-ink)] leading-relaxed"
              style={{
                fontSize: "clamp(1rem, 0.85rem + 0.7vw, 1.25rem)",
                fontVariationSettings: "'SOFT' 40",
              }}
            >
              {matched.content.text}
            </p>
          )}
          {matched.analysis?.theme && (
            <p className="mt-3 font-[family-name:var(--font-inter-tight)] text-xs text-[var(--color-ink-dim)]">
              — {matched.analysis.theme}
            </p>
          )}
        </div>
      </div>

      {/* Divider with label */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <span className="font-[family-name:var(--font-inter-tight)] text-xs text-[var(--color-ink-dim)] tracking-wide">
          your continuation
        </span>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
      </div>

      {/* Response composer */}
      <ResponseComposer fragmentId={fragmentId} onSent={() => setSent(true)} />
    </div>
  );
}

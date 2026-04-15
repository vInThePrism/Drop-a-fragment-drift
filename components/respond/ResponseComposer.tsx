"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";

interface ResponseComposerProps {
  fragmentId: string;
  onSent: () => void;
}

const MAX_CHARS = 320;

export function ResponseComposer({ fragmentId, onSent }: ResponseComposerProps) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const remaining = MAX_CHARS - text.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fragmentId, text: text.trim() }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? "Something went wrong.");
        }

        onSent();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
      aria-label="Write a response"
      noValidate
    >
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          placeholder="A continuation, a single word, a question back…"
          rows={5}
          className="w-full resize-none rounded-xl px-5 py-4 font-[family-name:var(--font-fraunces)] leading-relaxed bg-[var(--color-surface)] focus:outline-none transition-shadow duration-150 placeholder:text-[var(--color-ink-dim)]"
          style={{
            fontSize: "clamp(1rem, 0.85rem + 0.8vw, 1.25rem)",
            fontVariationSettings: "'SOFT' 40",
            color: "var(--color-ink)",
            border: "1px solid var(--color-border)",
            boxShadow: "inset 0 1px 3px oklch(22% 0.02 60 / 0.04)",
          }}
          aria-describedby="resp-char-count"
        />
        <span
          id="resp-char-count"
          className="absolute bottom-3 right-4 font-[family-name:var(--font-inter-tight)] text-xs"
          style={{
            color: remaining < 40 ? "var(--color-ember)" : "var(--color-ink-dim)",
          }}
          aria-live="polite"
        >
          {remaining}
        </span>
      </div>

      {error && (
        <p
          role="alert"
          className="font-[family-name:var(--font-inter-tight)] text-sm text-[var(--color-ink-mid)] border-l-2 pl-3"
          style={{ borderColor: "var(--color-ember)" }}
        >
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        <p className="font-[family-name:var(--font-inter-tight)] text-xs text-[var(--color-ink-dim)] leading-relaxed max-w-xs">
          Your response drifts back. Then it ends.
        </p>
        <Button
          type="submit"
          disabled={!text.trim() || isPending}
          size="lg"
        >
          {isPending ? "Sending…" : "Send it back ↗"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EmotionPicker } from "./EmotionPicker";
import { ImageDropZone } from "./ImageDropZone";
import { Button } from "@/components/ui/Button";
import type { EmotionTag } from "@/lib/validation/fragmentSchema";

const MAX_CHARS = 480;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function FragmentComposer() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [emotion, setEmotion] = useState<EmotionTag | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleClearImage() {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  }

  function canSubmit() {
    return (text.trim().length > 0 || imageFile !== null) && emotion !== null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit()) return;
    setError(null);

    startTransition(async () => {
      try {
        const imageDataUrl = imageFile ? await fileToDataUrl(imageFile) : null;

        const res = await fetch("/api/fragments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text.trim() || null,
            imageDataUrl,
            userTag: emotion,
          }),
        });

        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body?.error ?? "Something went wrong — try again.");
        }

        const id = body?.data?.id;
        router.push(`/catch/${id}`);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  const remaining = MAX_CHARS - text.length;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-7"
      aria-label="Drop a fragment"
      noValidate
    >
      {/* Text area */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="fragment-text"
          className="font-[family-name:var(--font-inter-tight)] text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-ink-dim)]"
        >
          Your fragment
        </label>
        <div className="relative">
          <textarea
            id="fragment-text"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
            placeholder="An unfinished thought, a line, a question you've been sitting with…"
            rows={6}
            className="w-full resize-none rounded-xl px-5 py-4 font-[family-name:var(--font-fraunces)] leading-relaxed bg-[var(--color-surface)] focus:outline-none transition-shadow duration-150 placeholder:text-[var(--color-ink-dim)]"
            style={{
              fontSize: "clamp(1.1rem, 0.9rem + 0.8vw, 1.4rem)",
              fontVariationSettings: "'SOFT' 40",
              color: "var(--color-ink)",
              border: "1px solid var(--color-border)",
              boxShadow: "inset 0 1px 3px oklch(22% 0.02 60 / 0.04)",
            }}
            aria-describedby="char-count"
          />
          <span
            id="char-count"
            className="absolute bottom-3 right-4 font-[family-name:var(--font-inter-tight)] text-xs"
            style={{
              color:
                remaining < 40 ? "var(--color-ember)" : "var(--color-ink-dim)",
            }}
            aria-live="polite"
          >
            {remaining}
          </span>
        </div>
      </div>

      {/* Image attachment */}
      <ImageDropZone
        onFile={handleFile}
        onClear={handleClearImage}
        preview={imagePreview}
      />

      {/* Emotion chips */}
      <EmotionPicker value={emotion} onChange={setEmotion} />

      {/* Error */}
      {error && (
        <p
          role="alert"
          className="font-[family-name:var(--font-inter-tight)] text-sm text-[var(--color-ink-mid)] border-l-2 pl-3"
          style={{ borderColor: "var(--color-ember)" }}
        >
          {error}
        </p>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <p className="font-[family-name:var(--font-inter-tight)] text-xs text-[var(--color-ink-dim)] max-w-xs leading-relaxed">
          Your fragment is anonymous. No account needed.
        </p>
        <Button
          type="submit"
          disabled={!canSubmit() || isPending}
          size="lg"
        >
          {isPending ? "Drifting…" : "Release ↗"}
        </Button>
      </div>
    </form>
  );
}

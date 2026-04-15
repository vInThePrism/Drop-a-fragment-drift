"use client";

import type { EmotionTag } from "@/lib/validation/fragmentSchema";

interface EmotionPickerProps {
  value: EmotionTag | null;
  onChange: (emotion: EmotionTag) => void;
}

const emotions: { id: EmotionTag; label: string; color: string }[] = [
  { id: "restless", label: "restless", color: "var(--color-restless)" },
  { id: "tender",   label: "tender",   color: "var(--color-tender)" },
  { id: "grief",    label: "grief",    color: "var(--color-grief)" },
  { id: "longing",  label: "longing",  color: "var(--color-longing)" },
  { id: "wonder",   label: "wonder",   color: "var(--color-wonder)" },
];

export function EmotionPicker({ value, onChange }: EmotionPickerProps) {
  return (
    <fieldset>
      <legend className="font-[family-name:var(--font-inter-tight)] text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-ink-dim)] mb-3">
        Emotional register
      </legend>
      <div className="flex flex-wrap gap-2" role="group">
        {emotions.map(({ id, label, color }) => {
          const selected = value === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-pressed={selected}
              className="px-4 py-1.5 rounded-full text-sm font-[family-name:var(--font-inter-tight)] font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer"
              style={{
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: selected ? color : "var(--color-border)",
                backgroundColor: selected ? `color-mix(in oklch, ${color} 12%, white)` : "transparent",
                color: selected ? color : "var(--color-ink-mid)",
                outline: selected ? `2px solid ${color}` : undefined,
                outlineOffset: selected ? "2px" : undefined,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

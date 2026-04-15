import type { EmotionTag } from "@/lib/validation/fragmentSchema";

interface TagProps {
  emotion: EmotionTag;
  className?: string;
}

const emotionStyles: Record<EmotionTag, { color: string; label: string }> = {
  restless: { color: "var(--color-restless)", label: "restless" },
  tender:   { color: "var(--color-tender)",   label: "tender" },
  grief:    { color: "var(--color-grief)",     label: "grief" },
  longing:  { color: "var(--color-longing)",   label: "longing" },
  wonder:   { color: "var(--color-wonder)",    label: "wonder" },
};

export function Tag({ emotion, className = "" }: TagProps) {
  const { color, label } = emotionStyles[emotion];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-[family-name:var(--font-inter-tight)] text-xs font-semibold tracking-wide uppercase ${className}`}
      style={{ color }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      {label}
    </span>
  );
}

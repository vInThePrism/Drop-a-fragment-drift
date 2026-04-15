interface DriftMetaProps {
  sharedDimension: "emotion" | "theme";
  sharedValue: string;
}

export function DriftMeta({ sharedDimension, sharedValue }: DriftMetaProps) {
  return (
    <div
      className="flex flex-col gap-1 px-5 py-4 rounded-xl"
      style={{
        border: "1px solid var(--color-border)",
        backgroundColor: "oklch(97% 0.012 80 / 0.6)",
      }}
    >
      <p className="font-[family-name:var(--font-inter-tight)] text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-ink-dim)]">
        Matched on
      </p>
      <p className="font-[family-name:var(--font-inter-tight)] text-sm text-[var(--color-ink-mid)]">
        <span className="font-semibold text-[var(--color-ink)]">
          {sharedDimension === "emotion" ? "Emotion" : "Theme"}
        </span>{" "}
        — <em>{sharedValue}</em>
      </p>
      <p className="font-[family-name:var(--font-inter-tight)] text-xs text-[var(--color-ink-dim)] leading-relaxed mt-1">
        Everything else is different. That's the point.
      </p>
    </div>
  );
}

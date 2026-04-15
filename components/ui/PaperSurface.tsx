import { ReactNode } from "react";

interface PaperSurfaceProps {
  children: ReactNode;
  rotate?: number;
  className?: string;
  grain?: boolean;
}

export function PaperSurface({
  children,
  rotate = -0.6,
  className = "",
  grain = true,
}: PaperSurfaceProps) {
  return (
    <div
      className={`relative bg-[var(--color-surface)] rounded-2xl overflow-hidden ${className}`}
      style={{
        transform: `rotate(${rotate}deg)`,
        boxShadow:
          "0 4px 6px -1px oklch(22% 0.02 60 / 0.06), 0 12px 28px -4px oklch(22% 0.02 60 / 0.10), 0 24px 56px -8px oklch(22% 0.02 60 / 0.08)",
        border: "1px solid oklch(88% 0.01 80)",
      }}
    >
      {grain && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px 128px",
            opacity: 0.6,
            mixBlendMode: "multiply",
          }}
        />
      )}
      <div className="relative z-20">{children}</div>
    </div>
  );
}

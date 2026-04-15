import { PaperSurface } from "@/components/ui/PaperSurface";
import { Tag } from "@/components/ui/Tag";
import type { Fragment } from "@/lib/validation/fragmentSchema";

interface FragmentCardProps {
  fragment: Fragment;
  rotate?: number;
  animate?: boolean;
}

export function FragmentCard({
  fragment,
  rotate = -0.6,
  animate = false,
}: FragmentCardProps) {
  return (
    <PaperSurface
      rotate={rotate}
      className={animate ? "drift-in" : ""}
      grain
    >
      <div className="px-8 py-10 md:px-10 md:py-12">
        {/* Emotion tag */}
        <div className="mb-6">
          <Tag emotion={fragment.userTag} />
        </div>

        {/* Image if present */}
        {fragment.content.imageUrl && (
          <div className="mb-6 rounded-lg overflow-hidden border border-[var(--color-border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fragment.content.imageUrl}
              alt="Fragment image"
              className="w-full object-cover max-h-60"
              loading="eager"
            />
          </div>
        )}

        {/* Fragment text */}
        {fragment.content.text && (
          <blockquote
            className="font-[family-name:var(--font-fraunces)] text-[var(--color-ink)] leading-relaxed"
            style={{
              fontSize: "clamp(1.2rem, 0.9rem + 1.2vw, 1.6rem)",
              fontVariationSettings: "'SOFT' 40",
              letterSpacing: "-0.01em",
            }}
          >
            {fragment.content.text}
          </blockquote>
        )}

        {/* Theme hint */}
        {fragment.analysis?.theme && (
          <p
            className="mt-6 font-[family-name:var(--font-inter-tight)] text-xs text-[var(--color-ink-dim)] tracking-wide"
            aria-label={`Theme: ${fragment.analysis.theme}`}
          >
            — {fragment.analysis.theme}
          </p>
        )}
      </div>
    </PaperSurface>
  );
}

interface DriftMarkProps {
  className?: string;
  size?: number;
}

export function DriftMark({ className = "", size = 32 }: DriftMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Drift"
    >
      {/* A stylised drifting wave / message-in-a-bottle shape */}
      <circle
        cx="16"
        cy="16"
        r="14"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.25"
      />
      <path
        d="M8 16 Q10 12 14 16 Q18 20 22 16 Q24 13 24 16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="16" cy="9" r="1.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

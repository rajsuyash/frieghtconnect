import { cn } from "@/lib/utils";

// Cool, in-family tones so the logo set reads as a cohesive premium wall
// rather than a rainbow. Index is derived deterministically from the name.
const TONES = [
  { from: "#0f172a", to: "#1e293b" }, // navy
  { from: "#0369a1", to: "#0284c7" }, // ocean
  { from: "#0e7490", to: "#0891b2" }, // teal
  { from: "#334155", to: "#475569" }, // slate
  { from: "#075985", to: "#0369a1" }, // deep ocean
];

function initials(name: string) {
  const words = name.replace(/[^a-zA-Z ]/g, "").trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function toneFor(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return TONES[sum % TONES.length];
}

/** Deterministic monogram mark for an (invented) forwarder brand. */
export function Monogram({
  name,
  size = 48,
  rounded = "rounded-xl",
  className,
}: {
  name: string;
  size?: number;
  rounded?: string;
  className?: string;
}) {
  const tone = toneFor(name);
  const id = `mg-${name.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden",
        rounded,
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size} height={size} viewBox="0 0 48 48" role="presentation">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={tone.from} />
            <stop offset="100%" stopColor={tone.to} />
          </linearGradient>
        </defs>
        <rect width="48" height="48" fill={`url(#${id})`} />
        <text
          x="50%"
          y="52%"
          dominantBaseline="central"
          textAnchor="middle"
          fontFamily="var(--font-outfit), sans-serif"
          fontSize="18"
          fontWeight="600"
          fill="#ffffff"
        >
          {initials(name)}
        </text>
      </svg>
    </span>
  );
}

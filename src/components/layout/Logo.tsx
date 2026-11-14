import { useId } from "react";
import { cn } from "@/lib/utils";

type LogoProps = {
  /** Mark size in px. */
  size?: number;
  showWordmark?: boolean;
  className?: string;
};

/**
 * Original FlameSight mark: a spherical flame (how a flame burns in microgravity)
 * with a thin cyan orbit ring. Not derived from any agency insignia.
 */
function Logo({ size = 36, showWordmark = true, className }: LogoProps) {
  const id = useId();
  const flame = `${id}-flame`;
  const core = `${id}-core`;
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden={showWordmark ? true : undefined}
        role={showWordmark ? undefined : "img"}
        aria-label={showWordmark ? undefined : "FlameSight"}
      >
        <defs>
          <radialGradient id={flame} cx="0.42" cy="0.4" r="0.62">
            <stop offset="0" stopColor="var(--fs-ember-glow)" />
            <stop offset="0.55" stopColor="var(--fs-ember)" />
            <stop offset="1" stopColor="var(--fs-ember)" stopOpacity="0.15" />
          </radialGradient>
          <radialGradient id={core} cx="0.4" cy="0.38" r="0.5">
            <stop offset="0" stopColor="var(--fs-text)" stopOpacity="0.95" />
            <stop offset="1" stopColor="var(--fs-ember-glow)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="24" cy="24" r="15" fill={`url(#${flame})`} />
        <circle cx="21" cy="20.5" r="7" fill={`url(#${core})`} />
        <ellipse
          cx="24"
          cy="24"
          rx="22"
          ry="7.5"
          transform="rotate(-20 24 24)"
          stroke="var(--fs-cyan)"
          strokeWidth="1.5"
          opacity="0.9"
        />
        <circle cx="44.4" cy="17.2" r="2" fill="var(--fs-cyan)" />
      </svg>
      {showWordmark ? (
        <span className="text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
          Flame<span className="text-ember">Sight</span>
        </span>
      ) : null}
    </span>
  );
}

export { Logo };

import type { CSSProperties } from "react";
import type { EffectId } from "@/lib/design";
import { HeartSolid, PetalSolid, SparkleSolid } from "./Icons";

// Fixed positions keep server and client markup identical.
const DRIFT = [
  { left: 6, size: 14, duration: 22, delay: 0, opacity: 0.35 },
  { left: 14, size: 22, duration: 28, delay: 6, opacity: 0.25 },
  { left: 27, size: 12, duration: 19, delay: 11, opacity: 0.4 },
  { left: 41, size: 18, duration: 26, delay: 3, opacity: 0.2 },
  { left: 58, size: 13, duration: 21, delay: 14, opacity: 0.35 },
  { left: 69, size: 24, duration: 30, delay: 8, opacity: 0.22 },
  { left: 80, size: 15, duration: 23, delay: 1, opacity: 0.35 },
  { left: 91, size: 19, duration: 27, delay: 12, opacity: 0.25 },
];

const SCATTER = [
  { left: 8, top: 14, size: 14, delay: 0 },
  { left: 22, top: 62, size: 10, delay: 1.6 },
  { left: 35, top: 28, size: 18, delay: 3.1 },
  { left: 47, top: 82, size: 12, delay: 0.8 },
  { left: 63, top: 18, size: 16, delay: 2.4 },
  { left: 74, top: 56, size: 11, delay: 4 },
  { left: 86, top: 30, size: 15, delay: 1.2 },
  { left: 93, top: 76, size: 12, delay: 3.6 },
  { left: 15, top: 88, size: 13, delay: 2.9 },
  { left: 56, top: 44, size: 9, delay: 4.6 },
];

const CONFETTI_COLORS = ["var(--fx-color)", "#F2C14E", "#F78FB3", "#7FD1C7", "#A78BFA"];

export default function FloatingEffect({
  effect,
  color = "var(--color-rose)",
  className = "",
}: {
  effect: EffectId;
  color?: string;
  className?: string;
}) {
  if (effect === "none") return null;

  return (
    <div
      aria-hidden
      style={{ "--fx-color": color, color } as CSSProperties}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {effect === "hearts" &&
        DRIFT.map((h, i) => (
          <HeartSolid key={i} className="absolute -bottom-10 animate-float-heart opacity-0" style={drift(h)} />
        ))}

      {effect === "bubbles" &&
        DRIFT.map((h, i) => (
          <span
            key={i}
            className="absolute -bottom-10 animate-float-heart rounded-full border-[1.5px] border-current bg-current/10 opacity-0"
            style={drift({ ...h, size: h.size * 1.4, opacity: h.opacity + 0.15 })}
          />
        ))}

      {effect === "petals" &&
        DRIFT.map((h, i) => (
          <PetalSolid
            key={i}
            className="absolute -top-10 animate-fall opacity-0"
            style={drift({ ...h, opacity: h.opacity + 0.1 }, i % 2 ? 40 : -40)}
          />
        ))}

      {effect === "confetti" &&
        [...DRIFT, ...DRIFT.map((h) => ({ ...h, left: (h.left + 47) % 100, delay: h.delay + 5 }))].map((h, i) => (
          <span
            key={i}
            className="absolute -top-6 animate-fall rounded-[2px] opacity-0"
            style={{
              ...drift({ ...h, duration: h.duration * 0.55, opacity: 0.7 }, i % 2 ? 60 : -60),
              width: h.size * 0.45,
              height: h.size * 0.8,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            }}
          />
        ))}

      {effect === "sparkles" &&
        SCATTER.map((s, i) => (
          <SparkleSolid key={i} className="absolute animate-twinkle opacity-0" style={twinkle(s, 1.4)} />
        ))}

      {effect === "stars" && (
        <>
          {SCATTER.flatMap((s, i) => [s, { ...s, left: (s.left + 31) % 100, top: (s.top + 47) % 100, delay: s.delay + 2.2 + i * 0.1 }]).map((s, i) => (
            <span
              key={i}
              className="absolute animate-twinkle rounded-full bg-current opacity-0"
              style={twinkle({ ...s, size: 2 + (i % 3) }, 1)}
            />
          ))}
          {SCATTER.slice(0, 4).map((s, i) => (
            <SparkleSolid key={`s${i}`} className="absolute animate-twinkle opacity-0" style={twinkle({ ...s, left: 100 - s.left, top: 100 - s.top }, 1)} />
          ))}
        </>
      )}
    </div>
  );
}

function drift(h: (typeof DRIFT)[number], sway = 0): CSSProperties {
  return {
    left: `${h.left}%`,
    width: h.size,
    height: h.size,
    animationDuration: `${h.duration}s`,
    animationDelay: `${h.delay}s`,
    "--fx-opacity": h.opacity,
    "--fx-sway": `${sway}px`,
  } as CSSProperties;
}

function twinkle(s: (typeof SCATTER)[number], scale: number): CSSProperties {
  return {
    left: `${s.left}%`,
    top: `${s.top}%`,
    width: s.size * scale,
    height: s.size * scale,
    animationDelay: `${s.delay}s`,
    animationDuration: `${3.5 + (s.left % 4)}s`,
  } as CSSProperties;
}

import type { ReactElement, SVGProps } from "react";
import type { OccasionId } from "@/lib/gifts";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
  "aria-hidden": true,
} as const;

export function HeartIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20.25s-7.5-4.6-7.5-10.1A4.15 4.15 0 0 1 12 7.6a4.15 4.15 0 0 1 7.5 2.55c0 5.5-7.5 10.1-7.5 10.1Z" />
    </svg>
  );
}

export function HeartSolid(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 21s-8.25-5.05-8.25-11.1A4.6 4.6 0 0 1 12 6.95a4.6 4.6 0 0 1 8.25 2.95C20.25 15.95 12 21 12 21Z" />
    </svg>
  );
}

export function CakeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20.25h16M5.25 20.25v-6.5a1.5 1.5 0 0 1 1.5-1.5h10.5a1.5 1.5 0 0 1 1.5 1.5v6.5" />
      <path d="M5.25 15.5c1.17 0 1.17.9 2.34.9s1.17-.9 2.33-.9 1.17.9 2.33.9 1.17-.9 2.33-.9 1.17.9 2.34.9 1.16-.9 2.33-.9M12 12.25V9M12 6.75c-.75 0-1.25-.6-1.25-1.25S12 3.5 12 3.5s1.25 1.35 1.25 2-.5 1.25-1.25 1.25Z" />
    </svg>
  );
}

export function EnvelopeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5.25" width="18" height="13.5" rx="1.75" />
      <path d="m3.5 6.25 7.4 5.9a1.75 1.75 0 0 0 2.2 0l7.4-5.9" />
    </svg>
  );
}

export function RingsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="14" r="5.25" />
      <circle cx="15" cy="14" r="5.25" />
      <path d="m10.5 4.5 1.5-1.75 1.5 1.75-1.5 2.25-1.5-2.25Z" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 12h15m0 0-5.25-5.25M19.5 12l-5.25 5.25" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M19.5 12h-15m0 0 5.25 5.25M4.5 12l5.25-5.25" />
    </svg>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.75c.4 3.9 1.6 5.6 5.25 6.25-3.65.65-4.85 2.35-5.25 6.25-.4-3.9-1.6-5.6-5.25-6.25 3.65-.65 4.85-2.35 5.25-6.25ZM18.5 15.5c.2 1.6.7 2.3 2.25 2.5-1.55.25-2.05.9-2.25 2.5-.2-1.6-.7-2.25-2.25-2.5 1.55-.2 2.05-.9 2.25-2.5Z" />
    </svg>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m4.5 12.75 5 5 10-11.5" />
    </svg>
  );
}

export function PenIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m15.25 5.25 3.5 3.5M4.5 19.5l1-4.25L16.1 4.65a1.5 1.5 0 0 1 2.12 0l1.13 1.13a1.5 1.5 0 0 1 0 2.12L8.75 18.5 4.5 19.5Z" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12 18.25 18.75 12 18.75 2.25 12 2.25 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20.25 14.5A8.25 8.25 0 0 1 9.5 3.75a8.25 8.25 0 1 0 10.75 10.75Z" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.75v2M12 19.25v2M2.75 12h2M19.25 12h2M5.46 5.46l1.41 1.41M17.13 17.13l1.41 1.41M5.46 18.54l1.41-1.41M17.13 6.87l1.41-1.41" />
    </svg>
  );
}

export function GiftBoxIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.75" y="8.25" width="16.5" height="4" rx="1" />
      <path d="M5.25 12.25v7a1 1 0 0 0 1 1h11.5a1 1 0 0 0 1-1v-7M12 8.25v12M12 8.25S10.5 3.75 8 4.5c-1.9.57-1.3 3.75 4 3.75ZM12 8.25s1.5-4.5 4-3.75c1.9.57 1.3 3.75-4 3.75Z" />
    </svg>
  );
}

export function TulipIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21v-8.5M12 12.5c-3 0-5-2.2-5-5.5V4.5l2.5 1.75L12 3.5l2.5 2.75L17 4.5V7c0 3.3-2 5.5-5 5.5ZM12 17.5c-1.5-2-3.75-2.75-6-2.5.25 2.75 2.75 4.25 6 4M12 17.5c1.5-2 3.75-2.75 6-2.5-.25 2.75-2.75 4.25-6 4" />
    </svg>
  );
}

export function DaisyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx="12" cy="5.9" rx="2.1" ry="3.1" transform={`rotate(${a} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="2.3" fill="currentColor" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.65l5.9-.85L12 3.5Z" />
    </svg>
  );
}

export function SparkleSolid(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2c.55 5.2 2.3 7.45 8 8.5-5.7 1.05-7.45 3.3-8 8.5-.55-5.2-2.3-7.45-8-8.5 5.7-1.05 7.45-3.3 8-8.5Z" />
    </svg>
  );
}

export function PetalSolid(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2C6.5 6 5.5 13.5 12 22c6.5-8.5 5.5-16 0-20Z" />
    </svg>
  );
}

export function PaletteIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.75a8.25 8.25 0 0 0 0 16.5c1.1 0 1.65-.8 1.65-1.6 0-.9-.75-1.35-.75-2.25 0-.95.75-1.65 1.75-1.65h1.85a3.75 3.75 0 0 0 3.75-3.75c0-4.1-3.7-7.25-8.25-7.25Z" />
      <circle cx="7.75" cy="11.25" r="1" fill="currentColor" />
      <circle cx="10.25" cy="7.5" r="1" fill="currentColor" />
      <circle cx="14.75" cy="7.75" r="1" fill="currentColor" />
    </svg>
  );
}

export function ShuffleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.75 7.5h3.1a3 3 0 0 1 2.45 1.27l5.4 7.46a3 3 0 0 0 2.45 1.27h3.1m0 0-2.5-2.5m2.5 2.5-2.5 2.5M3.75 16.5h3.1a3 3 0 0 0 2.45-1.27l.45-.63m4.5-6.2.45-.63a3 3 0 0 1 2.45-1.27h3.1m0 0L17.75 4m2.5 2.5L17.75 9" />
    </svg>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.75v11.5M12 3.75 8 7.75M12 3.75l4 4M5.25 12.75v5.5a2 2 0 0 0 2 2h9.5a2 2 0 0 0 2-2v-5.5" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return <EnvelopeIcon {...props} />;
}

export function ChatIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 18.75V6.75a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8.25L4.5 19.5Z" />
    </svg>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M19.5 12a7.5 7.5 0 0 1-13.6 4.35M4.5 12a7.5 7.5 0 0 1 13.6-4.35M18.1 3.75v3.9h-3.9M5.9 20.25v-3.9h3.9" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

const OCCASION_ICONS: Record<OccasionId, (props: IconProps) => ReactElement> = {
  birthday: CakeIcon,
  "love-letter": EnvelopeIcon,
  anniversary: RingsIcon,
  valentine: HeartIcon,
  "miss-you": MoonIcon,
  sorry: TulipIcon,
  "thank-you": GiftBoxIcon,
  congrats: StarIcon,
  "mothers-day": DaisyIcon,
  "just-because": SunIcon,
};

export function OccasionIcon({ occasion, ...props }: IconProps & { occasion: OccasionId }) {
  const Icon = OCCASION_ICONS[occasion] ?? EnvelopeIcon;
  return <Icon {...props} />;
}

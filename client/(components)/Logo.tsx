import Link from "next/link";
import { HeartSolid } from "./Icons";

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="Make Her Day — home">
      <span
        className={`grid size-8 place-items-center rounded-full transition-transform duration-300 group-hover:scale-105 ${
          light ? "bg-cream/10 text-blush" : "bg-burgundy text-cream"
        }`}
      >
        <HeartSolid className="size-3.5" />
      </span>
      <span
        className={`font-display text-[1.4rem] font-semibold tracking-tight ${light ? "text-cream" : "text-burgundy-deep"}`}
      >
        Make Her Day
      </span>
    </Link>
  );
}

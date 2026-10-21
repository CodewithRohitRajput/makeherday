import Link from "next/link";
import type { Occasion } from "@/lib/gifts";
import { ArrowRightIcon, OccasionIcon } from "./Icons";

const ART: Partial<Record<Occasion["id"], string>> = {
  birthday: "bg-[linear-gradient(150deg,#fcf6ec,#ebd6b5)] text-[#8a6332]",
  "love-letter": "bg-[linear-gradient(150deg,#fdf1ee,#efc9c9)] text-burgundy",
  anniversary: "bg-[linear-gradient(150deg,#7a2236,#3a0e19)] text-blush",
};

export default function GiftCard({ gift, index = 0 }: { gift: Occasion; index?: number }) {
  return (
    <Link
      href={`/create?type=${gift.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-white/60 shadow-soft transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-rose/40 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
    >
      <div className={`relative grid aspect-[16/10] place-items-center overflow-hidden ${ART[gift.id] ?? ART["love-letter"]}`}>
        <div
          aria-hidden
          className="absolute inset-6 rounded-2xl border border-current/15 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <span className="font-display absolute left-6 top-5 text-sm italic opacity-60">
          No. {String(index + 1).padStart(2, "0")}
        </span>
        <OccasionIcon
          occasion={gift.id}
          strokeWidth={1}
          className="size-20 transition-transform duration-700 ease-out group-hover:-translate-y-1 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-rose">{gift.tagline}</p>
        <h3 className="mt-2 font-display text-3xl font-medium text-burgundy-deep">{gift.name}</h3>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{gift.description}</p>
        <span className="mt-6 inline-flex items-center gap-2 pt-1 text-sm font-medium text-burgundy">
          Personalise this gift
          <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

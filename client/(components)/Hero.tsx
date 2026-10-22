import Link from "next/link";
import { designForOccasion, serializeDesign } from "@/lib/design";
import FloatingEffect from "./FloatingEffect";
import type { GiftContent } from "./GiftView";
import { ArrowRightIcon, RoseIcon, StarSolid } from "./Icons";
import RoseGift from "./rose/RoseGift";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_80%_20%,rgb(243_219_214/0.9),transparent_70%),radial-gradient(45%_45%_at_10%_90%,rgb(232_200_190/0.55),transparent_70%)]"
      />
      <FloatingEffect effect="hearts" className="-z-10" />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:pb-28 lg:pt-24">
        <div className="animate-fade-up text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-cream/70 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-burgundy">
            <RoseIcon className="size-4" />
            New · The Digital Rose
          </p>
          <h1 className="mt-6 font-display text-[2.9rem] font-medium leading-[1.02] tracking-tight text-burgundy-deep sm:text-6xl lg:text-[4.6rem]">
            Make her day <em className="font-normal text-rose">unforgettable.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg lg:mx-0">
            Send her a Digital Rose: a 3D rose that blooms out of a sealed envelope, with your words floating around it
            like fireflies. Made in two minutes, opened with one tap, remembered for years.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/create"
              className="group inline-flex h-13 items-center gap-2.5 rounded-full bg-burgundy px-7 text-[0.95rem] font-medium text-cream shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:bg-burgundy-deep"
            >
              <RoseIcon className="size-5" />
              Send a Digital Rose
              <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/#digital-rose"
              className="inline-flex h-13 items-center rounded-full border border-line bg-cream/60 px-7 text-[0.95rem] font-medium text-burgundy transition-colors hover:border-rose/50 hover:bg-cream"
            >
              See how it works
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted/80">No sign-up · Opens on any phone · No app to download</p>
        </div>

        <HeroArt />
      </div>
    </section>
  );
}

const DEMO: GiftContent = {
  giftType: "love-letter",
  senderName: "Arjun",
  recipientName: "Meera",
  message: "You are my favourite part of every day.",
  theme: serializeDesign({ ...designForOccasion("love-letter"), theme: "bordeaux", font: "script", reveal: "rose", rose: "red" }),
};

function HeroArt() {
  return (
    <div className="relative mx-auto w-full max-w-sm animate-fade-up [animation-delay:150ms] sm:max-w-md">
      <div aria-hidden className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(192_40_70/0.35),transparent)] blur-2xl" />

      <RoseGift gift={DEMO} demo />

      <div className="absolute -right-2 top-6 inline-flex animate-fade-up items-center gap-1.5 rounded-full border border-white/80 bg-white/95 px-3.5 py-2 text-xs font-semibold text-burgundy shadow-lift backdrop-blur [animation-delay:950ms] sm:-right-8">
        <StarSolid className="size-3.5 text-gold" />
        Popular · Best gift ever
      </div>

      <div className="absolute -left-2 bottom-16 flex animate-fade-up items-center gap-3 rounded-2xl border border-white/80 bg-white/95 py-2.5 pl-2.5 pr-4 shadow-lift backdrop-blur [animation-delay:700ms] sm:-left-12">
        <span className="grid size-9 place-items-center rounded-full bg-[linear-gradient(140deg,#c06476,#6b1d2f)] font-display text-lg italic text-cream">
          M
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-medium text-burgundy-deep">Meera opened her rose</span>
          <span className="block text-xs text-muted">Just now · watched it twice</span>
        </span>
      </div>
    </div>
  );
}

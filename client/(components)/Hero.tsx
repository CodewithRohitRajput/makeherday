import Link from "next/link";
import FloatingEffect from "./FloatingEffect";
import { ArrowRightIcon, HeartSolid, SparkleIcon } from "./Icons";

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
            <SparkleIcon className="size-3.5" />
            Digital keepsakes, made personal
          </p>
          <h1 className="mt-6 font-display text-[2.9rem] font-medium leading-[1.02] tracking-tight text-burgundy-deep sm:text-6xl lg:text-[4.6rem]">
            Make her day <em className="font-normal text-rose">unforgettable.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg lg:mx-0">
            Write a birthday surprise, love letter or anniversary note, design it down to the last detail, and send
            it as a private link she can open anywhere. It takes about two minutes.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/create"
              className="group inline-flex h-13 items-center gap-2.5 rounded-full bg-burgundy px-7 text-[0.95rem] font-medium text-cream shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:bg-burgundy-deep"
            >
              Create Your Surprise
              <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/#gifts"
              className="inline-flex h-13 items-center rounded-full border border-line bg-cream/60 px-7 text-[0.95rem] font-medium text-burgundy transition-colors hover:border-rose/50 hover:bg-cream"
            >
              Explore gifts
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted/80">No sign-up needed · 17 themes · 9 curated looks · Free to create</p>
        </div>

        <HeroArt />
      </div>
    </section>
  );
}

function HeroArt() {
  return (
    <div aria-hidden className="relative mx-auto aspect-[4/5] w-full max-w-sm animate-fade-up [animation-delay:150ms] sm:max-w-md">
      <div className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(230_170_180/0.45),transparent)] blur-2xl" />

      <div className="absolute inset-0 animate-drift">
        <div className="absolute inset-x-6 bottom-2 top-10 rotate-[-7deg] rounded-[1.75rem] bg-[linear-gradient(160deg,#6b1d2f,#3a0e19)] shadow-lift" />
        <div className="absolute inset-x-3 bottom-6 top-4 rotate-[4deg] rounded-[1.75rem] border border-gold/30 bg-[linear-gradient(160deg,#fcf6ec,#eedfc6)] shadow-soft" />

        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-[radial-gradient(120%_70%_at_100%_0%,rgb(255_255_255/0.7),transparent_60%),linear-gradient(160deg,#fdf4f1,#f6dedc)] p-8 shadow-lift sm:p-10">
          <div className="pointer-events-none absolute inset-3 rounded-[1.25rem] border border-rose/20" />

          <div className="flex items-start justify-between gap-4">
            <p className="pt-1 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-rose">
              A letter, sealed with love
            </p>
            <span className="grid h-14 w-12 shrink-0 rotate-6 place-items-center rounded-sm border-2 border-dashed border-rose/40 bg-white/70 text-rose shadow-soft">
              <HeartSolid className="size-5" />
            </span>
          </div>

          <p className="mt-3 font-display text-3xl font-medium italic text-burgundy-deep sm:text-4xl">My dearest Meera,</p>

          <div className="mt-4 flex items-center gap-3 text-rose/60">
            <span className="h-px w-10 bg-current" />
            <HeartSolid className="size-3" />
            <span className="h-px flex-1 bg-[linear-gradient(90deg,currentColor,transparent)]" />
          </div>

          <div className="mt-5 space-y-3 font-display text-lg leading-relaxed text-ink/80 sm:text-xl">
            <p>You are my favourite part of every day, the calm in my busiest weeks, and the laugh I hear in my head.</p>
            <p className="hidden sm:block">Thank you for making everything feel like home.</p>
          </div>

          <div className="mt-auto flex items-end justify-between border-t border-rose/20 pt-5">
            <div>
              <p className="text-xs text-muted">With all my love,</p>
              <p className="font-display text-3xl italic text-burgundy">Arjun</p>
            </div>
            <span className="relative grid size-16 -rotate-12 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#a8445c,#6b1d2f_55%,#3a0e19)] text-blush shadow-[0_6px_16px_-4px_rgb(76_18_32/0.55),inset_0_-3px_6px_rgb(0_0_0/0.25)]">
              <span className="absolute inset-1.5 rounded-full border border-blush/30" />
              <HeartSolid className="size-6" />
            </span>
          </div>
        </div>
      </div>

      <div className="absolute -left-2 bottom-20 flex animate-fade-up items-center gap-3 rounded-2xl border border-white/80 bg-white/90 py-2.5 pl-2.5 pr-4 shadow-lift backdrop-blur [animation-delay:700ms] sm:-left-12">
        <span className="grid size-9 place-items-center rounded-full bg-[linear-gradient(140deg,#c06476,#6b1d2f)] font-display text-lg italic text-cream">
          M
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-medium text-burgundy-deep">Meera opened your surprise</span>
          <span className="block text-xs text-muted">Just now · read twice</span>
        </span>
      </div>

      <div className="absolute -right-2 top-16 inline-flex animate-fade-up items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-3.5 py-2 text-xs font-medium text-burgundy shadow-soft backdrop-blur [animation-delay:950ms] sm:-right-8">
        <SparkleIcon className="size-3.5 text-gold" />
        Opens with an envelope reveal
      </div>
    </div>
  );
}

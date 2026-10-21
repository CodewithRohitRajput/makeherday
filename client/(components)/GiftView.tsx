"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { designStyle, getFont, parseDesign, type Design, type EffectId, type RevealId, type SealId } from "@/lib/design";
import { getOccasion, type GiftType, type Occasion, type OccasionId } from "@/lib/gifts";
import { HeartSolid, OccasionIcon, PetalSolid, SparkleSolid } from "./Icons";

export interface GiftContent {
  giftType: GiftType;
  senderName: string;
  recipientName: string;
  message: string;
  /** Serialised Design (see lib/design.ts). */
  theme: string;
}

interface GiftViewProps {
  gift: GiftContent;
  /** Start with the sealed envelope and let the viewer open it. */
  sealed?: boolean;
  /** Smaller card used for the live preview next to the form. */
  compact?: boolean;
}

type Phase = "closed" | "opening" | "open";

/** How long each reveal animation plays before the card appears. */
const OPEN_DELAY: Record<RevealId, number> = { seal: 450, envelope: 1150, giftbox: 850, none: 0 };

interface Ctx {
  design: Design;
  occasion: Occasion;
  recipient: string;
  sender: string;
  message: string;
  compact: boolean;
}

export default function GiftView({ gift, sealed = false, compact = false }: GiftViewProps) {
  const design = useMemo(() => parseDesign(gift.theme, gift.giftType), [gift.theme, gift.giftType]);
  const [phase, setPhase] = useState<Phase>(!sealed || design.reveal === "none" ? "open" : "closed");
  const [celebrate, setCelebrate] = useState(sealed && design.reveal === "none" && design.burst);

  useEffect(() => {
    if (phase !== "opening") return;
    const timer = setTimeout(() => {
      setPhase("open");
      setCelebrate(design.burst);
    }, OPEN_DELAY[design.reveal]);
    return () => clearTimeout(timer);
  }, [phase, design.reveal, design.burst]);

  const ctx: Ctx = {
    design,
    occasion: getOccasion(design.occasion),
    recipient: gift.recipientName.trim() || "her name",
    sender: gift.senderName.trim() || "your name",
    message: gift.message.trim(),
    compact,
  };

  if (phase !== "open") {
    return <Reveal ctx={ctx} opening={phase === "opening"} onOpen={() => setPhase("opening")} />;
  }

  const Card = CARDS[design.layout];
  return (
    <div className={`relative mx-auto w-full ${compact ? "max-w-sm" : "max-w-xl"}`}>
      <Card ctx={ctx} />
      {celebrate && <Burst effect={design.effect} />}
    </div>
  );
}

/* ---------------------------------- Reveal ---------------------------------- */

function Reveal({ ctx, opening, onOpen }: { ctx: Ctx; opening: boolean; onOpen: () => void }) {
  const { design, recipient, sender } = ctx;
  const font = getFont(design.font);
  const hint = {
    seal: "Tap the seal to open",
    envelope: "Tap the envelope to open",
    giftbox: "Tap the box to unwrap",
    none: "",
  }[design.reveal];

  return (
    <div
      style={designStyle(design)}
      className="relative mx-auto flex aspect-[4/5] w-full max-w-md animate-unseal flex-col items-center justify-center overflow-hidden rounded-[2rem] p-8 text-center shadow-lift"
    >
      <div aria-hidden className="absolute inset-4 rounded-[1.5rem] border border-(--g-line)" />
      <p className="relative text-xs font-medium uppercase tracking-[0.24em] text-(--g-muted)">Something special for</p>
      <p
        className="g-heading relative mt-2 max-w-full break-words leading-tight"
        style={{ fontSize: `calc(clamp(2.4rem, 9vw, 3rem) * ${font.headingScale})` }}
      >
        {recipient}
      </p>

      <div className={`relative grid place-items-center ${design.reveal === "seal" ? "mt-10" : "mt-8"}`}>
        {design.reveal === "seal" && <WaxSeal ctx={ctx} opening={opening} onOpen={onOpen} />}
        {design.reveal === "envelope" && <Envelope ctx={ctx} opening={opening} onOpen={onOpen} />}
        {design.reveal === "giftbox" && <GiftBox ctx={ctx} opening={opening} onOpen={onOpen} />}
      </div>

      <p className={`relative mt-6 text-sm text-(--g-muted) transition-opacity ${opening ? "opacity-0" : ""}`}>{hint}</p>
      <p className="absolute bottom-9 text-sm">
        from <span className="g-heading text-xl">{sender}</span>
      </p>
    </div>
  );
}

interface RevealPartProps {
  ctx: Ctx;
  opening: boolean;
  onOpen: () => void;
}

const sealFill = "radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--g-seal) 72%, white), var(--g-seal) 72%)";
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--g-accent)";

function WaxSeal({ ctx, opening, onOpen }: RevealPartProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={opening}
      aria-label="Open your gift"
      style={{ background: sealFill }}
      className={`group relative grid size-24 place-items-center rounded-full text-(--g-seal-ink) shadow-lift transition-transform duration-500 hover:scale-105 ${focusRing} ${
        opening ? "animate-seal-pop" : ""
      }`}
    >
      {!opening && (
        <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-(--g-seal)/30 [animation-duration:2.4s]" />
      )}
      <span aria-hidden className="absolute inset-2 rounded-full border border-(--g-seal-ink)/25" />
      <Emblem kind={ctx.design.seal} ctx={ctx} size={36} className="relative transition-transform duration-500 group-hover:scale-110" />
    </button>
  );
}

function Envelope({ ctx, opening, onOpen }: RevealPartProps) {
  const paper = (amount: number) => `color-mix(in srgb, var(--g-seal) ${amount}%, white)`;
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={opening}
      aria-label="Open your gift"
      className={`group relative aspect-[4/3] w-60 drop-shadow-[0_18px_24px_rgb(0_0_0/0.18)] [perspective:900px] sm:w-64 ${focusRing} ${
        opening ? "" : "animate-wiggle"
      }`}
    >
      <span aria-hidden className="absolute inset-0 rounded-md" style={{ background: paper(38) }} />
      <span
        aria-hidden
        className={`absolute inset-x-4 bottom-2 top-3 z-10 rounded-sm bg-[#fffdf8] p-4 shadow-sm ${opening ? "animate-letter-rise" : ""}`}
      >
        <span className="block h-1.5 w-1/2 rounded-full bg-(--g-accent)/40" />
        <span className="mt-2.5 block h-1 w-full rounded-full bg-(--g-accent)/20" />
        <span className="mt-2 block h-1 w-4/5 rounded-full bg-(--g-accent)/20" />
        <span className="mt-2 block h-1 w-11/12 rounded-full bg-(--g-accent)/20" />
      </span>
      <span
        aria-hidden
        className="absolute inset-0 z-20 rounded-md"
        style={{ background: paper(26), clipPath: "polygon(0 0, 50% 56%, 100% 0, 100% 100%, 0 100%)" }}
      />
      <span
        aria-hidden
        className={`absolute inset-x-0 top-0 z-30 h-[58%] origin-top ${opening ? "animate-flap-open" : ""}`}
        style={{ background: paper(48), clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
      />
      <span
        style={{ background: sealFill }}
        className={`absolute left-1/2 top-[58%] z-40 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-(--g-seal-ink) shadow-md transition-transform duration-500 group-hover:scale-110 ${
          opening ? "animate-seal-pop" : ""
        }`}
      >
        <Emblem kind={ctx.design.seal} ctx={ctx} size={22} />
      </span>
    </button>
  );
}

function GiftBox({ ctx, opening, onOpen }: RevealPartProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={opening}
      aria-label="Open your gift"
      className={`group relative h-48 w-52 drop-shadow-[0_18px_24px_rgb(0_0_0/0.18)] ${focusRing} ${opening ? "" : "animate-wiggle"}`}
    >
      {opening && (
        <span aria-hidden className="absolute inset-x-6 top-[30%] h-10 rounded-full bg-(--g-accent)/50 blur-2xl" />
      )}
      <span aria-hidden className="absolute inset-x-3 bottom-0 top-[34%] rounded-md bg-(--g-seal)" />
      <span aria-hidden className="absolute inset-x-3 top-[34%] h-3 bg-black/10" />
      <span aria-hidden className="absolute bottom-0 left-1/2 top-[34%] w-7 -translate-x-1/2 bg-(--g-seal-ink)/85" />
      <span className="absolute left-1/2 top-[64%] grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-(--g-seal-ink) text-(--g-seal) shadow-md">
        <Emblem kind={ctx.design.seal} ctx={ctx} size={20} />
      </span>
      <span aria-hidden className={`absolute inset-x-0 top-[20%] h-[16%] ${opening ? "animate-lid-off" : ""}`}>
        <span className="absolute inset-0 rounded-md" style={{ background: "color-mix(in srgb, var(--g-seal) 85%, white)" }} />
        <span className="absolute inset-y-0 left-1/2 w-7 -translate-x-1/2 bg-(--g-seal-ink)" />
        <svg viewBox="0 0 96 48" className="absolute bottom-[85%] left-1/2 w-24 -translate-x-1/2 text-(--g-seal-ink)">
          <path fill="currentColor" d="M48 42C30 10 5 13 13 33c4 10 22 10 35 9ZM48 42c18-32 43-29 35-9-4 10-22 10-35 9Z" />
          <path fill="none" stroke="var(--g-seal)" strokeOpacity="0.25" strokeWidth="1.5" d="M48 42C34 22 20 20 20 30M48 42c14-20 28-22 28-12" />
          <circle cx="48" cy="41" r="6.5" fill="currentColor" />
        </svg>
      </span>
    </button>
  );
}

export function Emblem({
  kind,
  ctx,
  size,
  className = "",
}: {
  kind: SealId;
  ctx: { sender: string; occasion: { id: OccasionId } };
  size: number;
  className?: string;
}) {
  const initial = ctx.sender.trim().charAt(0).toUpperCase();
  const box = { width: size, height: size };
  if (kind === "initial" && initial && ctx.sender !== "your name") {
    return (
      <span
        className={`grid place-items-center font-display font-semibold italic leading-none ${className}`}
        style={{ ...box, fontSize: size * 1.05 }}
      >
        {initial}
      </span>
    );
  }
  if (kind === "icon") return <OccasionIcon occasion={ctx.occasion.id} strokeWidth={1.6} className={className} style={box} />;
  if (kind === "star") return <SparkleSolid className={className} style={box} />;
  return <HeartSolid className={className} style={box} />;
}

/* ---------------------------------- Burst ----------------------------------- */

const BURST_COLORS = ["var(--g-accent)", "var(--g-seal)", "#F2C14E", "#F78FB3", "#7FD1C7"];

function Burst({ effect }: { effect: EffectId }) {
  const Shape = effect === "hearts" ? HeartSolid : effect === "petals" ? PetalSolid : effect === "sparkles" || effect === "stars" ? SparkleSolid : null;
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-[38%] z-20">
      {Array.from({ length: 28 }, (_, i) => {
        const angle = (i / 28) * Math.PI * 2 + (i % 3) * 0.2;
        const distance = 120 + ((i * 37) % 110);
        const style = {
          "--bx": `${Math.cos(angle) * distance}px`,
          "--by": `${Math.sin(angle) * distance - 40}px`,
          "--br": `${(i % 2 ? 1 : -1) * (180 + i * 12)}deg`,
          color: BURST_COLORS[i % BURST_COLORS.length],
          animationDelay: `${(i % 4) * 40}ms`,
        } as CSSProperties;
        return Shape ? (
          <Shape key={i} className="absolute left-0 top-0 size-4 animate-burst" style={style} />
        ) : (
          <span key={i} className="absolute left-0 top-0 h-3.5 w-2 animate-burst rounded-[2px] bg-current" style={style} />
        );
      })}
    </div>
  );
}

/* ---------------------------------- Cards ----------------------------------- */

function frameClass(ctx: Ctx, radius = "rounded-[2rem]", compactRadius = "rounded-[1.5rem]") {
  return `relative flex w-full animate-unseal flex-col overflow-hidden shadow-lift ${ctx.compact ? compactRadius : radius} ${
    ctx.design.align === "center" ? "items-center text-center" : "text-left"
  }`;
}

function Heading({ ctx, scale = 1, className = "" }: { ctx: Ctx; scale?: number; className?: string }) {
  const s = scale * getFont(ctx.design.font).headingScale;
  const fontSize = ctx.compact ? `${1.85 * s}rem` : `calc(clamp(2.1rem, 6.5vw, 3rem) * ${s})`;
  return (
    <h2 className={`g-heading relative max-w-full break-words leading-[1.12] ${className}`} style={{ fontSize }}>
      {ctx.design.heading || ctx.occasion.heading(ctx.recipient)}
    </h2>
  );
}

function Message({ ctx, className = "" }: { ctx: Ctx; className?: string }) {
  const s = getFont(ctx.design.font).bodyScale;
  const fontSize = ctx.compact ? `${1.1 * s}rem` : `calc(clamp(1.12rem, 3.4vw, 1.4rem) * ${s})`;
  return (
    <p
      className={`g-body relative max-w-full whitespace-pre-line break-words leading-relaxed opacity-90 ${
        ctx.message ? "" : "italic text-(--g-muted)"
      } ${className}`}
      style={{ fontSize }}
    >
      {ctx.message || "Your message will appear here…"}
    </p>
  );
}

function Postscript({ ctx, className = "" }: { ctx: Ctx; className?: string }) {
  if (!ctx.design.postscript) return null;
  return (
    <p className={`g-body relative max-w-full break-words text-(--g-muted) ${ctx.compact ? "text-base" : "text-lg"} ${className}`}>
      <span className="font-semibold text-(--g-accent)">P.S. </span>
      {ctx.design.postscript}
    </p>
  );
}

function DateLine({ ctx, className = "" }: { ctx: Ctx; className?: string }) {
  if (!ctx.design.date) return null;
  return <p className={`relative text-[0.7rem] font-medium uppercase tracking-[0.2em] text-(--g-muted) ${className}`}>{ctx.design.date}</p>;
}

function Eyebrow({ ctx, className = "" }: { ctx: Ctx; className?: string }) {
  return (
    <p className={`relative text-[0.68rem] font-medium uppercase tracking-[0.24em] text-(--g-accent) ${className}`}>
      {ctx.occasion.eyebrow}
    </p>
  );
}

function Signature({ ctx, className = "" }: { ctx: Ctx; className?: string }) {
  const s = getFont(ctx.design.font).headingScale;
  return (
    <div className={`relative ${className}`}>
      <p className="text-xs text-(--g-muted)">{ctx.design.signoff || ctx.occasion.signoff}</p>
      <p className="g-heading break-words text-(--g-accent)" style={{ fontSize: `${(ctx.compact ? 1.5 : 1.9) * s}rem` }}>
        {ctx.sender}
      </p>
    </div>
  );
}

function ClassicCard({ ctx }: { ctx: Ctx }) {
  const { compact } = ctx;
  const center = ctx.design.align === "center";
  return (
    <article style={designStyle(ctx.design)} className={`${frameClass(ctx)} ${compact ? "p-7" : "p-8 sm:p-12"}`}>
      <div
        aria-hidden
        className={`absolute border border-(--g-line) ${compact ? "inset-3 rounded-[1.1rem]" : "inset-4 rounded-[1.5rem]"}`}
      />
      <div className={`relative flex gap-4 ${center ? "flex-col-reverse items-center gap-3" : "w-full items-center justify-between"}`}>
        <Eyebrow ctx={ctx} />
        <OccasionIcon occasion={ctx.occasion.id} strokeWidth={1.2} className="size-6 shrink-0 text-(--g-accent)" />
      </div>
      <Heading ctx={ctx} className={compact ? "mt-5" : "mt-8"} />
      <DateLine ctx={ctx} className="mt-3" />
      <Message ctx={ctx} className={compact ? "mt-5" : "mt-8"} />
      <Postscript ctx={ctx} className="mt-5" />
      <footer
        className={`relative flex w-full gap-4 border-t border-(--g-line) ${compact ? "mt-7 pt-5" : "mt-12 pt-7"} ${
          center ? "flex-col-reverse items-center" : "items-end justify-between"
        }`}
      >
        <Signature ctx={ctx} />
        <HeartSolid className={`text-(--g-accent) ${compact ? "size-5" : "size-7"}`} />
      </footer>
    </article>
  );
}

function LetterCard({ ctx }: { ctx: Ctx }) {
  const { compact } = ctx;
  const center = ctx.design.align === "center";
  return (
    <article
      style={designStyle(ctx.design)}
      className={`${frameClass(ctx, "rounded-xl", "rounded-lg")} ${compact ? "px-8 pb-8 pt-9" : "px-9 pb-10 pt-12 sm:px-14 sm:pb-14 sm:pt-14"}`}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0, transparent calc(2.2rem - 1px), var(--g-line) calc(2.2rem - 1px), var(--g-line) 2.2rem)",
          backgroundPosition: "0 6rem",
        }}
      />
      {!center && <div aria-hidden className={`absolute inset-y-0 w-px bg-(--g-accent)/30 ${compact ? "left-5" : "left-6 sm:left-9"}`} />}
      <div aria-hidden className="absolute -top-1 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3 bg-white/45 shadow-sm backdrop-blur-sm" />
      <div className={`relative flex w-full gap-3 text-xs text-(--g-muted) ${center ? "flex-col items-center" : "items-baseline justify-between"}`}>
        <span className="italic">{ctx.occasion.eyebrow}</span>
        {ctx.design.date && <span className="tabular-nums">{ctx.design.date}</span>}
      </div>
      <Heading ctx={ctx} className={compact ? "mt-5" : "mt-7"} />
      <Message ctx={ctx} className={compact ? "mt-4" : "mt-6"} />
      <Postscript ctx={ctx} className="mt-5" />
      <Signature ctx={ctx} className={`${compact ? "mt-7" : "mt-10"} ${center ? "" : "ml-auto pr-2 text-right"}`} />
    </article>
  );
}

function PostcardCard({ ctx }: { ctx: Ctx }) {
  const { compact } = ctx;
  const pad = compact ? "px-7" : "px-8 sm:px-11";
  return (
    <article style={designStyle(ctx.design)} className={`${frameClass(ctx, "rounded-2xl", "rounded-xl")} items-stretch`}>
      <div
        className={`relative flex items-start justify-between gap-4 text-left ${pad} ${compact ? "pb-5 pt-6" : "pb-7 pt-8"}`}
        style={{ background: "color-mix(in srgb, var(--g-accent) 12%, transparent)" }}
      >
        <div className="min-w-0">
          <OccasionIcon occasion={ctx.occasion.id} strokeWidth={1.2} className={`text-(--g-accent) ${compact ? "size-8" : "size-10"}`} />
          <Eyebrow ctx={ctx} className="mt-3" />
          <DateLine ctx={ctx} className="mt-1.5" />
        </div>
        <div className="relative shrink-0 rotate-3 rounded-[3px] border-2 border-dashed border-(--g-line) bg-white/30 p-1">
          <div
            className={`grid place-items-center rounded-[2px] text-(--g-seal-ink) ${compact ? "size-12" : "size-16"}`}
            style={{ background: sealFill }}
          >
            <Emblem kind={ctx.design.seal} ctx={ctx} size={compact ? 20 : 26} />
          </div>
          <span
            aria-hidden
            className="absolute -bottom-3 -left-5 grid size-11 -rotate-12 place-items-center rounded-full border border-(--g-muted)/50 text-[0.45rem] font-semibold uppercase tracking-widest text-(--g-muted)/80"
          >
            With love
          </span>
        </div>
      </div>
      <div
        aria-hidden
        className="h-1.5 opacity-70"
        style={{
          background:
            "repeating-linear-gradient(135deg, var(--g-accent) 0 10px, transparent 10px 20px, var(--g-seal) 20px 30px, transparent 30px 40px)",
        }}
      />
      <div className={`relative flex flex-col ${pad} ${compact ? "pb-7 pt-6" : "pb-10 pt-8"} ${ctx.design.align === "center" ? "items-center" : ""}`}>
        <Heading ctx={ctx} />
        <Message ctx={ctx} className={compact ? "mt-4" : "mt-6"} />
        <Postscript ctx={ctx} className="mt-5" />
        <Signature ctx={ctx} className={compact ? "mt-6" : "mt-9"} />
      </div>
    </article>
  );
}

function MinimalCard({ ctx }: { ctx: Ctx }) {
  const { compact } = ctx;
  return (
    <article style={designStyle(ctx.design)} className={`${frameClass(ctx)} ${compact ? "px-8 py-10" : "px-8 py-14 sm:px-16 sm:py-20"}`}>
      <p className="relative text-[0.65rem] font-medium uppercase tracking-[0.32em] text-(--g-muted)">{ctx.occasion.eyebrow}</p>
      <Heading ctx={ctx} scale={1.1} className={compact ? "mt-5" : "mt-7"} />
      <span aria-hidden className={`relative block h-px w-12 bg-(--g-accent) ${compact ? "mt-5" : "mt-8"}`} />
      <Message ctx={ctx} className={compact ? "mt-5" : "mt-8"} />
      <Postscript ctx={ctx} className="mt-5" />
      <Signature ctx={ctx} className={compact ? "mt-8" : "mt-12"} />
      <DateLine ctx={ctx} className="mt-6" />
    </article>
  );
}

function KeepsakeCard({ ctx }: { ctx: Ctx }) {
  const { compact } = ctx;
  const inset = compact ? "inset-2.5" : "inset-3.5";
  const corner = compact ? "1.1rem" : "1.6rem";
  return (
    <article style={designStyle(ctx.design)} className={`${frameClass(ctx)} ${compact ? "px-10 py-11" : "px-10 py-14 sm:px-16 sm:py-16"}`}>
      <div aria-hidden className={`absolute rounded-[1.4rem] border border-(--g-line) ${inset}`} />
      <div aria-hidden className={`absolute rounded-[1.1rem] border border-(--g-line) ${compact ? "inset-4" : "inset-5"}`} />
      {[
        { top: corner, left: corner },
        { top: corner, right: corner, transform: "scaleX(-1)" },
        { bottom: corner, left: corner, transform: "scaleY(-1)" },
        { bottom: corner, right: corner, transform: "scale(-1)" },
      ].map((pos, i) => (
        <svg
          key={i}
          aria-hidden
          viewBox="0 0 40 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          className={`absolute text-(--g-accent) opacity-70 ${compact ? "size-7" : "size-9"}`}
          style={pos}
        >
          <path d="M2 38V15C2 7.8 7.8 2 15 2h23M7 26c5 0 9-4 9-9M16 7c0 5-4 9-9 9" />
          <circle cx="7" cy="7" r="1.6" fill="currentColor" stroke="none" />
        </svg>
      ))}
      <span className="relative grid size-14 place-items-center rounded-full border border-(--g-line) text-(--g-accent)">
        <OccasionIcon occasion={ctx.occasion.id} strokeWidth={1.2} className="size-7" />
      </span>
      <Eyebrow ctx={ctx} className="mt-4" />
      <Heading ctx={ctx} className="mt-4" />
      <DateLine ctx={ctx} className="mt-3" />
      <Ornament className={compact ? "mt-5" : "mt-7"} />
      <Message ctx={ctx} className={compact ? "mt-5" : "mt-7"} />
      <Postscript ctx={ctx} className="mt-5" />
      <Signature ctx={ctx} className={compact ? "mt-7" : "mt-10"} />
    </article>
  );
}

function Ornament({ className }: { className: string }) {
  return (
    <div aria-hidden className={`relative flex items-center gap-3 text-(--g-accent) ${className}`}>
      <span className="h-px w-10 bg-current opacity-40" />
      <HeartSolid className="size-3" />
      <span className="h-px w-10 bg-current opacity-40" />
    </div>
  );
}

const CARDS: Record<Design["layout"], (props: { ctx: Ctx }) => ReactNode> = {
  classic: ClassicCard,
  letter: LetterCard,
  postcard: PostcardCard,
  minimal: MinimalCard,
  keepsake: KeepsakeCard,
};

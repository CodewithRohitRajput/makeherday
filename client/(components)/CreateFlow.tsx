"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { createGift } from "@/lib/api";
import {
  designForOccasion,
  designStyle,
  EFFECTS,
  FONTS,
  getLook,
  LAYOUTS,
  LOOKS,
  pageBackdrop,
  parseDesign,
  randomDesign,
  REVEALS,
  SEALS,
  serializeDesign,
  SIGNOFF_PRESETS,
  TEXT_LIMITS,
  type Design,
  type EffectId,
  type LayoutId,
  type RevealId,
} from "@/lib/design";
import { getOccasion, isOccasionId, OCCASIONS, type OccasionId } from "@/lib/gifts";
import { getTheme, THEME_GROUPS, THEMES, type ThemeGroup } from "@/lib/themes";
import FloatingEffect from "./FloatingEffect";
import GiftView, { Emblem, type GiftContent } from "./GiftView";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChatIcon,
  CheckIcon,
  CloseIcon,
  EnvelopeIcon,
  EyeIcon,
  GiftBoxIcon,
  HeartSolid,
  LinkIcon,
  MailIcon,
  OccasionIcon,
  PaletteIcon,
  PenIcon,
  PetalSolid,
  RefreshIcon,
  ShareIcon,
  ShuffleIcon,
  SparkleIcon,
  SparkleSolid,
  StarIcon,
} from "./Icons";

type Step = "write" | "design" | "preview" | "share";

const STEPS: { id: Step; label: string }[] = [
  { id: "write", label: "Write" },
  { id: "design", label: "Design" },
  { id: "preview", label: "Preview" },
  { id: "share", label: "Share" },
];

const MESSAGE_LIMIT = 800;
const NAME_LIMIT = 40;
const DRAFT_KEY = "mhd:draft:v1";

interface Draft {
  senderName: string;
  recipientName: string;
  message: string;
  design: Design;
  /** Once the sender changes the look, switching occasion no longer restyles the gift. */
  designTouched: boolean;
}

type TextKey = "senderName" | "recipientName" | "message";

function initialDraft(type: string | null, lookId: string | null): Draft {
  const design = designForOccasion(isOccasionId(type) ? type : "birthday");
  const look = getLook(lookId);
  return {
    senderName: "",
    recipientName: "",
    message: "",
    design: look ? { ...design, ...look.design } : design,
    designTouched: !!look,
  };
}

export default function CreateFlow() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const lookParam = searchParams.get("look");
  const origin = searchParams.toString();

  const [step, setStep] = useState<Step>("write");
  const [draft, setDraft] = useState<Draft>(() => initialDraft(typeParam, lookParam));
  const [errors, setErrors] = useState<Partial<Record<TextKey, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [restored, setRestored] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const loaded = useRef(false);

  // Restore an unfinished draft. A draft started from a different link only keeps the names.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
      if (saved && (saved.message || saved.recipientName || saved.senderName)) {
        const sameStart = !origin || saved.origin === origin;
        // Storage is only readable after hydration, so the draft has to be applied from an effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDraft((d) => ({
          ...d,
          senderName: String(saved.senderName ?? "").slice(0, NAME_LIMIT),
          recipientName: String(saved.recipientName ?? "").slice(0, NAME_LIMIT),
          ...(sameStart && {
            message: String(saved.message ?? "").slice(0, MESSAGE_LIMIT),
            design: parseDesign(saved.theme, saved.giftType),
            designTouched: !!saved.designTouched,
          }),
        }));
        setRestored(true);
      }
    } catch {
      // Storage can be unavailable (private mode, blocked cookies); start fresh.
    }
    loaded.current = true;
  }, [origin]);

  const { design } = draft;
  const occasion = getOccasion(design.occasion);
  const content: GiftContent = {
    giftType: occasion.id,
    senderName: draft.senderName,
    recipientName: draft.recipientName,
    message: draft.message,
    theme: serializeDesign(design),
  };

  useEffect(() => {
    if (!loaded.current || step === "share") return;
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ ...content, designTouched: draft.designTouched, origin }),
      );
    } catch {
      // Saving the draft is a convenience only.
    }
    // `content` is derived from `draft`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, step, origin]);

  const setText = (key: TextKey, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const setDesign = (patch: Partial<Design>) =>
    setDraft((d) => ({ ...d, design: { ...d.design, ...patch }, designTouched: true }));

  const chooseOccasion = (id: OccasionId) => {
    setDraft((d) => {
      if (d.designTouched) return { ...d, design: { ...d.design, occasion: id } };
      const { heading, signoff, date, postscript } = d.design;
      return { ...d, design: { ...designForOccasion(id), heading, signoff, date, postscript } };
    });
    setSuggestionIndex(0);
  };

  const applySuggestion = () => {
    setText("message", occasion.suggestions[suggestionIndex % occasion.suggestions.length]);
    setSuggestionIndex((i) => i + 1);
  };

  const startFresh = () => {
    setDraft(initialDraft(typeParam, lookParam));
    setErrors({});
    setRestored(false);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
  };

  const go = (next: Step) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!draft.recipientName.trim()) next.recipientName = "Please add her name.";
    if (!draft.senderName.trim()) next.senderName = "Please add your name.";
    if (!draft.message.trim()) next.message = "Write a few words, or use a suggestion.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goToDesign = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) go("design");
  };

  const goToPreview = () => {
    if (validate()) go("preview");
    else go("write");
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const trim = (s: string) => s.trim();
      const { gift: created } = await createGift({
        ...content,
        senderName: trim(draft.senderName),
        recipientName: trim(draft.recipientName),
        message: trim(draft.message),
      });
      setShareUrl(`${window.location.origin}/g/${created.slug}`);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      go("share");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const editing = step === "write" || step === "design";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
      <StepIndicator current={step} onSelect={step === "share" ? undefined : (s) => (s === "preview" ? goToPreview() : go(s))} />

      {editing && (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-16">
          {step === "write" ? (
            <form onSubmit={goToDesign} noValidate className="animate-fade-up space-y-10">
              <div>
                <h1 className="font-display text-4xl font-medium text-burgundy-deep sm:text-5xl">Write your gift</h1>
                <p className="mt-3 text-muted">Pick the occasion and say it in your own words. You&apos;ll design the look next.</p>
              </div>

              {restored && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white/70 px-5 py-3 text-sm">
                  <span className="text-ink">Welcome back. We saved your draft.</span>
                  <button type="button" onClick={startFresh} className="font-medium text-burgundy hover:text-rose">
                    Start fresh
                  </button>
                </div>
              )}

              <Fieldset legend="1. What's the occasion?">
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                  {OCCASIONS.map((o) => (
                    <ChoiceTile
                      key={o.id}
                      name="occasion"
                      checked={design.occasion === o.id}
                      onChange={() => chooseOccasion(o.id)}
                      className="p-3.5"
                    >
                      <OccasionIcon occasion={o.id} className="size-5 text-burgundy" />
                      <span className="mt-2 block pr-4 text-sm font-medium leading-tight text-ink">{o.name}</span>
                    </ChoiceTile>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted">
                  <span className="font-medium text-burgundy">{occasion.tagline}.</span> {occasion.description}
                </p>
              </Fieldset>

              <Fieldset legend="2. Who is it for?">
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    label="Her name"
                    placeholder="e.g. Meera"
                    value={draft.recipientName}
                    maxLength={NAME_LIMIT}
                    error={errors.recipientName}
                    onChange={(v) => setText("recipientName", v)}
                  />
                  <TextField
                    label="Your name"
                    placeholder="e.g. Arjun"
                    value={draft.senderName}
                    maxLength={NAME_LIMIT}
                    error={errors.senderName}
                    onChange={(v) => setText("senderName", v)}
                  />
                </div>
              </Fieldset>

              <Fieldset legend="3. Your words">
                <div className="space-y-5">
                  <TextField
                    label="Headline"
                    optional
                    placeholder={occasion.heading(draft.recipientName.trim() || "Meera")}
                    value={design.heading}
                    maxLength={TEXT_LIMITS.heading}
                    onChange={(v) => setDesign({ heading: v })}
                    hint="Leave blank to use the suggested headline."
                  />
                  <div>
                    <label htmlFor="message" className="mb-2 block text-sm font-medium text-ink">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={7}
                      value={draft.message}
                      maxLength={MESSAGE_LIMIT}
                      onChange={(e) => setText("message", e.target.value)}
                      placeholder="Write from the heart. Small details mean the most."
                      aria-invalid={!!errors.message}
                      aria-describedby="message-help"
                      className={`${inputClass} resize-y font-display text-lg leading-relaxed ${errors.message ? "border-rose" : ""}`}
                    />
                    <div id="message-help" className="mt-2 flex items-center justify-between gap-4 text-sm">
                      {errors.message ? (
                        <span className="text-rose">{errors.message}</span>
                      ) : (
                        <button
                          type="button"
                          onClick={applySuggestion}
                          className="inline-flex items-center gap-1.5 font-medium text-burgundy transition-colors hover:text-rose"
                        >
                          <SparkleIcon className="size-4" />
                          {draft.message ? "Try another suggestion" : "Use a suggestion"}
                        </button>
                      )}
                      <span className="tabular-nums text-muted">
                        {draft.message.length}/{MESSAGE_LIMIT}
                      </span>
                    </div>
                  </div>
                  <TextField
                    label="P.S."
                    optional
                    placeholder="e.g. Check the top drawer of your desk"
                    value={design.postscript}
                    maxLength={TEXT_LIMITS.postscript}
                    onChange={(v) => setDesign({ postscript: v })}
                  />
                </div>
              </Fieldset>

              <Fieldset legend="4. Finishing touches">
                <div className="space-y-6">
                  <div>
                    <span className="mb-2 block text-sm font-medium text-ink">Sign-off</span>
                    <div className="flex flex-wrap gap-2">
                      {[occasion.signoff, ...SIGNOFF_PRESETS.filter((s) => s !== occasion.signoff)].map((s) => (
                        <Chip
                          key={s}
                          name="signoff"
                          checked={(design.signoff || occasion.signoff) === s}
                          onChange={() => setDesign({ signoff: s === occasion.signoff ? "" : s })}
                        >
                          {s}
                        </Chip>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={design.signoff}
                      maxLength={TEXT_LIMITS.signoff}
                      onChange={(e) => setDesign({ signoff: e.target.value })}
                      placeholder="Or write your own…"
                      aria-label="Custom sign-off"
                      className={`${inputClass} mt-3`}
                    />
                  </div>
                  <TextField
                    label="A date or little note"
                    optional
                    placeholder="e.g. 14 February 2019 · Since our first coffee"
                    value={design.date}
                    maxLength={TEXT_LIMITS.date}
                    onChange={(v) => setDesign({ date: v })}
                  />
                </div>
              </Fieldset>

              <div className="flex flex-col-reverse gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
                <Link href="/" className="text-center text-sm text-muted transition-colors hover:text-burgundy">
                  Cancel
                </Link>
                <button type="submit" className={primaryButton}>
                  <PaletteIcon className="size-4" />
                  Next: design it
                </button>
              </div>
            </form>
          ) : (
            <DesignPanel
              design={design}
              recipient={draft.recipientName.trim() || "Meera"}
              sender={draft.senderName.trim()}
              onChange={setDesign}
              onBack={() => go("write")}
              onNext={goToPreview}
            />
          )}

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <LivePreview content={content} />
            </div>
          </aside>
        </div>
      )}

      {editing && (
        <button
          type="button"
          onClick={() => setMobilePreview(true)}
          className="fixed bottom-5 right-5 z-30 inline-flex h-12 items-center gap-2 rounded-full bg-burgundy px-5 text-sm font-medium text-cream shadow-lift lg:hidden"
        >
          <EyeIcon className="size-4" />
          Live preview
        </button>
      )}
      {editing && mobilePreview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Live preview"
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 px-4 py-6 backdrop-blur-sm lg:hidden"
          onClick={(e) => e.target === e.currentTarget && setMobilePreview(false)}
        >
          <div className="mx-auto max-w-md animate-unseal rounded-[2rem] bg-cream p-4 shadow-lift">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setMobilePreview(false)}
                className="grid size-9 place-items-center rounded-full border border-line bg-white text-burgundy"
                aria-label="Close preview"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>
            <LivePreview content={content} />
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="mt-10 animate-fade-up">
          <div className="text-center">
            <h1 className="font-display text-4xl font-medium text-burgundy-deep sm:text-5xl">This is what she&apos;ll see</h1>
            <p className="mt-3 text-muted">
              {design.reveal === "none" ? "It opens straight to your message." : "Open it, just like she will."}
            </p>
          </div>
          <Stage design={design} className="mt-10 min-h-[38rem] rounded-[2rem] px-4 py-12 sm:py-16">
            <GiftView key={content.theme + content.giftType} gift={content} sealed />
          </Stage>
          {submitError && (
            <p role="alert" className="mx-auto mt-8 max-w-md rounded-2xl border border-rose/30 bg-blush/50 px-5 py-3 text-center text-sm text-burgundy">
              {submitError}
            </p>
          )}
          <div className="mx-auto mt-10 flex max-w-2xl flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <button type="button" onClick={() => go("write")} className={secondaryButton}>
              <PenIcon className="size-4" />
              Edit words
            </button>
            <button type="button" onClick={() => go("design")} className={secondaryButton}>
              <PaletteIcon className="size-4" />
              Edit design
            </button>
            <button type="button" onClick={submit} disabled={submitting} className={primaryButton}>
              {submitting ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-cream/30 border-t-cream" />
                  Creating your gift…
                </>
              ) : (
                <>
                  Create &amp; get link
                  <ArrowRightIcon className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === "share" && shareUrl && <ShareStep url={shareUrl} recipient={draft.recipientName.trim()} />}
    </div>
  );
}

/* ------------------------------- Live preview ------------------------------- */

function Stage({ design, className = "", children }: { design: Design; className?: string; children: ReactNode }) {
  return (
    <div className={`relative isolate flex items-center justify-center overflow-hidden ${className}`} style={{ background: pageBackdrop(design) }}>
      <FloatingEffect effect={design.effect} color={design.accent || getTheme(design.theme).accent} className="-z-10" />
      {children}
    </div>
  );
}

function LivePreview({ content }: { content: GiftContent }) {
  const [mode, setMode] = useState<"card" | "opening">("card");
  const [replay, setReplay] = useState(0);
  const design = parseDesign(content.theme, content.giftType);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">Live preview</p>
        <div className="flex items-center gap-1 rounded-full border border-line bg-white/70 p-1 text-xs">
          {(["card", "opening"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setReplay((r) => r + 1);
              }}
              aria-pressed={mode === m}
              className={`rounded-full px-3 py-1.5 font-medium capitalize transition-colors ${
                mode === m ? "bg-burgundy text-cream" : "text-muted hover:text-burgundy"
              }`}
            >
              {m}
            </button>
          ))}
          {mode === "opening" && (
            <button
              type="button"
              onClick={() => setReplay((r) => r + 1)}
              className="grid size-7 place-items-center rounded-full text-muted hover:text-burgundy"
              aria-label="Replay opening"
            >
              <RefreshIcon className="size-3.5" />
            </button>
          )}
        </div>
      </div>
      <Stage design={design} className="rounded-[1.75rem] p-4 sm:p-5">
        {mode === "card" ? (
          <GiftView gift={content} compact />
        ) : (
          <GiftView key={`${replay}-${content.theme}`} gift={content} sealed />
        )}
      </Stage>
    </div>
  );
}

/* ------------------------------- Design panel ------------------------------- */

function DesignPanel({
  design,
  recipient,
  sender,
  onChange,
  onBack,
  onNext,
}: {
  design: Design;
  recipient: string;
  sender: string;
  onChange: (patch: Partial<Design>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [group, setGroup] = useState<ThemeGroup | "all">("all");
  const occasion = getOccasion(design.occasion);
  const activeLook = design.accent
    ? undefined
    : LOOKS.find((l) => (Object.keys(l.design) as (keyof Look["design"])[]).every((k) => l.design[k] === design[k]));
  const themes = group === "all" ? THEMES : THEMES.filter((t) => t.group === group);
  const style = designStyle(design);
  const accent = design.accent || getTheme(design.theme).accent;

  return (
    <div className="animate-fade-up space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-medium text-burgundy-deep sm:text-5xl">Design your gift</h1>
          <p className="mt-3 text-muted">Start from a curated look, then make every detail your own.</p>
        </div>
        <button type="button" onClick={() => onChange(randomDesign(design))} className={secondaryButton}>
          <ShuffleIcon className="size-4" />
          Surprise me
        </button>
      </div>

      <Fieldset legend="Start from a look">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {LOOKS.map((look) => {
            const t = getTheme(look.design.theme);
            const font = FONTS.find((f) => f.id === look.design.font)!;
            return (
              <ChoiceTile
                key={look.id}
                name="look"
                checked={activeLook?.id === look.id}
                onChange={() => onChange({ ...look.design, accent: "" })}
                className="p-2.5"
              >
                <span
                  className="relative grid aspect-[5/3] place-items-center overflow-hidden rounded-xl border border-black/5"
                  style={{ background: t.background, color: t.accent }}
                >
                  <span
                    className="text-3xl leading-none"
                    style={{
                      fontFamily: font.heading,
                      fontStyle: font.italic ? "italic" : "normal",
                      fontWeight: font.weight,
                      fontSize: `${1.9 * font.headingScale}rem`,
                    }}
                  >
                    {recipient.split(" ")[0]}
                  </span>
                </span>
                <span className="mt-2.5 block px-1 text-sm font-medium text-ink">{look.name}</span>
                <span className="mb-1 mt-0.5 block px-1 text-xs leading-snug text-muted">{look.description}</span>
              </ChoiceTile>
            );
          })}
        </div>
      </Fieldset>

      <Fieldset
        legend="Colour theme"
        action={
          <div className="flex gap-1 rounded-full border border-line bg-white/70 p-1 text-xs">
            {THEME_GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGroup(g.id)}
                aria-pressed={group === g.id}
                className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                  group === g.id ? "bg-burgundy text-cream" : "text-muted hover:text-burgundy"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
          {themes.map((t) => (
            <ChoiceTile key={t.id} name="theme" checked={design.theme === t.id} onChange={() => onChange({ theme: t.id })} className="p-2">
              <span
                className="grid aspect-square w-full place-items-center rounded-lg border border-black/5 font-display text-2xl italic"
                style={{ background: t.swatch, color: t.dark ? t.ink : t.accent }}
              >
                Aa
              </span>
              <span className="mt-2 block truncate px-0.5 text-xs font-medium text-ink">{t.name}</span>
            </ChoiceTile>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white/60 px-4 py-3">
          <label className="relative grid size-9 cursor-pointer place-items-center overflow-hidden rounded-full border border-black/10 shadow-soft" style={{ background: accent }}>
            <input
              type="color"
              value={accent}
              onChange={(e) => onChange({ accent: e.target.value })}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
              aria-label="Custom accent colour"
            />
          </label>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">Accent colour</p>
            <p className="text-xs text-muted">{design.accent ? `Custom ${design.accent.toUpperCase()}` : "Matches the theme. Tap the circle to pick your own."}</p>
          </div>
          {design.accent && (
            <button type="button" onClick={() => onChange({ accent: "" })} className="text-sm font-medium text-burgundy hover:text-rose">
              Reset
            </button>
          )}
        </div>
      </Fieldset>

      <Fieldset legend="Card style">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {LAYOUTS.map((l) => (
            <ChoiceTile
              key={l.id}
              name="layout"
              checked={design.layout === l.id}
              onChange={() => onChange({ layout: l.id, align: l.align })}
              className="p-2.5"
            >
              <LayoutThumb id={l.id} style={style} />
              <span className="mt-2.5 block px-0.5 text-sm font-medium text-ink">{l.name}</span>
              <span className="mb-0.5 block px-0.5 text-xs text-muted">{l.description}</span>
            </ChoiceTile>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm text-muted">Text alignment</span>
          <div className="flex gap-1 rounded-full border border-line bg-white/70 p-1 text-xs">
            {(["start", "center"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => onChange({ align: a })}
                aria-pressed={design.align === a}
                className={`rounded-full px-3.5 py-1.5 font-medium transition-colors ${
                  design.align === a ? "bg-burgundy text-cream" : "text-muted hover:text-burgundy"
                }`}
              >
                {a === "start" ? "Left" : "Centred"}
              </button>
            ))}
          </div>
        </div>
      </Fieldset>

      <Fieldset legend="Typeface">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {FONTS.map((f) => (
            <ChoiceTile key={f.id} name="font" checked={design.font === f.id} onChange={() => onChange({ font: f.id })} className="p-3">
              <span
                className="block overflow-hidden whitespace-nowrap pr-4 leading-tight text-burgundy-deep"
                style={{
                  fontFamily: f.heading,
                  fontStyle: f.italic ? "italic" : "normal",
                  fontWeight: f.weight,
                  fontSize: `${1.35 * f.headingScale}rem`,
                }}
              >
                {recipient.split(" ")[0]}
              </span>
              <span className="mt-1.5 block text-xs font-medium text-muted">{f.name}</span>
            </ChoiceTile>
          ))}
        </div>
      </Fieldset>

      <Fieldset legend="How it opens">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {REVEALS.map((r) => (
            <ChoiceTile key={r.id} name="reveal" checked={design.reveal === r.id} onChange={() => onChange({ reveal: r.id })}>
              <RevealThumb id={r.id} />
              <span className="mt-3 block text-sm font-medium text-ink">{r.name}</span>
              <span className="mt-0.5 block text-xs leading-snug text-muted">{r.description}</span>
            </ChoiceTile>
          ))}
        </div>
      </Fieldset>

      {design.reveal !== "none" && (
        <Fieldset legend="Seal emblem">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SEALS.map((s) => (
              <ChoiceTile key={s.id} name="seal" checked={design.seal === s.id} onChange={() => onChange({ seal: s.id })} className="p-3.5">
                <span
                  style={{ ...style, background: "radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--g-seal) 72%, white), var(--g-seal) 72%)" }}
                  className="grid size-12 place-items-center rounded-full text-(--g-seal-ink) shadow-soft"
                >
                  <Emblem kind={s.id} ctx={{ sender: sender || "You", occasion }} size={20} />
                </span>
                <span className="mt-2.5 block text-sm font-medium text-ink">{s.name}</span>
              </ChoiceTile>
            ))}
          </div>
        </Fieldset>
      )}

      <Fieldset legend="Background effect">
        <div className="flex flex-wrap gap-2">
          {EFFECTS.map((e) => (
            <Chip key={e.id} name="effect" checked={design.effect === e.id} onChange={() => onChange({ effect: e.id })}>
              <EffectIcon id={e.id} />
              {e.name}
            </Chip>
          ))}
        </div>
        <label className="mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-line bg-white/60 px-4 py-3.5">
          <span>
            <span className="block text-sm font-medium text-ink">Celebration burst</span>
            <span className="block text-xs text-muted">A little shower of joy the moment she opens it.</span>
          </span>
          <input
            type="checkbox"
            checked={design.burst}
            onChange={(e) => onChange({ burst: e.target.checked })}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className="relative h-7 w-12 shrink-0 rounded-full bg-line transition-colors peer-checked:bg-burgundy peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-burgundy after:absolute after:left-1 after:top-1 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
          />
        </label>
      </Fieldset>

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} className="inline-flex items-center justify-center gap-1.5 text-sm text-muted transition-colors hover:text-burgundy">
          <ArrowLeftIcon className="size-4" />
          Back to words
        </button>
        <button type="button" onClick={onNext} className={primaryButton}>
          <EyeIcon className="size-4" />
          Preview your gift
        </button>
      </div>
    </div>
  );
}

type Look = (typeof LOOKS)[number];

function LayoutThumb({ id, style }: { id: LayoutId; style: CSSProperties }) {
  const bar = "absolute h-[3px] rounded-full bg-(--g-accent)";
  return (
    <span style={style} className="relative block aspect-[4/5] overflow-hidden rounded-lg border border-black/5" aria-hidden>
      {id === "classic" && (
        <>
          <span className="absolute inset-1.5 rounded-md border border-(--g-line)" />
          <span className={`${bar} left-3 top-3 w-6 opacity-60`} />
          <span className={`${bar} left-3 top-6 h-1.5! w-12 opacity-90`} />
          <span className={`${bar} left-3 top-10 w-14 opacity-30`} />
          <span className={`${bar} left-3 top-12 w-11 opacity-30`} />
          <span className={`${bar} left-3 top-14 w-13 opacity-30`} />
          <span className="absolute inset-x-3 bottom-5 h-px bg-(--g-line)" />
          <span className={`${bar} bottom-3 left-3 w-7 opacity-70`} />
        </>
      )}
      {id === "letter" && (
        <>
          <span
            className="absolute inset-0 opacity-80"
            style={{ backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 7px, var(--g-line) 7px 8px)" }}
          />
          <span className="absolute inset-y-0 left-2 w-px bg-(--g-accent)/40" />
          <span className="absolute -top-0.5 left-1/2 h-2.5 w-8 -translate-x-1/2 -rotate-3 bg-white/60" />
          <span className={`${bar} left-4 top-5 h-1.5! w-10 opacity-90`} />
          <span className={`${bar} left-4 top-9 w-14 opacity-30`} />
          <span className={`${bar} left-4 top-11 w-12 opacity-30`} />
          <span className={`${bar} bottom-3 right-3 w-8 opacity-70`} />
        </>
      )}
      {id === "postcard" && (
        <>
          <span className="absolute inset-x-0 top-0 h-[38%] bg-(--g-accent)/15" />
          <span className="absolute right-2 top-2 size-5 rotate-6 rounded-[2px] border border-dashed border-(--g-accent)/60 bg-(--g-seal)/80" />
          <span
            className="absolute inset-x-0 top-[38%] h-[3px] opacity-70"
            style={{ background: "repeating-linear-gradient(135deg, var(--g-accent) 0 4px, transparent 4px 8px)" }}
          />
          <span className={`${bar} left-3 top-[48%] h-1.5! w-12 opacity-90`} />
          <span className={`${bar} left-3 top-[62%] w-14 opacity-30`} />
          <span className={`${bar} left-3 top-[70%] w-11 opacity-30`} />
          <span className={`${bar} bottom-3 left-3 w-7 opacity-70`} />
        </>
      )}
      {id === "minimal" && (
        <>
          <span className={`${bar} left-1/2 top-6 h-1.5! w-12 -translate-x-1/2 opacity-90`} />
          <span className="absolute left-1/2 top-10 h-px w-4 -translate-x-1/2 bg-(--g-accent)" />
          <span className={`${bar} left-1/2 top-13 w-12 -translate-x-1/2 opacity-30`} />
          <span className={`${bar} left-1/2 top-15 w-10 -translate-x-1/2 opacity-30`} />
          <span className={`${bar} bottom-4 left-1/2 w-7 -translate-x-1/2 opacity-70`} />
        </>
      )}
      {id === "keepsake" && (
        <>
          <span className="absolute inset-1 rounded-md border border-(--g-line)" />
          <span className="absolute inset-2 rounded border border-(--g-line)" />
          <span className="absolute left-1/2 top-3.5 size-4 -translate-x-1/2 rounded-full border border-(--g-accent)/60" />
          <span className={`${bar} left-1/2 top-10 h-1.5! w-12 -translate-x-1/2 opacity-90`} />
          <span className={`${bar} left-1/2 top-14 w-12 -translate-x-1/2 opacity-30`} />
          <span className={`${bar} left-1/2 top-16 w-9 -translate-x-1/2 opacity-30`} />
          <span className={`${bar} bottom-4 left-1/2 w-7 -translate-x-1/2 opacity-70`} />
        </>
      )}
    </span>
  );
}

function RevealThumb({ id }: { id: RevealId }) {
  const cls = "size-6";
  return (
    <span className="grid size-11 place-items-center rounded-full bg-blush/70 text-burgundy">
      {id === "seal" && <HeartSolid className="size-5" />}
      {id === "envelope" && <EnvelopeIcon className={cls} />}
      {id === "giftbox" && <GiftBoxIcon className={cls} />}
      {id === "none" && <SparkleIcon className={cls} />}
    </span>
  );
}

function EffectIcon({ id }: { id: EffectId }) {
  const cls = "size-3.5";
  if (id === "hearts") return <HeartSolid className={`${cls} text-rose`} />;
  if (id === "petals") return <PetalSolid className={`${cls} text-rose`} />;
  if (id === "sparkles") return <SparkleSolid className={`${cls} text-gold`} />;
  if (id === "stars") return <StarIcon className={`${cls} text-gold`} />;
  if (id === "bubbles") return <span className="size-3 rounded-full border-[1.5px] border-rose" />;
  if (id === "confetti")
    return (
      <span className="flex gap-0.5">
        <span className="h-3 w-1 rotate-12 rounded-[1px] bg-[#F2C14E]" />
        <span className="h-3 w-1 -rotate-12 rounded-[1px] bg-rose" />
        <span className="h-3 w-1 rotate-6 rounded-[1px] bg-[#7FD1C7]" />
      </span>
    );
  return <CloseIcon className={`${cls} text-muted`} />;
}

/* ---------------------------------- Share ----------------------------------- */

function ShareStep({ url, recipient }: { url: string; recipient: string }) {
  const [copied, setCopied] = useState(false);
  // Only rendered after the gift is created in the browser, so `navigator` is always available.
  const canShare = "share" in navigator;

  const text = `I made something for you ❤️`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: "A surprise for you", text, url });
    } catch {
      // The sender closed the share sheet.
    }
  };

  const encoded = encodeURIComponent(`${text} ${url}`);
  const links = [
    { href: `https://wa.me/?text=${encoded}`, label: "WhatsApp", icon: ChatIcon, external: true },
    { href: `sms:?&body=${encoded}`, label: "Text message", icon: ChatIcon, external: false },
    {
      href: `mailto:?subject=${encodeURIComponent("A surprise for you")}&body=${encoded}`,
      label: "Email",
      icon: MailIcon,
      external: false,
    },
  ];

  return (
    <div className="mx-auto mt-12 max-w-xl animate-fade-up text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-burgundy text-cream shadow-lift">
        <CheckIcon className="size-7" />
      </span>
      <h1 className="mt-6 font-display text-4xl font-medium text-burgundy-deep sm:text-5xl">Your gift is ready</h1>
      <p className="mt-3 text-muted">Send this private link to {recipient || "her"}. She can open it on any device.</p>

      <div className="mt-8 flex items-center gap-2 rounded-full border border-line bg-white/70 p-1.5 pl-5 shadow-soft">
        <LinkIcon className="size-4 shrink-0 text-muted" />
        <input
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
          aria-label="Gift link"
          className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none"
        />
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-burgundy px-4 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-burgundy-deep"
        >
          {copied ? <CheckIcon className="size-4" /> : null}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {canShare && (
          <button type="button" onClick={nativeShare} className={`${primaryButton} sm:col-span-2`}>
            <ShareIcon className="size-4" />
            Share…
          </button>
        )}
        {links.map(({ href, label, icon: Icon, external }) => (
          <a
            key={label}
            href={href}
            {...(external && { target: "_blank", rel: "noopener noreferrer" })}
            className={secondaryButton}
          >
            <Icon className="size-4" />
            {label}
          </a>
        ))}
        <Link href={new URL(url).pathname} className={secondaryButton}>
          <EyeIcon className="size-4" />
          Open gift
        </Link>
      </div>

      <p className="mx-auto mt-8 max-w-sm text-sm text-muted">
        Tip: send it at a moment that matters, like first thing in the morning or right at midnight.
      </p>

      <a href="/create" className="mt-8 inline-flex items-center gap-1.5 text-sm text-muted hover:text-burgundy">
        <ArrowLeftIcon className="size-4" />
        Create another gift
      </a>
    </div>
  );
}

/* --------------------------------- Controls --------------------------------- */

function StepIndicator({ current, onSelect }: { current: Step; onSelect?: (step: Step) => void }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);
  return (
    <ol className="mx-auto flex max-w-xl items-center justify-center gap-2 text-sm" aria-label="Progress">
      {STEPS.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const clickable = onSelect && s.id !== "share" && !active;
        const inner = (
          <>
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-medium transition-colors ${
                active || done ? "bg-burgundy text-cream" : "border border-line bg-white/60 text-muted"
              }`}
            >
              {done ? <CheckIcon className="size-3.5" /> : i + 1}
            </span>
            <span className={`hidden sm:inline ${active ? "font-medium text-burgundy-deep" : "text-muted"}`}>{s.label}</span>
          </>
        );
        return (
          <li key={s.id} className="flex flex-1 items-center gap-2 last:flex-none" aria-current={active ? "step" : undefined}>
            {clickable ? (
              <button type="button" onClick={() => onSelect(s.id)} className="flex items-center gap-2 rounded-full hover:opacity-80">
                {inner}
              </button>
            ) : (
              <span className="flex items-center gap-2">{inner}</span>
            )}
            {i < STEPS.length - 1 && <span aria-hidden className={`mx-1 h-px flex-1 ${done ? "bg-burgundy/50" : "bg-line"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

function Fieldset({ legend, action, children }: { legend: string; action?: ReactNode; children: ReactNode }) {
  return (
    <fieldset>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <legend className="float-left font-display text-2xl font-medium text-burgundy-deep">{legend}</legend>
        {action}
      </div>
      {children}
    </fieldset>
  );
}

function ChoiceTile({
  name,
  checked,
  onChange,
  className = "p-4",
  children,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label
      className={`relative block cursor-pointer rounded-2xl border bg-white/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-burgundy ${className} ${
        checked ? "border-burgundy ring-1 ring-burgundy" : "border-line hover:border-rose/40"
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {checked && (
        <span className="absolute right-2.5 top-2.5 z-10 grid size-5 place-items-center rounded-full bg-burgundy text-cream">
          <CheckIcon className="size-3" />
        </span>
      )}
      {children}
    </label>
  );
}

function Chip({ name, checked, onChange, children }: { name: string; checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-burgundy ${
        checked ? "border-burgundy bg-burgundy text-cream [&_.text-muted]:text-cream/70" : "border-line bg-white/60 text-ink hover:border-rose/50"
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  error,
  hint,
  optional = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  error?: string;
  hint?: string;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline justify-between gap-2 text-sm font-medium text-ink">
        <span>
          {label}
          {optional && <span className="ml-1.5 font-normal text-muted">(optional)</span>}
        </span>
        {maxLength && value.length > maxLength * 0.7 && (
          <span className="text-xs font-normal tabular-nums text-muted">
            {value.length}/{maxLength}
          </span>
        )}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={!!error}
        className={`${inputClass} ${error ? "border-rose" : ""}`}
      />
      {error ? (
        <span className="mt-1.5 block text-sm text-rose">{error}</span>
      ) : (
        hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>
      )}
    </label>
  );
}

const inputClass =
  "w-full rounded-2xl border border-line bg-white/70 px-4 py-3 text-ink placeholder:text-muted/60 outline-none transition-colors focus:border-burgundy focus:bg-white focus:ring-4 focus:ring-blush";

const primaryButton =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-burgundy px-7 text-sm font-medium text-cream shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:bg-burgundy-deep disabled:pointer-events-none disabled:opacity-70";

const secondaryButton =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-white/60 px-6 text-sm font-medium text-burgundy transition-colors hover:border-rose/50 hover:bg-white";

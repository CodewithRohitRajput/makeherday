"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ApiError, createGift, createPayment } from "@/lib/api";
import {
  designColors,
  designForOccasion,
  designStyle,
  FONTS,
  parseDesign,
  randomDesign,
  ROSES,
  SEALS,
  serializeDesign,
  SIGNOFF_PRESETS,
  TEXT_LIMITS,
  type Design,
} from "@/lib/design";
import { getOccasion, isOccasionId, OCCASIONS, type OccasionId } from "@/lib/gifts";
import { GIFT_PRICE, normalizePhone, openCheckout, savePendingPayment } from "@/lib/payment";
import { Emblem, type GiftContent } from "./GiftView";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChatIcon,
  CheckIcon,
  CloseIcon,
  EyeIcon,
  LinkIcon,
  LockIcon,
  MailIcon,
  OccasionIcon,
  PaletteIcon,
  PenIcon,
  RefreshIcon,
  RoseIcon,
  ShareIcon,
  ShuffleIcon,
  SparkleIcon,
  StarSolid,
} from "./Icons";
import RoseGift from "./rose/RoseGift";

type Step = "write" | "design" | "preview" | "share";

const STEPS: { id: Step; label: string }[] = [
  { id: "write", label: "Write" },
  { id: "design", label: "Design" },
  { id: "preview", label: "Preview" },
  { id: "share", label: "Share" },
];

const MESSAGE_LIMIT = 800;
const NAME_LIMIT = 40;
export const DRAFT_KEY = "mhd:draft:v1";

interface Draft {
  senderName: string;
  recipientName: string;
  message: string;
  design: Design;
  /** Once the sender changes the look, switching occasion no longer restyles the gift. */
  designTouched: boolean;
}

type TextKey = "senderName" | "recipientName" | "message";

/** Every gift is a Digital Rose; links can preselect its colour with `?rose=`. */
function initialDraft(type: string | null, roseId: string | null): Draft {
  const design = designForOccasion(isOccasionId(type) ? type : "birthday");
  const rose = ROSES.find((r) => r.id === roseId);
  return {
    senderName: "",
    recipientName: "",
    message: "",
    design: { ...design, reveal: "rose", ...(rose && { rose: rose.id }) },
    designTouched: false,
  };
}

export default function CreateFlow() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const roseParam = searchParams.get("rose");
  // `?resume=pay` brings the sender back to checkout after a failed payment.
  const resumePayment = searchParams.get("resume") === "pay";
  const startParams = new URLSearchParams(searchParams);
  startParams.delete("resume");
  const origin = startParams.toString();

  const [step, setStep] = useState<Step>("write");
  const [draft, setDraft] = useState<Draft>(() => initialDraft(typeParam, roseParam));
  const [errors, setErrors] = useState<Partial<Record<TextKey, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [restored, setRestored] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const loaded = useRef(false);
  /** The saved gift, reused when payment is retried unless the content changed since. */
  const created = useRef<{ key: string; id: string; slug: string } | null>(null);

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
            design: { ...parseDesign(saved.theme, saved.giftType), reveal: "rose" },
            designTouched: !!saved.designTouched,
          }),
        }));
        setRestored(true);
        if (resumePayment && sameStart && saved.message && saved.recipientName && saved.senderName) setStep("preview");
      }
    } catch {
      // Storage can be unavailable (private mode, blocked cookies); start fresh.
    }
    loaded.current = true;
  }, [origin, resumePayment]);

  // Coming back from Cashfree with the browser's back button restores this page mid-payment.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => e.persisted && setSubmitting(false);
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

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
      const { heading, signoff, date, postscript, rose } = d.design;
      return { ...d, design: { ...designForOccasion(id), reveal: "rose", rose, heading, signoff, date, postscript } };
    });
    setSuggestionIndex(0);
  };

  const applySuggestion = () => {
    setText("message", occasion.suggestions[suggestionIndex % occasion.suggestions.length]);
    setSuggestionIndex((i) => i + 1);
  };

  const startFresh = () => {
    setDraft(initialDraft(typeParam, roseParam));
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

  const finish = (slug: string) => {
    setShareUrl(`${window.location.origin}/g/${slug}`);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    go("share");
  };

  const pay = async (e: FormEvent) => {
    e.preventDefault();
    const customerPhone = normalizePhone(phone);
    if (!customerPhone) {
      setPhoneError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const trim = (s: string) => s.trim();
      const input = {
        ...content,
        senderName: trim(draft.senderName),
        recipientName: trim(draft.recipientName),
        message: trim(draft.message),
      };
      const key = JSON.stringify(input);
      if (created.current?.key !== key) {
        const { gift } = await createGift(input);
        created.current = { key, id: gift._id, slug: gift.slug };
      }
      const { id, slug } = created.current;

      let session: Awaited<ReturnType<typeof createPayment>>;
      try {
        session = await createPayment(id, customerPhone);
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) return finish(slug);
        throw err;
      }
      savePendingPayment({ orderId: session.orderId, slug, recipient: input.recipientName });
      // Navigates away to Cashfree, so the button keeps spinning on success.
      await openCheckout(session.paymentSessionId);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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
                <p className="mt-3 text-muted">Pick the occasion and say it in your own words. You&apos;ll design her rose next.</p>
              </div>

              {restored && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white/70 px-5 py-3 text-sm">
                  <span className="text-ink">Welcome back. We saved your draft.</span>
                  <button type="button" onClick={startFresh} className="font-medium text-burgundy hover:text-rose">
                    Start fresh
                  </button>
                </div>
              )}

              <RoseBanner design={design} onChange={setDesign} />

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
            <p className="mt-3 text-muted">Tap the envelope and open it, just like she will.</p>
          </div>
          <div className="mx-auto mt-10 max-w-lg">
            <RoseGift key={content.theme + content.giftType} gift={content} />
          </div>
          <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row sm:justify-center">
            <button type="button" onClick={() => go("write")} className={secondaryButton}>
              <PenIcon className="size-4" />
              Edit words
            </button>
            <button type="button" onClick={() => go("design")} className={secondaryButton}>
              <PaletteIcon className="size-4" />
              Edit design
            </button>
          </div>
          <Checkout
            recipient={draft.recipientName.trim()}
            phone={phone}
            phoneError={phoneError}
            onPhoneChange={(v) => {
              setPhone(v);
              setPhoneError(null);
            }}
            error={submitError}
            submitting={submitting}
            onSubmit={pay}
          />
        </div>
      )}

      {step === "share" && shareUrl && <ShareStep url={shareUrl} recipient={draft.recipientName.trim()} />}
    </div>
  );
}

/* ------------------------------- Live preview ------------------------------- */

function LivePreview({ content }: { content: GiftContent }) {
  const [replay, setReplay] = useState(0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">Live preview</p>
        <button
          type="button"
          onClick={() => setReplay((r) => r + 1)}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/70 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-burgundy"
        >
          <RefreshIcon className="size-3.5" />
          Replay
        </button>
      </div>
      <RoseGift key={`${replay}-${content.theme}`} gift={content} />
    </div>
  );
}

/* ------------------------------- Design panel ------------------------------- */

const WAX = [
  { name: "Classic", value: "" },
  { name: "Crimson", value: "#8e1b2c" },
  { name: "Gold", value: "#c89a6e" },
  { name: "Rose", value: "#c06476" },
  { name: "Ivory", value: "#e6d8c0" },
  { name: "Midnight", value: "#1f2a5c" },
  { name: "Black", value: "#1b1416" },
];

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
  const occasion = getOccasion(design.occasion);
  const style = designStyle(design);
  const wax = designColors({ ...design, accent: "" }).seal;

  return (
    <div className="animate-fade-up space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-medium text-burgundy-deep sm:text-5xl">Design her rose</h1>
          <p className="mt-3 text-muted">Pick the rose, seal the envelope, and choose how your words are written.</p>
        </div>
        <button type="button" onClick={() => onChange(randomDesign(design))} className={secondaryButton}>
          <ShuffleIcon className="size-4" />
          Surprise me
        </button>
      </div>

      <Fieldset legend="Rose colour">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ROSES.map((r) => (
            <ChoiceTile key={r.id} name="rose" checked={design.rose === r.id} onChange={() => onChange({ rose: r.id })} className="p-3.5">
              <span
                className="block size-10 rounded-full shadow-soft"
                style={{ background: `radial-gradient(circle at 40% 35%, ${r.sheen}, ${r.petal} 45%, ${r.deep})` }}
              />
              <span className="mt-2.5 block text-sm font-medium text-ink">{r.name}</span>
            </ChoiceTile>
          ))}
        </div>
      </Fieldset>

      <Fieldset legend="Wax seal">
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
        <div className="mt-4 flex flex-wrap items-center gap-2.5 rounded-2xl border border-line bg-white/60 px-4 py-3">
          <span className="mr-1 text-sm font-medium text-ink">Wax colour</span>
          {WAX.map((w) => (
            <button
              key={w.name}
              type="button"
              title={w.name}
              aria-label={`${w.name} wax`}
              aria-pressed={design.accent === w.value}
              onClick={() => onChange({ accent: w.value })}
              className={`size-8 rounded-full border border-black/10 shadow-soft transition-transform hover:scale-110 ${
                design.accent === w.value ? "ring-2 ring-burgundy ring-offset-2" : ""
              }`}
              style={{ background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${w.value || wax} 70%, white), ${w.value || wax} 70%)` }}
            />
          ))}
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

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} className="inline-flex items-center justify-center gap-1.5 text-sm text-muted transition-colors hover:text-burgundy">
          <ArrowLeftIcon className="size-4" />
          Back to words
        </button>
        <button type="button" onClick={onNext} className={primaryButton}>
          <EyeIcon className="size-4" />
          Preview her rose
        </button>
      </div>
    </div>
  );
}

/** Our signature gift, front and centre on the first step. */
function RoseBanner({ design, onChange }: { design: Design; onChange: (patch: Partial<Design>) => void }) {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-[linear-gradient(140deg,#2a0a12,#14060a)] p-6 text-cream shadow-lift sm:p-7">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_100%_0%,rgb(156_10_34/0.45),transparent_70%)]" />
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 text-[#ff8da1] shadow-[0_0_30px_-6px_#ff4d6d]">
          <RoseIcon className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider">
              <StarSolid className="size-3 text-gold" />
              Popular
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider">Best gift ever</span>
          </div>
          <h2 className="mt-3 font-display text-2xl font-medium sm:text-3xl">You&apos;re making her a Digital Rose</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-cream/65">
            A 3D rose blooms out of a sealed envelope and your words float around it. She can turn it with her finger and replay it
            whenever she misses you.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-white/10 pt-5">
        <span className="text-sm text-cream/60">Her rose:</span>
        <div className="flex items-center gap-2" role="radiogroup" aria-label="Rose colour">
          {ROSES.map((r) => (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={design.rose === r.id}
              aria-label={r.name}
              title={r.name}
              onClick={() => onChange({ rose: r.id })}
              className={`size-8 rounded-full transition-transform hover:scale-110 ${
                design.rose === r.id ? "ring-2 ring-cream ring-offset-2 ring-offset-[#1d070d]" : ""
              }`}
              style={{ background: `radial-gradient(circle at 38% 32%, ${r.sheen}, ${r.petal} 45%, ${r.deep})` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Checkout --------------------------------- */

function Checkout({
  recipient,
  phone,
  phoneError,
  onPhoneChange,
  error,
  submitting,
  onSubmit,
}: {
  recipient: string;
  phone: string;
  phoneError: string | null;
  onPhoneChange: (v: string) => void;
  error: string | null;
  submitting: boolean;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="mx-auto mt-12 max-w-md rounded-[2rem] border border-line bg-white/70 p-6 shadow-soft sm:p-8"
    >
      <h2 className="font-display text-3xl font-medium text-burgundy-deep">Send it to {recipient || "her"}</h2>
      <p className="mt-1.5 text-sm text-muted">Pay once and get a private link she can open on any device.</p>

      <div className="mt-6 flex items-center justify-between gap-4 border-y border-line py-4">
        <span className="flex items-center gap-2.5 text-sm text-ink">
          <RoseIcon className="size-5 text-rose" />
          Digital Rose{recipient && ` for ${recipient}`}
        </span>
        <span className="font-display text-2xl font-semibold tabular-nums text-burgundy-deep">₹{GIFT_PRICE}</span>
      </div>

      <label className="mt-6 block">
        <span className="mb-2 block text-sm font-medium text-ink">Your mobile number</span>
        <span
          className={`flex items-center rounded-2xl border bg-white/70 transition-colors focus-within:border-burgundy focus-within:bg-white focus-within:ring-4 focus-within:ring-blush ${
            phoneError ? "border-rose" : "border-line"
          }`}
        >
          <span className="border-r border-line py-3 pl-4 pr-3 text-ink">+91</span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="98765 43210"
            maxLength={16}
            aria-invalid={!!phoneError}
            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-ink outline-none placeholder:text-muted/60"
          />
        </span>
        {phoneError ? (
          <span className="mt-1.5 block text-sm text-rose">{phoneError}</span>
        ) : (
          <span className="mt-1.5 block text-xs text-muted">Needed by our payment partner for your receipt.</span>
        )}
      </label>

      {error && (
        <p role="alert" className="mt-5 rounded-2xl border border-rose/30 bg-blush/50 px-4 py-3 text-sm text-burgundy">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className={`${primaryButton} mt-6 w-full`}>
        {submitting ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-cream/30 border-t-cream" />
            Taking you to payment…
          </>
        ) : (
          <>
            Pay ₹{GIFT_PRICE} &amp; get link
            <ArrowRightIcon className="size-4" />
          </>
        )}
      </button>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
        <LockIcon className="size-3.5" />
        Secure checkout by Cashfree · UPI, cards &amp; net banking
      </p>
    </form>
  );
}

export function ShareStep({ url, recipient }: { url: string; recipient: string }) {
  const [copied, setCopied] = useState(false);
  // Only rendered in the browser after payment, so `navigator` is always available.
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

      {/* A full page load, so the next gift starts from a clean draft. */}
      <div className="relative isolate mt-10 overflow-hidden rounded-3xl bg-[linear-gradient(140deg,#2a0a12,#14060a)] p-7 text-cream shadow-lift">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_50%_0%,rgb(156_10_34/0.45),transparent_70%)]" />
        <p className="font-display text-2xl font-medium">Someone else deserves a rose too</p>
        <p className="mt-1.5 text-sm text-cream/65">A friend, your mum, your sister. It only takes two minutes.</p>
        <a
          href="/create"
          className="group mt-5 inline-flex h-13 items-center gap-2.5 rounded-full bg-cream px-7 text-[0.95rem] font-semibold text-burgundy-deep shadow-[0_0_32px_-6px_#ff4d6d] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
        >
          <RoseIcon className="size-5" />
          Create another gift
          <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </a>
      </div>
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
  badge,
  children,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
  /** Small pill in the corner, e.g. "Popular". */
  badge?: string;
  children: ReactNode;
}) {
  return (
    <label
      className={`relative block cursor-pointer rounded-2xl border bg-white/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-burgundy ${className} ${
        checked ? "border-burgundy ring-1 ring-burgundy" : "border-line hover:border-rose/40"
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {badge && (
        <span className="absolute left-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-[linear-gradient(135deg,#c06476,#6b1d2f)] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider text-cream shadow-soft">
          <StarSolid className="size-2.5 text-gold" />
          {badge}
        </span>
      )}
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

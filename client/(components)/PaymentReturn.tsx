"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { verifyPayment } from "@/lib/api";
import { readPendingPayment, type PendingPayment } from "@/lib/payment";
import { DRAFT_KEY, ShareStep } from "./CreateFlow";
import { ArrowRightIcon, CheckIcon, HeartIcon, RefreshIcon } from "./Icons";

type Status = "checking" | "paid" | "unpaid" | "error";

/** UPI payments can take a few seconds to settle after Cashfree redirects back. */
const ATTEMPTS = 4;
const RETRY_DELAY = 2500;

export default function PaymentReturn() {
  const orderId = useSearchParams().get("order_id");
  const [status, setStatus] = useState<Status>("checking");
  const [pending, setPending] = useState<PendingPayment | null>(null);
  const [check, setCheck] = useState(0);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;

    (async () => {
      for (let attempt = 1; attempt <= ATTEMPTS && !cancelled; attempt++) {
        try {
          if (await verifyPayment(orderId)) {
            if (cancelled) return;
            try {
              localStorage.removeItem(DRAFT_KEY);
            } catch {}
            setPending(readPendingPayment(orderId));
            setStatus("paid");
            return;
          }
        } catch {
          if (!cancelled) setStatus("error");
          return;
        }
        if (attempt < ATTEMPTS) await new Promise((r) => setTimeout(r, RETRY_DELAY));
      }
      if (!cancelled) setStatus("unpaid");
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId, check]);

  const checkAgain = () => {
    setStatus("checking");
    setCheck((c) => c + 1);
  };

  if (!orderId) {
    return (
      <Notice title="We couldn't find your payment" body="This link is missing its order details. Start again from your saved draft.">
        <Link href="/create?resume=pay" className={primaryButton}>
          Back to my gift
          <ArrowRightIcon className="size-4" />
        </Link>
      </Notice>
    );
  }

  if (status === "checking") {
    return (
      <div role="status" className="mx-auto mt-24 max-w-md text-center">
        <span className="mx-auto block size-12 animate-spin rounded-full border-2 border-line border-t-burgundy" />
        <h1 className="mt-8 font-display text-3xl font-medium text-burgundy-deep">Confirming your payment…</h1>
        <p className="mt-2 text-muted">This only takes a moment. Please don&apos;t close this page.</p>
      </div>
    );
  }

  if (status === "paid") {
    if (pending) {
      return <ShareStep url={`${window.location.origin}/g/${pending.slug}`} recipient={pending.recipient} />;
    }
    return (
      <Notice
        icon={<CheckIcon className="size-7" />}
        title="Payment received"
        body="Thank you! Your gift is unlocked. Open this page in the browser you paid from to see the link again."
      >
        <Link href="/" className={primaryButton}>
          Back to home
        </Link>
      </Notice>
    );
  }

  return (
    <Notice
      title={status === "error" ? "We couldn't check your payment" : "Payment not completed"}
      body={
        status === "error"
          ? "We couldn't reach the server. If you completed the payment, check again in a moment."
          : "Your payment didn't go through, or it's still being processed. Your gift is saved, so you can try again."
      }
    >
      <Link href="/create?resume=pay" className={primaryButton}>
        Try payment again
        <ArrowRightIcon className="size-4" />
      </Link>
      <button type="button" onClick={checkAgain} className={secondaryButton}>
        <RefreshIcon className="size-4" />
        I&apos;ve paid, check again
      </button>
    </Notice>
  );
}

function Notice({
  icon = <HeartIcon className="size-7" />,
  title,
  body,
  children,
}: {
  icon?: ReactNode;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto mt-16 max-w-md animate-fade-up text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full border border-line bg-white/60 text-rose">{icon}</span>
      <h1 className="mt-6 font-display text-4xl font-medium text-burgundy-deep">{title}</h1>
      <p className="mt-3 text-muted">{body}</p>
      <div className="mt-8 flex flex-col gap-3">{children}</div>
    </div>
  );
}

const primaryButton =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-burgundy px-7 text-sm font-medium text-cream shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:bg-burgundy-deep";

const secondaryButton =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-white/60 px-6 text-sm font-medium text-burgundy transition-colors hover:border-rose/50 hover:bg-white";

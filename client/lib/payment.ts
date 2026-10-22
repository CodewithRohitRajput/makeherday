/** Price of one gift in rupees. Keep in sync with GIFT_PRICE on the server. */
export const GIFT_PRICE = 99;

/** The gift being paid for, kept across the redirect to Cashfree and back. */
export interface PendingPayment {
  orderId: string;
  slug: string;
  recipient: string;
}

const PENDING_KEY = "mhd:payment:v1";

export function savePendingPayment(pending: PendingPayment) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {
    // Without storage the return page can still confirm the payment, just not show the link.
  }
}

export function readPendingPayment(orderId: string): PendingPayment | null {
  try {
    const saved = JSON.parse(localStorage.getItem(PENDING_KEY) ?? "null");
    return saved?.orderId === orderId ? saved : null;
  } catch {
    return null;
  }
}

/** Accepts "98765 43210", "+91 98765-43210" etc. and returns the 10 digits Cashfree expects. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

const SDK_URL = "https://sdk.cashfree.com/js/v3/cashfree.js";

interface CashfreeInstance {
  checkout(options: { paymentSessionId: string; redirectTarget?: "_self" | "_blank" | "_top" | "_modal" }): Promise<{
    error?: { message: string };
  }>;
}

declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => CashfreeInstance;
  }
}

let sdk: Promise<NonNullable<Window["Cashfree"]>> | null = null;

function loadCashfree() {
  sdk ??= new Promise((resolve, reject) => {
    if (window.Cashfree) return resolve(window.Cashfree);
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => (window.Cashfree ? resolve(window.Cashfree) : reject(new Error("Cashfree failed to load")));
    script.onerror = () => {
      sdk = null;
      reject(new Error("We couldn't load the payment page. Please check your connection and try again."));
    };
    document.head.appendChild(script);
  });
  return sdk;
}

/** Sends the browser to Cashfree's checkout. It comes back to /payment/return when done. */
export async function openCheckout(paymentSessionId: string) {
  const Cashfree = await loadCashfree();
  const mode = process.env.NEXT_PUBLIC_CASHFREE_MODE === "production" ? "production" : "sandbox";
  const result = await Cashfree({ mode }).checkout({ paymentSessionId, redirectTarget: "_self" });
  if (result?.error) throw new Error(result.error.message);
}

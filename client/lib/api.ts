import type { GiftType } from "./gifts";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export interface Gift {
  _id: string;
  slug: string;
  giftType: GiftType;
  senderName: string;
  recipientName: string;
  message: string;
  theme: string;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGiftInput {
  giftType: GiftType;
  senderName: string;
  recipientName: string;
  message: string;
  theme: string;
}

interface CreateGiftResponse {
  success: boolean;
  message: string;
  gift: Gift;
  shareUrl: string;
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("We couldn't reach the server. Please check your connection and try again.", 0);
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || data?.success === false) {
    throw new ApiError(data?.message ?? "Something went wrong. Please try again.", res.status);
  }
  return data as T;
}

export function createGift(input: CreateGiftInput) {
  return request<CreateGiftResponse>("/gift/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Returns null when no gift exists for the slug. */
export async function getGift(slug: string): Promise<Gift | null> {
  try {
    const data = await request<{ gift: Gift }>(`/gift/${encodeURIComponent(slug)}`);
    return data.gift;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

interface CreatePaymentResponse {
  message: string;
  orderId: string;
  paymentSessionId: string;
}

/** Starts a Cashfree order for an unpaid gift. Fails with status 409 when it's already paid. */
export function createPayment(giftId: string, customerPhone: string) {
  return request<CreatePaymentResponse>("/pay/payment", {
    method: "POST",
    body: JSON.stringify({ giftId, customerPhone }),
  });
}

export async function verifyPayment(orderId: string): Promise<boolean> {
  const data = await request<{ paid: boolean }>(`/pay/verify?orderId=${encodeURIComponent(orderId)}`);
  return data.paid;
}

import { createHmac, timingSafeEqual } from "crypto";

// Minimal Razorpay REST client (orders + payments) and signature checks
const API_BASE = () => (process.env["RAZORPAY_API_BASE"] || "https://api.razorpay.com").replace(/\/$/, "");
const keyId = () => process.env["RAZORPAY_KEY_ID"]?.trim() || "";
const keySecret = () => process.env["RAZORPAY_KEY_SECRET"]?.trim() || "";

export const isRazorpayConfigured = () => Boolean(keyId() && keySecret());
export const razorpayKeyId = keyId;

export class RazorpayError extends Error {
  constructor(message: string, public status = 502) {
    super(message);
  }
}

const request = async <T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> => {
  const res = await fetch(`${API_BASE()}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId()}:${keySecret()}`).toString("base64")}`,
      ...(body !== undefined && { "Content-Type": "application/json" }),
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(15_000),
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`Razorpay ${method} ${path} failed:`, res.status, data?.error?.description);
    if (res.status === 401) {
      // never log the keys; the prefix shows whether a live or test key was used
      console.error(`Razorpay rejected RAZORPAY_KEY_ID (${keyId().slice(0, 9)}…): check that RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are the same pair, without quotes or spaces`);
      throw new RazorpayError("Online payments are temporarily unavailable. Please try again later.", 503);
    }
    throw new RazorpayError("The payment gateway is not responding. Please try again in a moment.", 502);
  }
  return data as T;
};

export type RazorpayOrder = {
  id: string;
  amount: number; // paise
  currency: string;
  status: string;
  notes: Record<string, string>;
};

export type RazorpayPayment = {
  id: string;
  order_id: string;
  amount: number; // paise
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  method: string;
  card?: { last4?: string; network?: string };
  vpa?: string;
  wallet?: string;
  bank?: string;
};

export const createOrder = (amountInRupees: number, receipt: string, notes: Record<string, string>) =>
  request<RazorpayOrder>("POST", "/v1/orders", { amount: Math.round(amountInRupees * 100), currency: "INR", receipt, notes });

export const fetchOrder = (orderId: string) => request<RazorpayOrder>("GET", `/v1/orders/${encodeURIComponent(orderId)}`);

export const fetchPayment = (paymentId: string) => request<RazorpayPayment>("GET", `/v1/payments/${encodeURIComponent(paymentId)}`);

// all payment attempts made for an order (newest first)
export const fetchOrderPayments = async (orderId: string) =>
  (await request<{ items: RazorpayPayment[] }>("GET", `/v1/orders/${encodeURIComponent(orderId)}/payments`)).items ?? [];

export const capturePayment = (payment: RazorpayPayment) =>
  request<RazorpayPayment>("POST", `/v1/payments/${encodeURIComponent(payment.id)}/capture`, {
    amount: payment.amount,
    currency: payment.currency,
  });

const safeEqualHex = (expected: string, received: string) => {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
};

// Checkout returns signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
export const isValidCheckoutSignature = (orderId: string, paymentId: string, signature: string) =>
  safeEqualHex(createHmac("sha256", keySecret()).update(`${orderId}|${paymentId}`).digest("hex"), signature);

// Webhooks send X-Razorpay-Signature = HMAC_SHA256(raw body, webhook secret)
export const isValidWebhookSignature = (rawBody: Buffer, signature: string) => {
  const secret = process.env["RAZORPAY_WEBHOOK_SECRET"]?.trim();
  if (!secret) return false;
  return safeEqualHex(createHmac("sha256", secret).update(rawBody).digest("hex"), signature);
};

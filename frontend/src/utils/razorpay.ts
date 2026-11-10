import type { PaymentOrderType, RazorpaySuccessType } from "../types/FineType";

type RazorpayInstance = { open: () => void; on: (event: string, cb: (res: { error?: { description?: string } }) => void) => void };
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const CHECKOUT_URL = "https://checkout.razorpay.com/v1/checkout.js";
let loading: Promise<boolean> | null = null;

// load Razorpay Checkout once, only when someone actually pays
export const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve(true);
  loading ??= new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_URL;
    script.onload = () => resolve(true);
    script.onerror = () => {
      loading = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });
  return loading;
};

export type CheckoutOutcome = { status: "paid"; result: RazorpaySuccessType } | { status: "cancelled" };

// open the Razorpay popup and wait until the user pays or closes it
export const openCheckout = (order: PaymentOrderType) =>
  new Promise<CheckoutOutcome>((resolve) => {
    let settled = false;
    const finish = (outcome: CheckoutOutcome) => {
      if (!settled) {
        settled = true;
        resolve(outcome);
      }
    };
    const checkout = new window.Razorpay!({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: "OLMS",
      description: `Fine for "${order.bookTitle}"`,
      prefill: order.prefill,
      theme: { color: "#212529" },
      // UPI first (QR on desktop, UPI apps on mobile), other methods below; UPI Collect is retired by NPCI
      config: {
        display: {
          blocks: { upi: { name: "Pay using UPI", instruments: [{ method: "upi" }] } },
          sequence: ["block.upi"],
          preferences: { show_default_blocks: true },
          hide: [{ method: "upi", flows: ["collect"] }],
        },
      },
      handler: (result: RazorpaySuccessType) => finish({ status: "paid", result }),
      modal: { ondismiss: () => finish({ status: "cancelled" }) },
    });
    // a failed attempt keeps the popup open so the user can retry; we only report it
    checkout.on("payment.failed", (res) => {
      console.warn("Razorpay payment failed:", res.error?.description);
    });
    checkout.open();
  });

// Remember the order being paid, so the result can be fetched if the page reloads
// (e.g. the browser restarts the tab while the user is in a UPI app). Storage may be unavailable.
const PENDING_KEY = "olms_pending_payment";
const PENDING_MAX_AGE_MS = 30 * 60 * 1000;

export const savePendingOrder = (orderId: string) => {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify({ orderId, at: Date.now() }));
  } catch { /* private mode or storage blocked */ }
};

export const readPendingOrder = (): string | null => {
  try {
    const saved = JSON.parse(localStorage.getItem(PENDING_KEY) || "null");
    if (saved?.orderId && Date.now() - saved.at < PENDING_MAX_AGE_MS) return saved.orderId;
    localStorage.removeItem(PENDING_KEY);
  } catch { /* ignore */ }
  return null;
};

export const clearPendingOrder = () => {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch { /* ignore */ }
};

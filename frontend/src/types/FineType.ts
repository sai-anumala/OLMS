// Razorpay order created by the server for a fine (amount in paise)
export type PaymentOrderType = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  bookTitle: string;
  prefill: { name?: string; email?: string; contact?: string };
};

// what Razorpay Checkout hands back after a successful payment
export type RazorpaySuccessType = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

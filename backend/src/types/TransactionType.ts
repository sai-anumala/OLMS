import { ObjectId, Types } from "mongoose";

export type TransactionType = {
  userId: Types.ObjectId;
  payments: PaymentRecordType[];
};

export type PaymentRecordType = {
  bookId: ObjectId | string;
  amount: number;
  paymentMethod: string;
  paymentDetails: Record<string, string>;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
};

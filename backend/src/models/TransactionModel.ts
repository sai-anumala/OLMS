import { Schema, model } from "mongoose";
import { TransactionType } from "../types/TransactionType";

// One fine payment; razorpayPaymentId makes processing the same payment twice impossible
const paymentsSchema = new Schema({
  bookId: { type: Schema.Types.ObjectId, ref: "books", required: true },
  amount: { type: Number, required: true }, // rupees
  paymentMethod: { type: String, required: true }, // upi, card, wallet, netbanking...
  paymentDetails: { type: Schema.Types.Mixed, required: true }, // safe display info only (never full card numbers)
  razorpayPaymentId: { type: String },
  razorpayOrderId: { type: String },
}, {
  strict: "throw",
  versionKey: false,
  timestamps: true,
});

// One document per user holding all their payments
const transactionSchema = new Schema<TransactionType>({
  userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
  payments: [paymentsSchema],
}, {
  strict: "throw",
  versionKey: false,
  timestamps: true,
});

transactionSchema.index({ "payments.razorpayPaymentId": 1 });

export const TransactionModel = model("Transaction", transactionSchema);

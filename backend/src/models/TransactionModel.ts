import { Schema, model } from "mongoose";
import {
  CardDetailsType,
  TransactionType,
  UpiType,
  WalletType
} from "../types/TransactionType";

// Subschemas
const cardDetailsSchema = new Schema<CardDetailsType>({
  card_number: { 
    type: String, 
    required: true 
},
  exp_date: { 
    type: String, 
    required: true 
},
  cvv: { 
    type: String, 
    required: true 
},
},{ 
    _id: false 
});

const upiDetailsSchema = new Schema<UpiType>({
  upiId: {
     type: String, 
     required: true 
    },
    }, 
    {
        _id: false
     });

const walletDetailsSchema = new Schema<WalletType>({
  walletId: { 
    type: String, 
    required: true 
},
}, { _id: false });

const paymentsSchema = new Schema({
  bookId: {
    type: Schema.Types.ObjectId,
    ref: "books",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentDetails: {
    type: Schema.Types.Mixed, // Accepts any of the three types
    required: true
  }
}, {
  strict: "throw",
  versionKey: false,
  timestamps: true // adds createdAt and updatedAt for each payment
});

// Transaction schema
const transactionSchema = new Schema<TransactionType>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  payments: [paymentsSchema]
}, {
  strict: "throw",
  versionKey: false,
  timestamps: true // adds createdAt and updatedAt for the transaction document
});

// Model
export const TransactionModel = model("Transaction", transactionSchema);
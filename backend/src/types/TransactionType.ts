import { ObjectId, Types } from "mongoose";
 
export type TransactionType = {
  userId: Types.ObjectId;
  payments: PaymentDetailsType[];
};

export type CardDetailsType={
  card_number:string;
  exp_date:string,
  cvv:string
}
export type UpiType={
  upiId:string
}

export type WalletType={
  walletId:string
}

export type PaymentDetailsType = {
  bookId: ObjectId | string;
  amount: number;
  paymentMethod: string;
  paymentDetails:UpiType | WalletType | CardDetailsType
};
 
 
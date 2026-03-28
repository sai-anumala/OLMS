export type CardDetailsType={
  card_number: string;
  exp_date: string;
  cvv: string;
};

export type UpiDetailsType={
  upiId: string;
};

export type WalletDetailsType={
  walletId: string;
};

export type PaymentMethodType="card" | "upi" | "wallet";

export type PaymentDetailsType=CardDetailsType | UpiDetailsType | WalletDetailsType;

export interface PaymentFormType{
  userId?:string;
  bookId:string; 
  amount:number;
  paymentMethod:PaymentMethodType;
  paymentDetails:PaymentDetailsType;
  createdAt?:string
  _id?:string
}

export interface TransactionFormType {
  _id?:string
  userId:string;
  payments:PaymentFormType[];
}

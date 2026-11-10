// The CVV is only checked in the form and is never sent to the server
export type CardDetailsType={
  card_number: string;
  exp_date: string;
};

// what the server keeps for a card payment (never the full number)
export type StoredCardDetailsType={
  last4: string;
};

export type UpiDetailsType={
  upiId: string;
};

export type WalletDetailsType={
  walletId: string;
};

export type PaymentMethodType="card" | "upi" | "wallet";

export type PaymentDetailsType=CardDetailsType | StoredCardDetailsType | UpiDetailsType | WalletDetailsType;

// the payer is taken from the login session on the server, so no userId is sent
export interface PaymentFormType{
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

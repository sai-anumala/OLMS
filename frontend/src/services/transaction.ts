import { apiRequest } from "./api";
import type { PaymentFormType } from "../types/FineType";

export const payFine = (payment: PaymentFormType) => apiRequest("/transaction-api/transaction", "POST", payment);
export const getTransactions = () => apiRequest("/transaction-api/read-transaction");

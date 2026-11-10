import { apiRequest } from "./api";
import type { RazorpaySuccessType } from "../types/FineType";

// the server works out the fine; the client only says which book
export const createPaymentOrder = (bookId: string) => apiRequest("/transaction-api/order", "POST", { bookId });
export const verifyPayment = (result: RazorpaySuccessType) => apiRequest("/transaction-api/verify", "POST", result);
export const getTransactions = () => apiRequest("/transaction-api/read-transaction");

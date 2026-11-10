import { apiRequest } from "./api";
import type { RazorpaySuccessType } from "../types/FineType";

// the server works out the fine; the client only says which book
export const createPaymentOrder = (bookId: string) => apiRequest("/transaction-api/order", "POST", { bookId });
// server asks Razorpay whether the order was paid (200 = paid and book returned, 202 = not paid yet)
export const reconcilePayment = (orderId: string) => apiRequest("/transaction-api/reconcile", "POST", { orderId });
export const verifyPayment = (result: RazorpaySuccessType) => apiRequest("/transaction-api/verify", "POST", result);
export const getTransactions = () => apiRequest("/transaction-api/read-transaction");

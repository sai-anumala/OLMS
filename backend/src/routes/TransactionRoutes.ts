import { Router } from "express"
import expressAsyncHandler from "express-async-handler";
import { createPaymentOrder, razorpayWebhook, readTransactionsData, reconcilePayment, verifyPayment } from "../controllers/TransactionController";
import { isAdmin, verifyToken } from "../middlewares/verifyToken";
import { rateLimit } from "../middlewares/rateLimit";

export const TransactionRoute = Router();

const paymentLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

// pay a fine with Razorpay: create the order, then verify the checkout result (logged-in user)
TransactionRoute.post("/order", paymentLimiter, verifyToken, expressAsyncHandler(createPaymentOrder))
TransactionRoute.post("/verify", paymentLimiter, verifyToken, expressAsyncHandler(verifyPayment))
// ask Razorpay whether an order was paid when the browser missed the result
TransactionRoute.post("/reconcile", paymentLimiter, verifyToken, expressAsyncHandler(reconcilePayment))

// Razorpay server-to-server webhook (authenticated by its signature, not a cookie)
TransactionRoute.post("/webhook", expressAsyncHandler(razorpayWebhook))

// read all transactions (admin only)
TransactionRoute.get("/read-transaction", verifyToken, isAdmin, expressAsyncHandler(readTransactionsData))

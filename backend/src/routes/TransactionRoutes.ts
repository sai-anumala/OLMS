import { Router } from "express"
import expressAsyncHandler from "express-async-handler";
import { createTransaction, readTransactionsData } from "../controllers/TransactionController";
import { isAdmin, verifyToken } from "../middlewares/verifyToken";

export const TransactionRoute = Router();

// pay a fine (logged-in user)
TransactionRoute.post("/transaction", verifyToken, expressAsyncHandler(createTransaction))

// read all transactions (admin only)
TransactionRoute.get("/read-transaction", verifyToken, isAdmin, expressAsyncHandler(readTransactionsData))

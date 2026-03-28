import {Router} from "express"
import expressAsyncHandler from "express-async-handler";
import { createTransaction, readTransactionsData } from "../controllers/TransactionController";
import { verifyToken } from "../middlewares/verifyToken";


export const TransactionRoute=Router();
 
//create transaction
TransactionRoute.post("/transaction",verifyToken,expressAsyncHandler(createTransaction))

//Read transactions
TransactionRoute.get("/read-transaction",verifyToken,expressAsyncHandler(readTransactionsData))
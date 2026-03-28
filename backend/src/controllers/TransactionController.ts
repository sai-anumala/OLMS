import { Request, Response } from "express";
import { UserModel } from "../models/UserModel";
import { TransactionModel } from "../models/TransactionModel";
import { BookModel } from "../models/BookModel";

// Create a transaction for fine payment and return the book
export const createTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, bookId, amount, paymentMethod, paymentDetails } =
    req.body as {
      userId: string;
      bookId: string;
      amount: number;
      paymentMethod: string;
      paymentDetails: any;
    };

  // Validate required fields
  if (!userId || !bookId || !amount || !paymentMethod || !paymentDetails) {
    res.status(400).json({ message: "Missing required payment details" });
    return;
  }

  // Validate amount is positive number
  if (typeof amount !== "number" || amount <= 0) {
    res.status(400).json({ message: "Invalid payment amount" });
    return;
  }

  // Check if user exists
  const user = await UserModel.findById(userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  // Check if book exists in user's borrowed books
  const borrowedBook = user.borrowed_books?.find(
    (b) => b.bookId.toString() === bookId
  );
  if (!borrowedBook) {
    res.status(404).json({ message: "Book is not borrowed by this user" });
    return;
  }

  // If there's a fine, ensure amount matches the fine
  const dueFine = borrowedBook.fine || 0;
  if (dueFine <= 0) {
    res.status(400).json({ message: "No fine pending for this book" });
    return;
  }
  if (amount !== dueFine) {
    res.status(400).json({
      message: `Payment amount (${amount}) does not match due fine (${dueFine})`,
    });
    return;
  }

  try {
    // 1. Find or create the transaction document for this user
    let transactionDoc = await TransactionModel.findOne({ userId });
    let isNewTransaction = false;

    // If no transaction document exists, create one with empty payments array to get an _id
    if (!transactionDoc) {
      transactionDoc = new TransactionModel({
        userId,
        payments: [],
      });
      await transactionDoc.save();
      isNewTransaction = true;
    }

    // 2. Perform data updates: remove book from borrowed_books, decrement fine, increment availability, add return_books entry with transactionId
    const pullResult = await UserModel.updateOne(
      { _id: userId },
      { $pull: { borrowed_books: { bookId } } }
    );
    if (pullResult.modifiedCount === 0) {
      // Cleanup: if we created a new empty transaction, delete it
      if (isNewTransaction) {
        await TransactionModel.deleteOne({ _id: transactionDoc._id });
      }
      res.status(500).json({ message: "Failed to remove book from borrowed list" });
      return;
    }

    // Decrement user's fine by the paid amount
    await UserModel.updateOne({ _id: userId }, { $inc: { fine: -amount } });

    // Increment book availability
    await BookModel.updateOne({ _id: bookId }, { $inc: { availability: 1 } });

    // Create return book entry with transaction reference
    const returnEntry = {
      bookId,
      borrowDate: borrowedBook.borrowDate,
      returnDate: new Date(),
      fine: dueFine,
      method: paymentMethod,
      transactionId: transactionDoc._id,
    };
    await UserModel.updateOne(
      { _id: userId },
      { $push: { return_books: returnEntry } }
    );

    // 3. Now that all updates succeeded, add the payment to the transaction document
    transactionDoc.payments.push({
      bookId,
      amount,
      paymentMethod,
      paymentDetails,
    });
    await transactionDoc.save();

    // 4. Fetch updated user (without password)
    const updatedUser = await UserModel.findById(userId).select("-password");

    res.status(200).json({
      message: "Payment successful and book returned",
      payload: updatedUser,
    });
  } catch (error) {
    console.error("Transaction error:", error);
    res.status(500).json({ message: "Internal server error during transaction" });
  }
};

// Read all transactions (admin only)
export const readTransactionsData = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  if (user?.role !== "admin") {
    res.status(403).json({ message: "Access denied. Admin only." });
    return;
  }

  // Fetch transactions without populate to keep raw IDs for frontend mapping
  const transactions = await TransactionModel.find().sort({ createdAt: -1 });

  if (transactions && transactions.length > 0) {
    res.status(200).json({
      message: "Transactions retrieved successfully",
      payload: transactions,
    });
  } else {
    res.status(200).json({
      message: "No transactions available",
      payload: [],
    });
  }
};

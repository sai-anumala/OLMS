import { Request, Response } from "express";
import { UserModel } from "../models/UserModel";
import { TransactionModel } from "../models/TransactionModel";
import { BookModel } from "../models/BookModel";
import { fineFor } from "../services/CalculateFine";
import { serializeUser } from "../services/UserView";
import { asString, isValidId } from "../utils/validate";

const PAYMENT_METHODS = ["card", "upi", "wallet"] as const;

// Turn what the client sent into the small, safe record we keep.
// Full card numbers and CVVs are NEVER stored — only the last 4 digits.
const safePaymentDetails = (method: string, details: any): Record<string, string> | null => {
  if (method === "card") {
    const cardNumber = asString(details?.card_number).replace(/\s/g, "");
    const expiry = asString(details?.exp_date);
    if (!/^\d{12,19}$/.test(cardNumber) || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) return null;
    return { last4: cardNumber.slice(-4) };
  }
  if (method === "upi") {
    const upiId = asString(details?.upiId).trim();
    return /^[\w.-]+@[\w.-]+$/.test(upiId) ? { upiId } : null;
  }
  if (method === "wallet") {
    const walletId = asString(details?.walletId).trim();
    return /^\d{10}$/.test(walletId) ? { walletId } : null;
  }
  return null;
};

// Pay the fine for a borrowed book and return it
export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  // the payer is always the logged-in user, never a userId from the request body
  const user = (req as any).user;
  const { bookId, amount, paymentMethod, paymentDetails } = req.body ?? {};

  if (!isValidId(bookId) || !PAYMENT_METHODS.includes(paymentMethod)) {
    res.status(400).json({ message: "Missing required payment details" });
    return;
  }
  if (typeof amount !== "number" || amount <= 0) {
    res.status(400).json({ message: "Invalid payment amount" });
    return;
  }
  const details = safePaymentDetails(paymentMethod, paymentDetails);
  if (!details) {
    res.status(400).json({ message: "Invalid payment details" });
    return;
  }

  const borrowedBook = user.borrowed_books?.find((b: any) => b.bookId.toString() === bookId);
  if (!borrowedBook) {
    res.status(404).json({ message: "Book is not borrowed by this user" });
    return;
  }
  const dueFine = fineFor(borrowedBook);
  if (dueFine <= 0) {
    res.status(400).json({ message: "No fine pending for this book" });
    return;
  }
  if (amount !== dueFine) {
    res.status(400).json({ message: `The fine is now ₹${dueFine}. Please refresh the page and try again.` });
    return;
  }

  // one transaction document per user, created the first time they pay
  const transactionDoc = await TransactionModel.findOneAndUpdate(
    { userId: user._id },
    { $setOnInsert: { payments: [] } },
    { upsert: true, new: true },
  );

  // move the book from borrowed to returned in one atomic update
  const moved = await UserModel.updateOne(
    { _id: user._id, "borrowed_books.bookId": bookId },
    {
      $pull: { borrowed_books: { bookId } },
      $push: {
        return_books: {
          bookId,
          borrowDate: borrowedBook.borrowDate,
          returnDate: new Date(),
          fine: dueFine,
          method: paymentMethod,
          transactionId: transactionDoc._id,
        },
      },
    },
  );
  if (moved.modifiedCount === 0) {
    res.status(409).json({ message: "This book was already returned" });
    return;
  }

  await BookModel.updateOne({ _id: bookId }, { $inc: { availability: 1 } });
  await TransactionModel.updateOne(
    { _id: transactionDoc._id },
    { $push: { payments: { bookId, amount, paymentMethod, paymentDetails: details } } },
  );

  const updatedUser = await UserModel.findById(user._id).select("-password");
  res.status(200).json({ message: "Payment successful and book returned", payload: await serializeUser(updatedUser) });
};

// Read all payments (admin only — enforced by the isAdmin middleware on the route).
// Returns one ready-to-display row per payment, newest first, with member and book names filled in.
export const readTransactionsData = async (req: Request, res: Response): Promise<void> => {
  const transactions = await TransactionModel.find().lean();

  const userIds = [...new Set(transactions.map((t) => String(t.userId)))];
  const bookIds = [...new Set(transactions.flatMap((t) => t.payments.map((p) => String(p.bookId))))];
  const [users, books] = await Promise.all([
    UserModel.find({ _id: { $in: userIds } }).select("username").lean(),
    BookModel.find({ _id: { $in: bookIds } }).select("title").lean(),
  ]);
  const usernameOf = new Map(users.map((u) => [String(u._id), u.username]));
  const titleOf = new Map(books.map((b) => [String(b._id), b.title]));

  const rows = transactions
    .flatMap((t) =>
      t.payments.map((p: any) => ({
        _id: p._id,
        transactionId: t._id,
        userId: t.userId,
        username: usernameOf.get(String(t.userId)) ?? "Deleted member",
        bookId: p.bookId,
        bookTitle: titleOf.get(String(p.bookId)) ?? "Unknown book",
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        // only ever shows what is safe: last 4 card digits, UPI id or wallet id
        paymentReference: p.paymentDetails?.last4
          ? `card ••${p.paymentDetails.last4}`
          : p.paymentDetails?.upiId ?? p.paymentDetails?.walletId ?? "",
        createdAt: p.createdAt,
      })),
    )
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());

  res.status(200).json({
    message: rows.length ? "Transactions retrieved successfully" : "No transactions available",
    payload: rows,
  });
};

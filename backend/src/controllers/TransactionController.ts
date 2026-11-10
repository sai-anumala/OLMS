import { Request, Response } from "express";
import { UserModel } from "../models/UserModel";
import { TransactionModel } from "../models/TransactionModel";
import { BookModel } from "../models/BookModel";
import { fineFor } from "../services/CalculateFine";
import { serializeUser } from "../services/UserView";
import { asString, isValidId } from "../utils/validate";
import * as razorpay from "../services/Razorpay";

type Result = { status: number; message: string; payload?: unknown };

// Safe display info from a Razorpay payment (Razorpay never gives full card numbers)
const paymentDetailsOf = (p: razorpay.RazorpayPayment): Record<string, string> => {
  const details: Record<string, string> = { method: p.method };
  if (p.card?.last4) details["last4"] = p.card.last4;
  if (p.card?.network) details["network"] = p.card.network;
  if (p.vpa) details["vpa"] = p.vpa;
  if (p.wallet) details["wallet"] = p.wallet;
  if (p.bank) details["bank"] = p.bank;
  return details;
};

// Step 1: create a Razorpay order for the fine the server calculates (never an amount from the client)
export const createPaymentOrder = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  const bookId = req.body?.bookId;
  if (!razorpay.isRazorpayConfigured()) {
    res.status(503).json({ message: "Online payments are not configured yet. Please contact the library." });
    return;
  }
  if (!isValidId(bookId)) {
    res.status(400).json({ message: "Invalid book id" });
    return;
  }
  const record = user.borrowed_books?.find((b: any) => b.bookId.toString() === bookId);
  if (!record) {
    res.status(404).json({ message: "Book is not borrowed by this user" });
    return;
  }
  const fine = fineFor(record);
  if (fine <= 0) {
    res.status(400).json({ message: "No fine pending for this book" });
    return;
  }

  const book = await BookModel.findById(bookId).select("title").lean();
  const userId = user._id.toString();
  const order = await razorpay.createOrder(fine, `fine_${userId.slice(-8)}_${Date.now()}`, { userId, bookId, fine: String(fine) });

  res.status(200).json({
    message: "Order created",
    payload: {
      orderId: order.id,
      amount: order.amount, // paise, as Razorpay Checkout expects
      currency: order.currency,
      keyId: razorpay.razorpayKeyId(),
      bookTitle: book?.title ?? "Library fine",
      prefill: { name: user.username, email: user.email, contact: user.mobile },
    },
  });
};

// Record a captured payment exactly once, then return the book. Used by checkout verify and the webhook.
const finalizePayment = async (paymentId: string, orderId: string, expectedUserId?: string): Promise<Result> => {
  let payment = await razorpay.fetchPayment(paymentId);
  if (payment.order_id !== orderId) return { status: 400, message: "Payment does not belong to this order" };

  // notes were set by us when creating the order, so they are trustworthy
  const order = await razorpay.fetchOrder(orderId);
  const userId = order.notes?.["userId"];
  const bookId = order.notes?.["bookId"];
  if (!isValidId(userId) || !isValidId(bookId)) return { status: 400, message: "Unknown payment order" };
  if (expectedUserId && userId !== expectedUserId) return { status: 403, message: "This payment belongs to another user" };
  if (payment.amount !== order.amount || payment.currency !== "INR") return { status: 400, message: "Payment amount does not match the order" };

  if (payment.status === "authorized") payment = await razorpay.capturePayment(payment); // accounts without auto-capture
  if (payment.status !== "captured") return { status: 402, message: "Payment was not completed" };

  const amount = payment.amount / 100;
  const transactionDoc = await TransactionModel.findOneAndUpdate(
    { userId },
    { $setOnInsert: { payments: [] } },
    { upsert: true, new: true },
  );

  // claim the payment atomically: if it is already recorded, a second call changes nothing
  const claimed = await TransactionModel.updateOne(
    { _id: transactionDoc._id, "payments.razorpayPaymentId": { $ne: payment.id } },
    {
      $push: {
        payments: {
          bookId, amount, paymentMethod: payment.method, paymentDetails: paymentDetailsOf(payment),
          razorpayPaymentId: payment.id, razorpayOrderId: orderId,
        },
      },
    },
  );

  if (claimed.modifiedCount === 1) {
    const user = await UserModel.findById(userId).select("borrowed_books");
    const record = user?.borrowed_books?.find((b: any) => b.bookId.toString() === bookId);
    const moved = await UserModel.updateOne(
      { _id: userId, "borrowed_books.bookId": bookId },
      {
        $pull: { borrowed_books: { bookId } },
        $push: {
          return_books: {
            bookId, borrowDate: record?.borrowDate, returnDate: new Date(),
            fine: amount, method: payment.method, transactionId: transactionDoc._id,
          },
        },
      },
    );
    if (moved.modifiedCount === 1) await BookModel.updateOne({ _id: bookId }, { $inc: { availability: 1 } });
    else console.warn(`Payment ${payment.id} recorded but book ${bookId} was not in the borrowed list of user ${userId}`);
  }

  const updatedUser = await UserModel.findById(userId).select("-password");
  return { status: 200, message: "Payment successful and book returned", payload: await serializeUser(updatedUser) };
};

// Step 2: checkout finished in the browser; verify Razorpay's signature, then finalize
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  const orderId = asString(req.body?.razorpay_order_id);
  const paymentId = asString(req.body?.razorpay_payment_id);
  const signature = asString(req.body?.razorpay_signature);
  if (!orderId || !paymentId || !signature || !razorpay.isValidCheckoutSignature(orderId, paymentId, signature)) {
    res.status(400).json({ message: "Payment verification failed" });
    return;
  }
  const result = await finalizePayment(paymentId, orderId, (req as any).user._id.toString());
  res.status(result.status).json({ message: result.message, payload: result.payload });
};

// Razorpay webhook (payment.captured / order.paid): finishes payments when the browser closed early
export const razorpayWebhook = async (req: Request, res: Response): Promise<void> => {
  const rawBody: Buffer | undefined = (req as any).rawBody;
  const signature = asString(req.headers["x-razorpay-signature"]);
  if (!rawBody || !signature || !razorpay.isValidWebhookSignature(rawBody, signature)) {
    res.status(400).json({ message: "Invalid signature" });
    return;
  }
  const payment = req.body?.payload?.payment?.entity;
  if (["payment.captured", "order.paid"].includes(req.body?.event) && payment?.id && payment?.order_id) {
    const result = await finalizePayment(payment.id, payment.order_id);
    if (result.status !== 200) console.warn(`Webhook for ${payment.id}: ${result.message}`);
  }
  res.status(200).json({ message: "ok" }); // always acknowledge valid webhooks so Razorpay stops retrying
};

// Admin: one display-ready row per payment, newest first
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

  // older demo payments stored upiId/walletId; Razorpay payments store vpa/wallet/bank/last4
  const referenceOf = (p: any) => {
    const d = p.paymentDetails ?? {};
    if (d.last4) return `card ••${d.last4}`;
    return d.vpa ?? d.wallet ?? d.bank ?? d.upiId ?? d.walletId ?? "";
  };

  const rows = transactions
    .flatMap((t) =>
      t.payments.map((p: any) => ({
        _id: p._id,
        transactionId: p.razorpayPaymentId ?? t._id,
        userId: t.userId,
        username: usernameOf.get(String(t.userId)) ?? "Deleted member",
        bookId: p.bookId,
        bookTitle: titleOf.get(String(p.bookId)) ?? "Unknown book",
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        paymentReference: referenceOf(p),
        createdAt: p.createdAt,
      })),
    )
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());

  res.status(200).json({
    message: rows.length ? "Transactions retrieved successfully" : "No transactions available",
    payload: rows,
  });
};

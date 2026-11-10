import { BookModel } from "../models/BookModel";
import { TransactionModel } from "../models/TransactionModel";
import { fineFor } from "./CalculateFine";
import { bookSummary, bookView } from "./BookView";

export const MAX_BORROW_LIMIT = 4;

const toPlain = (doc: any) => (typeof doc?.toObject === "function" ? doc.toObject() : { ...doc });

// User JSON for clients: no password, live fines/overdue, attached book details, cart_books and summary
export const serializeUsers = async (userDocs: any[]) => {
  const users = userDocs.filter(Boolean).map(toPlain);

  const bookIds = new Set<string>();
  for (const user of users) {
    for (const r of user.borrowed_books || []) bookIds.add(String(r.bookId));
    for (const r of user.return_books || []) bookIds.add(String(r.bookId));
    for (const id of user.cart || []) bookIds.add(String(id));
  }
  const books = bookIds.size ? await BookModel.find({ _id: { $in: [...bookIds] } }).lean() : [];
  const bookById = new Map(books.map((b) => [String(b._id), b]));

  // returns paid online before paymentId was stored: find their Razorpay payment id (one query)
  const missingTxIds = new Set<string>();
  for (const user of users)
    for (const r of user.return_books || []) if (r.transactionId && !r.paymentId) missingTxIds.add(String(r.transactionId));
  const txById = new Map<string, any[]>();
  if (missingTxIds.size) {
    const txs = await TransactionModel.find({ _id: { $in: [...missingTxIds] } }).select("payments").lean();
    for (const t of txs) txById.set(String(t._id), (t.payments as any[]).filter((p) => p.razorpayPaymentId));
  }
  // the payment for this book closest in time to the return
  const paymentIdFor = (record: any): string | undefined => {
    if (record.paymentId) return record.paymentId;
    const candidates = (txById.get(String(record.transactionId)) ?? []).filter((p) => String(p.bookId) === String(record.bookId));
    const returnedAt = new Date(record.returnDate).getTime();
    candidates.sort((a, b) => Math.abs(new Date(a.createdAt).getTime() - returnedAt) - Math.abs(new Date(b.createdAt).getTime() - returnedAt));
    return candidates[0]?.razorpayPaymentId;
  };

  const now = new Date();
  return users.map((user) => {
    delete user.password;

    user.borrowed_books = (user.borrowed_books || []).map((record: any) => {
      const fine = fineFor(record, now);
      return {
        ...record,
        fine,
        overdue: record.dueDate ? new Date(record.dueDate).getTime() < now.getTime() : false,
        book: bookSummary(bookById.get(String(record.bookId))),
      };
    });
    user.return_books = (user.return_books || []).map((record: any) => {
      const paymentId = paymentIdFor(record);
      return { ...record, ...(paymentId && { paymentId }), book: bookSummary(bookById.get(String(record.bookId))) };
    });
    // cart: only books that still exist and aren't removed, so the cart page and the navbar count agree
    // (stale ids stay in the database, so a restored book reappears in the cart)
    const cartBooks = [...new Set<string>((user.cart || []).map(String))]
      .map((id) => bookById.get(id))
      .filter((book: any) => book && book.isDelete !== true);
    user.cart = cartBooks.map((book: any) => String(book._id));
    user.cart_books = cartBooks.map(bookView);

    const totalFine = user.borrowed_books.reduce((total: number, r: any) => total + r.fine, 0);
    user.fine = totalFine;
    user.summary = {
      borrowedCount: user.borrowed_books.length,
      overdueCount: user.borrowed_books.filter((r: any) => r.overdue).length,
      totalFine,
      borrowLimit: MAX_BORROW_LIMIT,
      remainingBorrows: Math.max(0, MAX_BORROW_LIMIT - user.borrowed_books.length),
    };
    return user;
  });
};

export const serializeUser = async (userDoc: any) =>
  userDoc ? (await serializeUsers([userDoc]))[0] : null;

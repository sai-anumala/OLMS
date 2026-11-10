import { BookModel } from "../models/BookModel";
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
    user.return_books = (user.return_books || []).map((record: any) => ({
      ...record,
      book: bookSummary(bookById.get(String(record.bookId))),
    }));
    // cart_books: full book details for the cart page (books removed from the library are skipped)
    user.cart_books = (user.cart || [])
      .map((id: any) => bookById.get(String(id)))
      .filter((book: any) => book && book.isDelete !== true)
      .map(bookView);

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

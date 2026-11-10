// Business rules about books, kept in one place so the frontend never has to decide them.

// a book can be borrowed / added to cart only when a copy is left and it is active and not removed
export const isBookAvailable = (book: any): boolean =>
  !!book && book.availability > 0 && book.status !== false && book.isDelete !== true;

// JSON shape of a book sent to clients
export const bookView = (bookDoc: any) => {
  if (!bookDoc) return null;
  const book = typeof bookDoc.toObject === "function" ? bookDoc.toObject() : { ...bookDoc };
  return { ...book, isAvailable: isBookAvailable(book) };
};

// small version used inside borrowed / returned records
export const bookSummary = (book: any) =>
  book ? { _id: book._id, title: book.title, author: book.author, image: book.image } : null;

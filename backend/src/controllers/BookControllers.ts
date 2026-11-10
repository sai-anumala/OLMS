import { Request, Response } from "express";
import { BookModel } from "../models/BookModel";
import { asString, escapeRegex, isValidId, pickFields } from "../utils/validate";
import { bookView } from "../services/BookView";

// fields an admin may set on a book (never _id or isDelete)
const BOOK_FIELDS = [
  "title", "genre", "author", "description", "copies", "availability",
  "isbn", "image", "pages", "published", "rating", "status",
] as const;

// returns an error message, or null when the numbers make sense
const checkBookNumbers = (book: Record<string, any>): string | null => {
  for (const key of ["copies", "availability", "pages"]) {
    if (book[key] !== undefined && (!Number.isFinite(Number(book[key])) || Number(book[key]) < 0)) {
      return `${key} must be a positive number`;
    }
  }
  if (book["rating"] !== undefined && (Number(book["rating"]) < 0 || Number(book["rating"]) > 5)) {
    return "rating must be between 0 and 5";
  }
  if (book["copies"] !== undefined && book["availability"] !== undefined && Number(book["availability"]) > Number(book["copies"])) {
    return "availability cannot be more than copies";
  }
  return null;
};

const MAX_SEARCH_LENGTH = 100;

//-----------------------CATALOG (public)------------------
// Books visible to readers: removed books are never included.
// Optional ?search= matches title, author or genre (case-insensitive).
export const readAllBooks = async (req: Request, res: Response) => {
  const search = asString(req.query["search"]).trim().slice(0, MAX_SEARCH_LENGTH);
  const filter: Record<string, unknown> = { isDelete: { $ne: true } };
  if (search) {
    const pattern = { $regex: escapeRegex(search), $options: "i" };
    filter["$or"] = [{ title: pattern }, { author: pattern }, { genre: pattern }];
  }
  const booksList = await BookModel.find(filter);
  res.status(200).json({ message: "Books", payload: booksList.map(bookView) });
};

//-----------------------ALL BOOKS (admin)------------------
// Includes removed books so the admin can restore them
export const readManagedBooks = async (req: Request, res: Response) => {
  const booksList = await BookModel.find();
  res.status(200).json({ message: "Books", payload: booksList.map(bookView) });
};

// ------------------ Add Book---------------------------
export const addNewBook = async (req: Request, res: Response) => {
  const newBook = pickFields(req.body, BOOK_FIELDS);
  // a brand new book starts with every copy available
  if (newBook["availability"] === undefined) newBook["availability"] = newBook["copies"];

  const problem = checkBookNumbers(newBook);
  if (problem) {
    res.status(400).json({ message: problem });
    return;
  }
  const isbn = asString(newBook["isbn"]).trim();
  if (!isbn) {
    res.status(400).json({ message: "ISBN is required" });
    return;
  }
  if (await BookModel.findOne({ isbn })) {
    res.status(409).json({ message: "Book already exists in the library" });
    return;
  }
  const resObj = await BookModel.create({ ...newBook, isbn });
  res.status(201).json({ message: "Book Successfully Added To The Library", payload: bookView(resObj) });
};

// ------------------ Update Book -----------------------
export const updateBook = async (req: Request, res: Response) => {
  const bookId = req.body?._id;
  if (!isValidId(bookId)) {
    res.status(400).json({ message: "Invalid book id" });
    return;
  }
  const book = await BookModel.findById(bookId);
  if (!book) {
    res.status(404).json({ message: "Book not found" });
    return;
  }
  const updates = pickFields(req.body, BOOK_FIELDS);
  const problem = checkBookNumbers({ copies: book.copies, availability: book.availability, ...updates });
  if (problem) {
    res.status(400).json({ message: problem });
    return;
  }
  if (updates["isbn"] !== undefined) {
    const isbn = asString(updates["isbn"]).trim();
    if (!isbn || (await BookModel.findOne({ isbn, _id: { $ne: bookId } }))) {
      res.status(409).json({ message: "Another book already uses this ISBN" });
      return;
    }
    updates["isbn"] = isbn;
  }
  await BookModel.updateOne({ _id: bookId }, { $set: updates }, { runValidators: true });
  res.status(200).json({ message: "Book details are updated" });
};

// ---------------- Remove / Restore Book (soft delete toggle) -----------
export const deleteBook = async (req: Request, res: Response) => {
  const bookId = req.body?.bookId;
  if (!isValidId(bookId)) {
    res.status(400).json({ message: "Invalid book id" });
    return;
  }
  const bookObj = await BookModel.findById(bookId);
  if (!bookObj) {
    res.status(404).json({ message: "Book not found" });
    return;
  }
  const removing = bookObj.isDelete !== true;
  await BookModel.updateOne({ _id: bookId }, { $set: { isDelete: removing } });
  res.status(200).json({
    message: removing ? `${bookObj.title} Book Removed From The Library` : `${bookObj.title} Book Restored To The Library`,
  });
};

// -------------------- Book Status Update (active / inactive) --------------------
export const bookStatusUpate = async (req: Request, res: Response) => {
  const bookId = req.body?.bookId;
  if (!isValidId(bookId)) {
    res.status(400).json({ message: "Invalid book id" });
    return;
  }
  const bookObj = await BookModel.findById(bookId);
  if (!bookObj) {
    res.status(404).json({ message: "Book not found" });
    return;
  }
  const active = bookObj.status === false; // toggle
  await BookModel.updateOne({ _id: bookId }, { $set: { status: active } });
  res.status(200).json({ message: active ? "Book Status Changed To Active" : "Book Status Changed To In-Active" });
};

// -------------------- Chatbot --------------------
const MAX_MESSAGE_LENGTH = 200;

export const chatbot = async (req: Request, res: Response) => {
  const message = asString(req.body?.message).trim();
  if (!message) {
    res.status(400).json({ message: "No query provided" });
    return;
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    res.status(400).json({ message: `Please keep your question under ${MAX_MESSAGE_LENGTH} characters` });
    return;
  }

  // escape the text so characters like "(" or ".*" are matched literally (no crashes / slow regexes)
  const pattern = { $regex: escapeRegex(message), $options: "i" };
  const books = await BookModel.find({
    isDelete: { $ne: true },
    $or: [{ title: pattern }, { genre: pattern }, { author: pattern }, { description: pattern }],
  })
    .select("title author genre description availability")
    .limit(10)
    .lean();

  if (books.length === 0) {
    res.status(200).json({ reply: "Sorry, no books found matching your search.", payload: [] });
    return;
  }

  const fallbackReply =
    `I found ${books.length} matching book(s):\n` +
    books.map((b) => `• ${b.title} by ${b.author} (${b.availability > 0 ? "available" : "currently unavailable"})`).join("\n");

  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    res.status(200).json({ reply: fallbackReply, payload: books });
    return;
  }

  const bookSummary = books.map(({ title, author, genre, description, availability }) => ({
    title, author, genre, description, availableCopies: availability,
  }));
  const prompt =
    `You are a helpful library assistant. A user searched for: "${message}".\n` +
    `Matching books from the library:\n${JSON.stringify(bookSummary, null, 2)}\n` +
    `Write a short, friendly reply summarizing these books. Only mention books from this list.`;

  try {
    const aiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        // key goes in a header, not the URL, so it doesn't end up in logs
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: AbortSignal.timeout(15_000),
      },
    );
    const aiData: any = aiResponse.ok ? await aiResponse.json() : null;
    const reply = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || fallbackReply;
    res.status(200).json({ reply, payload: books });
  } catch (error) {
    console.error("Chatbot AI request failed:", error);
    res.status(200).json({ reply: fallbackReply, payload: books });
  }
};

import { CookieOptions, Request, Response } from "express";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { UserModel } from "../models/UserModel";
import { BookModel } from "../models/BookModel";
import { fineFor, serializeUser } from "../services/CalculateFine";
import { buildProfileUpdate } from "../services/UserProfile";
import { asString, EMAIL_RE, isValidId, MIN_PASSWORD_LENGTH, MOBILE_RE } from "../utils/validate";

export const MAX_BORROW_LIMIT = 4;
const LOAN_DAYS = 7;

// The same options must be used when setting and clearing the cookie,
// otherwise the browser will not remove it on logout.
const cookieOptions = (): CookieOptions => ({
  httpOnly: true,
  sameSite: "none",
  secure: true,
  path: "/",
  ...(process.env["COOKIE_DOMAIN"] ? { domain: process.env["COOKIE_DOMAIN"] } : {}),
});

// -------------------- Add New User / Register ----------
export const addNewUser = async (req: Request, res: Response) => {
  // only take the fields a new user is allowed to choose (never role, fine, status...)
  const username = asString(req.body?.username).trim();
  const email = asString(req.body?.email).trim().toLowerCase();
  const mobile = asString(req.body?.mobile).trim();
  const password = asString(req.body?.password);

  if (username.length < 3 || username.length > 30) {
    res.status(400).json({ message: "Username must be 3 to 30 characters" });
    return;
  }
  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ message: "Invalid email address" });
    return;
  }
  if (!MOBILE_RE.test(mobile)) {
    res.status(400).json({ message: "Enter a valid 10-digit mobile number" });
    return;
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    return;
  }

  const existing = await UserModel.findOne({ $or: [{ username }, { email }] });
  if (existing) {
    const field = existing.username === username ? "username" : "email";
    res.status(409).json({ message: `User already exists, try with a different ${field}` });
    return;
  }

  const userDoc = await UserModel.create({
    username,
    email,
    mobile,
    password: await hash(password, 10),
    role: "user",
    status: true,
    fine: 0,
    cart: [],
    borrowed_books: [],
    return_books: [],
  });
  res.status(201).json({ message: "User Created Successfully", payload: serializeUser(userDoc) });
};

// -------------------- Login User-----------------------
export const loginUser = async (req: Request, res: Response) => {
  const username = asString(req.body?.username).trim();
  const password = asString(req.body?.password);

  const userObj = username ? await UserModel.findOne({ username }) : null;
  // same message for wrong username and wrong password, so attackers can't discover usernames
  if (!userObj || !(await compare(password, userObj.password))) {
    res.status(401).json({ message: "Invalid username or password" });
    return;
  }
  if (userObj.status === false) {
    res.status(403).json({ message: "Your account is on hold. Please contact the library." });
    return;
  }

  // keep the token small: only the id. verifyToken loads fresh user data on every request.
  const signedToken = sign({ user: { _id: userObj._id.toString() } }, process.env["SECRET"]!, { expiresIn: "1d" });
  res.cookie("token", signedToken, { ...cookieOptions(), maxAge: 24 * 60 * 60 * 1000 });
  res.status(200).json({ message: "Logged in successfully", payload: serializeUser(userObj) });
};

// -------------------- Read all users (admin) -----------------
export const readAllUsers = async (req: Request, res: Response) => {
  const usersData = await UserModel.find().select("-password");
  res.status(200).json({ message: "Users details", payload: usersData.map(serializeUser) });
};

// -------------------- Update own profile ---------------------
export const updateUser = async (req: Request, res: Response) => {
  // always update the logged-in user, never an id sent by the client
  const userId = (req as any).user._id.toString();
  const result = await buildProfileUpdate(req.body, userId, { allowPassword: true });
  if (!result.ok) {
    res.status(result.status).json({ message: result.message });
    return;
  }
  const updated = await UserModel.findByIdAndUpdate(userId, { $set: result.updates }, { new: true, runValidators: true });
  res.status(200).json({ message: "Profile updated successfully", payload: serializeUser(updated) });
};

//--------------------- Add To Cart ----------------------
export const addToCart = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const bookId = req.body?.bookId;
  if (!isValidId(bookId)) {
    res.status(400).json({ message: "Invalid book id" });
    return;
  }
  const book = await BookModel.findOne({ _id: bookId, isDelete: { $ne: true } });
  if (!book) {
    res.status(404).json({ message: "Book not found" });
    return;
  }
  // the {cart: {$ne}} condition makes "check + add" a single atomic step
  const updateStatus = await UserModel.updateOne({ _id: userId, cart: { $ne: bookId } }, { $push: { cart: bookId } });
  if (updateStatus.modifiedCount === 0) {
    res.status(409).json({ message: "Book already exists in cart" });
    return;
  }
  res.status(200).json({ message: "Book successfully added to cart" });
};

// -------------------- Remove From Cart-----------------
export const removeFromCart = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const bookId = req.body?.bookId;
  if (!isValidId(bookId)) {
    res.status(400).json({ message: "Invalid book id" });
    return;
  }
  const updateStatus = await UserModel.updateOne({ _id: userId, cart: bookId }, { $pull: { cart: bookId } });
  if (updateStatus.modifiedCount === 0) {
    res.status(404).json({ message: "Book not exists in cart" });
    return;
  }
  res.status(200).json({ message: "Book removed from cart" });
};

// -------------------- Shared borrow logic ---------------------
type BorrowResult = { status: number; message: string; payload?: unknown };

const borrowBooksForUser = async (user: any, requestedIds: unknown): Promise<BorrowResult> => {
  if (!Array.isArray(requestedIds) || requestedIds.length === 0) {
    return { status: 400, message: "Cart is empty.." };
  }
  if (!requestedIds.every(isValidId)) {
    return { status: 400, message: "Invalid book id" };
  }
  const ids: string[] = [...new Set(requestedIds as string[])];

  const books = await BookModel.find({ _id: { $in: ids } });
  const titleOf = (id: string) => books.find((b) => b._id.toString() === id)?.title ?? "Unknown book";
  if (books.length !== ids.length) {
    return { status: 404, message: "Some of the selected books were not found" };
  }

  const borrowedIds: string[] = (user.borrowed_books || []).map((b: any) => b.bookId.toString());
  const alreadyBorrowed = ids.filter((id) => borrowedIds.includes(id));
  if (alreadyBorrowed.length > 0) {
    return {
      status: 409,
      message: `You have already borrowed: ${alreadyBorrowed.map(titleOf).join(", ")}. Remove them to borrow the rest.`,
    };
  }

  const canBorrow = MAX_BORROW_LIMIT - borrowedIds.length;
  if (canBorrow <= 0) {
    return { status: 409, message: "Borrow limit reached. Please return at least one book before borrowing a new one.." };
  }
  if (ids.length > canBorrow) {
    return { status: 409, message: `You can only borrow ${canBorrow} more book(s)..` };
  }

  const unavailable = books.filter((b) => b.isDelete === true || b.status === false || b.availability <= 0);
  if (unavailable.length > 0) {
    return {
      status: 409,
      message: `These books are unavailable: ${unavailable.map((b) => b.title).join(", ")}. Please remove them or choose other books..`,
    };
  }

  // Reserve one copy of each book. The {availability: {$gt: 0}} condition makes
  // "check + decrement" atomic, so two users can never take the last copy at the same time.
  const reserved: string[] = [];
  const release = () =>
    reserved.length ? BookModel.updateMany({ _id: { $in: reserved } }, { $inc: { availability: 1 } }) : null;

  for (const id of ids) {
    const result = await BookModel.updateOne(
      { _id: id, availability: { $gt: 0 }, status: { $ne: false }, isDelete: { $ne: true } },
      { $inc: { availability: -1 } },
    );
    if (result.modifiedCount === 0) {
      await release();
      return { status: 409, message: `"${titleOf(id)}" just became unavailable. Please try again.` };
    }
    reserved.push(id);
  }

  const borrowDate = new Date();
  const dueDate = new Date(borrowDate);
  dueDate.setDate(dueDate.getDate() + LOAN_DAYS);
  const records = ids.map((bookId) => ({ bookId, borrowDate, dueDate, fine: 0 }));

  // Add to the user's borrowed list only if the limit still holds and none of the books
  // are borrowed already ("borrowed_books.N" exists means the user has more than N books).
  const userUpdate = await UserModel.updateOne(
    {
      _id: user._id,
      [`borrowed_books.${MAX_BORROW_LIMIT - ids.length}`]: { $exists: false },
      "borrowed_books.bookId": { $nin: ids },
    },
    { $push: { borrowed_books: { $each: records } }, $pull: { cart: { $in: ids } } },
  );
  if (userUpdate.modifiedCount === 0) {
    await release();
    return { status: 409, message: "Could not borrow the books, please refresh and try again." };
  }

  const updatedUser = await UserModel.findById(user._id).select("-password");
  return {
    status: 200,
    message: ids.length > 1 ? "Books Borrowed Successfully.." : "Book Borrowed Successfully..",
    payload: serializeUser(updatedUser),
  };
};

// -------------------- Borrow Book---------------------
export const borrowBook = async (req: Request, res: Response) => {
  const result = await borrowBooksForUser((req as any).user, [req.body?.bookId]);
  res.status(result.status).json({ message: result.message, payload: result.payload });
};

// -------------------- Borrow Cart Multiple books----------------
export const borrowCartBooks = async (req: Request, res: Response) => {
  const result = await borrowBooksForUser((req as any).user, req.body?.books);
  res.status(result.status).json({ message: result.message, payload: result.payload });
};

// -------------------- Return Book---------------------
export const returnBook = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const bookId = req.body?.bookId;
  if (!isValidId(bookId)) {
    res.status(400).json({ message: "Invalid book id" });
    return;
  }

  const record = user.borrowed_books?.find((b: any) => b.bookId.toString() === bookId);
  if (!record) {
    res.status(404).json({ message: "Book is not on borrow list" });
    return;
  }
  if (fineFor(record) > 0) {
    res.status(409).json({ message: "Pay fine before returning the book.." });
    return;
  }

  // move the book from borrowed_books to return_books in one atomic update
  const moved = await UserModel.updateOne(
    { _id: user._id, "borrowed_books.bookId": bookId },
    {
      $pull: { borrowed_books: { bookId } },
      $push: { return_books: { bookId, borrowDate: record.borrowDate, returnDate: new Date(), fine: 0 } },
    },
  );
  if (moved.modifiedCount === 0) {
    res.status(409).json({ message: "Book was already returned" });
    return;
  }
  await BookModel.updateOne({ _id: bookId }, { $inc: { availability: 1 } });

  const updatedUser = await UserModel.findById(user._id).select("-password");
  res.status(200).json({ message: "Book Returned Successfully...", payload: serializeUser(updatedUser) });
};

//--------------------- User Logout----------------------
export const userLogout = async (req: Request, res: Response) => {
  res.clearCookie("token", cookieOptions());
  res.status(200).json({ message: "Logout successful" });
};

import { Request, Response } from "express";
import { UserModel } from "../models/UserModel";
import { serializeUser, serializeUsers } from "../services/UserView";
import { BookModel } from "../models/BookModel";
import { TransactionModel } from "../models/TransactionModel";
import { buildProfileUpdate } from "../services/UserProfile";
import { isValidId } from "../utils/validate";

// -------------------- Update User (admin) ---------------------
export const updateUserData = async (req: Request, res: Response) => {
  const userId = req.body?._id;
  if (!isValidId(userId)) {
    res.status(400).json({ message: "Invalid user id" });
    return;
  }
  const target = await UserModel.findById(userId);
  if (!target) {
    res.status(404).json({ message: "User Not Found" });
    return;
  }
  // admins can fix contact details, but not passwords, roles or fines
  const result = await buildProfileUpdate(req.body, userId, { allowPassword: false });
  if (!result.ok) {
    res.status(result.status).json({ message: result.message });
    return;
  }
  const user = await UserModel.findByIdAndUpdate(userId, { $set: result.updates }, { new: true, runValidators: true });
  res.status(200).json({ message: "User Information Updated Successfully", payload: await serializeUser(user) });
};

//--------------------- Hold / Unhold User -----------------------
export const holdUser = async (req: Request, res: Response) => {
  const userId = req.body?.userId;
  if (!isValidId(userId)) {
    res.status(400).json({ message: "Invalid user id" });
    return;
  }
  if ((req as any).user._id.toString() === userId) {
    res.status(400).json({ message: "You cannot put your own account on hold" });
    return;
  }
  const target = await UserModel.findById(userId);
  if (!target) {
    res.status(404).json({ message: "User Not Found" });
    return;
  }
  if (target.role === "admin") {
    res.status(403).json({ message: "Admin accounts cannot be put on hold" });
    return;
  }
  const newStatus = target.status === false; // toggle
  const user = await UserModel.findByIdAndUpdate(userId, { $set: { status: newStatus } }, { new: true });
  res.status(200).json({
    message: newStatus ? `${target.username} is active again` : `${target.username} is now on hold`,
    payload: await serializeUser(user),
  });
};

//--------------------- Delete User -----------------------
export const deleteUser = async (req: Request, res: Response) => {
  const userId = req.body?.userId;
  if (!isValidId(userId)) {
    res.status(400).json({ message: "Invalid user id" });
    return;
  }
  if ((req as any).user._id.toString() === userId) {
    res.status(400).json({ message: "You cannot delete your own account" });
    return;
  }
  const target = await UserModel.findById(userId);
  if (!target) {
    res.status(404).json({ message: "User Not Found" });
    return;
  }
  if (target.role === "admin") {
    res.status(403).json({ message: "Admin accounts cannot be deleted" });
    return;
  }
  // deleting a user who still holds books would make those copies disappear from the library
  if ((target.borrowed_books?.length ?? 0) > 0) {
    res.status(409).json({ message: `${target.username} still has borrowed books. They must be returned first.` });
    return;
  }
  await UserModel.deleteOne({ _id: userId });
  res.status(200).json({ message: "User information deleted Successfully..." });
};

//--------------------- Dashboard -----------------------
// Everything the admin dashboard shows, already calculated
export const dashboard = async (req: Request, res: Response) => {
  const [members, totalBooks, collected] = await Promise.all([
    UserModel.find({ role: { $ne: "admin" } }).select("-password"),
    BookModel.countDocuments({ isDelete: { $ne: true } }),
    TransactionModel.aggregate([
      { $unwind: "$payments" },
      { $group: { _id: null, total: { $sum: "$payments.amount" } } },
    ]),
  ]);
  const users = await serializeUsers(members);

  // one row per book currently checked out, most overdue first
  const currentlyBorrowed = users
    .flatMap((user: any) =>
      user.borrowed_books.map((record: any) => ({
        borrowerId: user._id,
        borrowerName: user.username,
        bookId: record.bookId,
        bookTitle: record.book?.title ?? "Unknown book",
        author: record.book?.author ?? "",
        bookImage: record.book?.image ?? "",
        borrowDate: record.borrowDate,
        dueDate: record.dueDate,
        fine: record.fine,
        overdue: record.overdue,
      })),
    )
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  res.status(200).json({
    message: "Dashboard",
    payload: {
      stats: {
        totalBooks,
        totalMembers: users.length,
        borrowedCount: currentlyBorrowed.length,
        overdueCount: currentlyBorrowed.filter((r: any) => r.overdue).length,
        pendingFines: users.reduce((total: number, u: any) => total + u.summary.totalFine, 0),
        collectedFines: collected[0]?.total ?? 0,
      },
      currentlyBorrowed,
    },
  });
};

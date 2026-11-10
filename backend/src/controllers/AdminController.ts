import { Request, Response } from "express";
import { UserModel } from "../models/UserModel";
import { serializeUser } from "../services/CalculateFine";
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
  res.status(200).json({ message: "User Information Updated Successfully", payload: serializeUser(user) });
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
  const newStatus = target.status === false; // toggle
  const user = await UserModel.findByIdAndUpdate(userId, { $set: { status: newStatus } }, { new: true });
  res.status(200).json({
    message: newStatus ? `${target.username} is active again` : `${target.username} is now on hold`,
    payload: serializeUser(user),
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
  // deleting a user who still holds books would make those copies disappear from the library
  if ((target.borrowed_books?.length ?? 0) > 0) {
    res.status(409).json({ message: `${target.username} still has borrowed books. They must be returned first.` });
    return;
  }
  await UserModel.deleteOne({ _id: userId });
  res.status(200).json({ message: "User information deleted Successfully..." });
};

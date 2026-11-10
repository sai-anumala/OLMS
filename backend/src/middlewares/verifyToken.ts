import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { UserModel } from "../models/UserModel";

// Load the logged-in user into req.user; 401 if not logged in, 403 if the account is on hold
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.["token"];
    if (!token) {
      res.status(401).json({ message: "Please login to continue" });
      return;
    }

    let decoded: any;
    try {
      decoded = verify(token, process.env["SECRET"]!);
    } catch {
      res.status(401).json({ message: "Session expired, please login again" });
      return;
    }

    const userId = decoded?.user?._id;
    const user = userId ? await UserModel.findById(userId).select("-password") : null;
    if (!user) {
      res.status(401).json({ message: "Session expired, please login again" });
      return;
    }
    if (user.status === false) {
      res.status(403).json({ message: "Your account is on hold. Please contact the library." });
      return;
    }

    (req as any).user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Use after verifyToken on routes that only admins may call
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user?.role !== "admin") {
    res.status(403).json({ message: "Access denied. Admin only." });
    return;
  }
  next();
};

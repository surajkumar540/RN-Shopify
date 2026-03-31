import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("PROTECT HIT");
    const { userId } = req.auth();
    console.log("userId:", userId);

    if (!userId) {
      console.log("NO USER ID");
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    const user = await User.findOne({ clerkId: userId });
    console.log("USER FROM DB:", user?._id);
    req.user = user;
    next();
  } catch (error: any) {
    console.log("AUTH ERROR:", error.message);
    res.status(500).json({ success: false, message: "Authentication failed" });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role!)) {
      return res.status(403).json({
        success: false,
        message: "User role not authorized",
      });
    }
    next();
  };
};

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
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found in DB",
      });
    }

    req.user = user;
    next();
  } catch (error: any) {
    console.log("AUTH ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
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

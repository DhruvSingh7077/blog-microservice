import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

import type { IUser } from "../model/User.js";

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}
export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "please login - no token",
      });
      return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "please login - no token" });
      return;
    }

    const decodeValue = jwt.verify(
      token,
      process.env.JWT_SEC as string
    ) as JwtPayload;

    if (!decodeValue || !decodeValue.user) {
      res.status(401).json({
        message: "please login - invalid token",
      });
      return;
    }
    req.user = decodeValue.user;
    next();
  } catch (error) {
    console.log("JwT verification error:", error);
    res.status(401).json({
      message: "please login -jwt error",
    });
  }
};

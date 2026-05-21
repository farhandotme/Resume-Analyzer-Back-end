import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // check token exists after split
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Token is missing.",
      });
    }

    // check JWT_SECRET exists
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        error: "Server misconfiguration.",
      });
    }

    // verify token
    const decoded = jwt.verify(token, secret) as unknown as { userId: string };

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token.",
    });
  }
};

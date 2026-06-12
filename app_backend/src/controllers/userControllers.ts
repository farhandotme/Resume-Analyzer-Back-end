import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/db";
import type { Request, Response } from "express";
import { sendOTPEmail } from "../utils/mailer";
import crypto from "crypto";

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const otp = crypto.randomInt(1000, 9999).toString();
    const { name, email } = req.body;
    if (!email || !name) {
      return res.status(404).json({
        success: false,
        message: "All Fields Required",
      });
    }

    await sendOTPEmail(email, otp);
    return res.status(200).json({
      success: true,
      message: `Otp has sent to ${email}`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error from catch",

      error,
    });
  }
};

// login controller

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // check fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required.",
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Email not found", success: false });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({
        success: false,
        error: "Wrong password.",
      });
    }

    // create JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );
    res.cookie("token", token);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      error: "Something went wrong. Try again.",
    });
  }
};

//get the user profile

export const profile = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      omit: {
        password: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({
      success: false,
      error: "Something went wrong. Try again.",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Trouble in Logout",
    });
  }
};

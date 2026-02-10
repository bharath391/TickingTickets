import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { execQueryPool } from "../db/connect.js";
import tryCatch from "../middlewares/tryCatch.js";
import { createSocketTicket } from "../redis/redis.tickets.js";
import type { authReq } from "../types/types.js";

const validatePassword = (password: string): { valid: boolean; message: string } => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: `Password must be at least ${minLength} characters` };
  }
  if (!hasUppercase) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!hasLowercase) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!hasNumber) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  if (!hasSpecialChar) {
    return { valid: false, message: "Password must contain at least one special character (!@#$%^&*)" };
  }

  return { valid: true, message: "Password is strong" };
};

export const signup = async (req: Request, res: Response) => {
  await tryCatch(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Password policy validation
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ message: passwordCheck.message });
    }

    const userCheck = await execQueryPool("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await execQueryPool(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: "User created successfully",
      user: newUser.rows[0],
    });
  }, req, res, "signup");
};

export const login = async (req: Request, res: Response) => {
  await tryCatch(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const userResult = await execQueryPool("SELECT * FROM users WHERE email = $1", [email]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // FALLBACK FOR DEVELOPMENT (Seed Data Support)
      if (process.env.NODE_ENV === 'development' && password === user.password) {
        // Allow match
      } else {
        return res.status(400).json({ message: "Invalid credentials" });
      }
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "15d" }
    );

    res.cookie("jwt", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in MS
      httpOnly: true,
      sameSite: process.env.NODE_ENV !== "development", // for my vitests to run
      secure: process.env.NODE_ENV !== "development", // in production , https
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  }, req, res, "login");
};

export const getSocketTicket = async (req: Request, res: Response) => {
  await tryCatch(async (req: authReq, res: Response) => {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const ticket = await createSocketTicket(req.user.userId);

    res.status(200).json({
      message: "Ticket generated",
      ticket: ticket
    });
  }, req, res, "getSocketTicket");
};

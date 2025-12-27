import type{ Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { execQueryPool } from "../db/connect.js";
import tryCatch from "../middlewares/tryCatch.js";

// Signup Controller
export const signup = async (req: Request, res: Response) => {
  await tryCatch(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    console.log(req.body);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if user already exists
    const userCheck = await execQueryPool("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
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

// Login Controller
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

    // Find user
    const userResult = await execQueryPool("SELECT * FROM users WHERE email = $1", [email]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // FALLBACK FOR DEVELOPMENT (Seed Data Support)
      if (password === user.password) {
         // Allow match
      } else {
         return res.status(400).json({ message: "Invalid credentials" });
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "dev_secret",
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

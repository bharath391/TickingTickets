import type { Request, Response } from "express";
import tryCatch from "../utils/tryCatch.js";
import { query } from "../db/db.config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const signUp = async (req: Request, res: Response) => {
    await tryCatch(async () => {
        const { name, password } = req.body;
        
        if (!name || !password) {
            res.status(400).json({ msg: "Missing fields" });
            return;
        }

        const userCheck = await query("SELECT * FROM users WHERE name = $1", [name]);
        
        if (userCheck.rowCount && userCheck.rowCount > 0) {
            res.status(400).json({ msg: "User already exists" });
            return;
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPass = bcrypt.hashSync(password, salt);
       
        await query("INSERT INTO users (name, password) VALUES ($1, $2)", [name, hashedPass]);
        
        res.status(201).json({ msg: "User created successfully" });
    }, res, "signUp");
}

const logIn = async (req: Request, res: Response) => {
    await tryCatch(async () => {
        const { name, password } = req.body;
        if (!name || !password) {
            res.status(400).json({ msg: "Missing Fields" });
            return;
        }

        const userResult = await query("SELECT * FROM users WHERE name = $1", [name]);
        if (userResult.rowCount === 0) {
            res.status(401).json({ msg: "Invalid credentials" });
            return;
        }

        const user = userResult.rows[0];
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            res.status(401).json({ msg: "Invalid credentials" });
            return;
        }
        const token = jwt.sign({ name: user.name }, process.env.JWT_SECRET!, { expiresIn: "15d" });
        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development" // Secure in prod
        });

        res.status(200).json({ msg: "Login successful" });
    }, res, "logIn");
}

export { logIn, signUp };

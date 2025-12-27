import {} from "express";
import jwt, {} from "jsonwebtoken";
import { execQueryPool } from "../db/connect.js";
const userAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Casting to JwtPayload, but we access custom props
        // decoded payload is { userId, email, ... }
        const userId = decoded.userId;
        const query = "select * from users where id=$1";
        const values = [userId];
        const result = await execQueryPool(query, values);
        if (result.rowCount === 0) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = {
            id: userId,
            email: decoded.email
        };
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
const adminAuthMiddleware = async (req, res, next) => {
    try {
        //check user jwt and assign user to incoming req = authReq
        const token = req.cookies?.jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const query = "select * from admins where id=$1";
        const values = [userId];
        const result = await execQueryPool(query, values);
        if (result.rowCount === 0) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = {
            id: userId,
            email: decoded.email
        };
        next();
    }
    catch (e) {
        console.log("Error in auth middleware ");
        console.log(e);
        return res.status(401).json({ message: "Unauthorized" });
    }
};
export { userAuthMiddleware, adminAuthMiddleware };
//# sourceMappingURL=auth.middleware.js.map
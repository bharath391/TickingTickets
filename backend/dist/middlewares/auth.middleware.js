import {} from "express";
import jwt, {} from "jsonwebtoken";
import { execQueryPool } from "../db/connect.js";
const userAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const query = "select * from users where id=$1";
        const values = [decoded.user.id];
        const result = await execQueryPool(query, values);
        if (result.rowCount === 0) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = decoded.user;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
const adminAuthMiddleware = async (req, res, next) => {
    try {
        //check user jwt and assign user to incoming req = authReq
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const query = "select * from admins where id=$1";
        const values = [decoded.user.id];
        const result = await execQueryPool(query, values);
        if (result.rowCount === 0) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = decoded.user;
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
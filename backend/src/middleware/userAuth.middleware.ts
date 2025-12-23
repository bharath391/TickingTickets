import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend the Express Request type to include the user object
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      res.status(401).json({ msg: "Unauthorized: No token provided" });
      return 
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ msg: "Unauthorized: Invalid token" });
  }
};

export default authMiddleware;

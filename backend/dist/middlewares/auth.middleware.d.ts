import { type Response, type NextFunction } from "express";
import type { authReq } from "../types/types.js";
declare const userAuthMiddleware: (req: authReq, res: Response, next: NextFunction) => void;
declare const adminAuthMiddleware: (req: authReq, res: Response, next: NextFunction) => void;
export { userAuthMiddleware, adminAuthMiddleware };
//# sourceMappingURL=auth.middleware.d.ts.map
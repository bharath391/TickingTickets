import { type Response, type NextFunction } from "express";
import type { authReq } from "../types/types.js";
declare const authMiddleware: (req: authReq, res: Response, next: NextFunction) => void;
export default authMiddleware;
//# sourceMappingURL=auth.middleware.d.ts.map
import type { Request } from "express";
interface authReq extends Request {
    user?: {
        id: string;
        email: string;
    };
}
export type { authReq };
//# sourceMappingURL=types.d.ts.map
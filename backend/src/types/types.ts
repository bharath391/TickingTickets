import type { Request } from "express";

interface authReq extends Request {
    user?: {
        userId: string,
        email: string,
    },

    admin?: {
        adminId: string,
        email: string,
    }
}

export type { authReq };
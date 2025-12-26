import { type Request, type Response } from "express";
declare const tryCatch: (fn: (req: Request, res: Response) => Promise<any>, req: Request, res: Response, controllerName: string) => Promise<void>;
export default tryCatch;
//# sourceMappingURL=tryCatch.d.ts.map
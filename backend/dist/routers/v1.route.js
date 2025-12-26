import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
const router = Router;
router.use("/payments", authMiddleware, paymentRouter);
router.use("/auth", authRouter);
router.use("/admin", authMiddleware, adminRouter);
export default router;
//# sourceMappingURL=v1.route.js.map
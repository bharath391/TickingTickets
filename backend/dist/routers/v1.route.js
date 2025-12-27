import { Router } from "express";
import { userAuthMiddleware, adminAuthMiddleware } from "../middlewares/auth.middleware.js";
import authRouter from "../auth/auth.route.js";
import adminRouter from "../admin/admin.route.js";
import searchRouter from "../search/search.route.js";
const router = Router();
router.use("/auth", authRouter);
router.use("/admin", adminAuthMiddleware, adminRouter);
router.use("/search", userAuthMiddleware, searchRouter);
// router.use("/payments",authMiddleware,paymentRouter);
// Temporary test route to verify logger middleware
router.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
});
export default router;
//# sourceMappingURL=v1.route.js.map
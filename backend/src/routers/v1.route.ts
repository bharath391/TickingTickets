import {Router, type Router as RouterType} from "express";
import {userAuthMiddleware,adminAuthMiddleware} from "../middlewares/auth.middleware.js";
import authRouter from "../auth/auth.route.js";

const router: RouterType = Router();

router.use("/auth", authRouter);
// router.use("/payments",authMiddleware,paymentRouter);
// router.use("/admin",authMiddleware,adminRouter);

// Temporary test route to verify logger middleware
router.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
});

export default router;

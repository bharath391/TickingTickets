import {Router, type Router as RouterType} from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
const router: RouterType = Router();

// TODO: Import and use actual routers when they are created
// router.use("/payments",authMiddleware,paymentRouter);
// router.use("/auth",authRouter);
// router.use("/admin",authMiddleware,adminRouter);

// Temporary test route to verify logger middleware
router.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
});

export default router;

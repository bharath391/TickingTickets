import express from "express";
import { signup, login } from "./auth.controller.js";
import { adminLogin } from "../admin/admin.controller.js";
import { getSocketTicket } from "./auth.controller.js";
import { userAuthMiddleware } from "../middlewares/auth.middleware.js";
const router: express.Router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/admin/login", adminLogin);
router.get("/ticket", userAuthMiddleware, getSocketTicket);

export default router;

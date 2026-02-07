import express, { Router } from "express";
import { initiatePayment, verifyPayment } from "./payments.controller.js";
import { userAuthMiddleware } from "../middlewares/auth.middleware.js";

const router: Router = express.Router();

router.post("/initiate", userAuthMiddleware, initiatePayment);
router.post("/verify", userAuthMiddleware, verifyPayment);

export default router;

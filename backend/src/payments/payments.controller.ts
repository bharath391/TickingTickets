import type { Request, Response } from "express";
import tryCatch from "../middlewares/tryCatch.js";
import type { authReq } from "../types/types.js";
import { generateOrderId, verifySignature } from "../utils/razorpay.js";

const initiatePayment = (req: authReq, res: Response) => {
    tryCatch(async () => {
        const { amount, currency } = req.body;

        if (!amount) {
            res.status(400).json({ success: false, message: "Amount is required" });
            return;
        }

        const order = await generateOrderId({
            amount: Number(amount),
            currency: currency,
            notes: { userId: req.user!.userId }
        });

        res.status(200).json(order);
    }, req, res, "initiate payment");
}

const verifyPayment = (req: Request, res: Response) => {
    tryCatch(async () => {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            res.status(400).json({ success: false, message: "Missing required payment details" });
            return;
        }

        const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (isValid) {
            res.status(200).json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid signature" });
        }

    }, req, res, "verify payment")
}


export { initiatePayment, verifyPayment }
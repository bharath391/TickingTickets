import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

export class RazorpayClient {
    private instance: Razorpay | undefined;
    private keyId: string;
    private keySecret: string;

    constructor() {
        this.keyId = process.env.RAZORPAY_KEY_ID || "";
        this.keySecret = process.env.RAZORPAY_KEY_SECRET || "";

        if (this.keyId && this.keySecret && this.keyId !== "dummy") {
            this.instance = new Razorpay({
                key_id: this.keyId,
                key_secret: this.keySecret,
            });
        } else {
            if (this.keyId !== "dummy") {
                console.warn("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Payment features will fail.");
            } else {
                console.log("Razorpay running in DUMMY mode.");
            }
        }
    }

    /**
     * Create a Razorpay Order
     * @param amount Amount in smallest currency unit (e.g., paise for INR)
     * @param receipt Unique identifier for the receipt
     * @param notes Key-value pair of metadata (e.g., userId, showId)
     */
    async createOrder(amount: number, receipt: string, notes: Record<string, string>) {
        // DUMMY MODE SUPPORT
        if (this.keyId === "dummy") {
            console.log("[Razorpay-Dummy] Creating mock order");
            return {
                orderId: `order_MOCK_${Date.now()}`,
                amount: amount,
                currency: "INR",
                keyId: "dummy_key_id",
            };
        }

        if (!this.instance) {
            throw new Error("Razorpay is not configured. Missing API keys.");
        }

        const options = {
            amount: amount,
            currency: "INR",
            receipt: receipt,
            notes: notes,
        };

        try {
            const order = await this.instance.orders.create(options);
            return {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: this.keyId, // Needed by frontend
            };
        } catch (error) {
            console.error("Razorpay Create Order Error:", error);
            throw new Error("Failed to create payment order");
        }
    }

    /**
     * Verify Payment Signature (HMAC SHA256)
     * @param orderId The order ID returned by Create Order
     * @param paymentId The payment ID returned by Razorpay Checkout
     * @param signature The signature returned by Razorpay Checkout
     */
    verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
        // DUMMY MODE SUPPORT
        if (this.keyId === "dummy") {
            // For dummy mode, assume signature "valid_signature" is valid, others invalid
            // This allows us to test both success and failure in tests!
            const isValid = signature === "valid_signature";
            console.log(`[Razorpay-Dummy] Verifying signature: ${signature} -> ${isValid}`);
            return isValid;
        }

        if (!this.instance || !this.keySecret) {
            console.error("Cannot verify signature: Razorpay secret is missing.");
            return false;
        }

        const text = `${orderId}|${paymentId}`;
        const generatedSignature = crypto
            .createHmac("sha256", this.keySecret)
            .update(text)
            .digest("hex");

        return generatedSignature === signature;
    }
}

export const razorpayClient = new RazorpayClient();

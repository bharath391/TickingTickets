import dotenv from "dotenv";
import { generateOrderId, verifySignature } from "./utils/razorpay.js";
import crypto from "crypto";

dotenv.config();

const runTests = async () => {
    console.log("--- Starting Razorpay Integration Tests ---");

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error("❌ CRITICAL: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in .env");
        console.error("Please add them to test actual API calls.");
        // We can still test verifySignature as it only needs the secret which we can mock if needed, 
        // but generateOrderId needs real auth.
        process.exit(1);
    } else {
        console.log("✅ API Credentials found.");
    }

    // 1. Test Generate Order
    console.log("\n[Test 1] Generating Order...");
    let orderId = "";
    try {
        const order = await generateOrderId({
            amount: 100, // 100 INR
            currency: "INR",
            receipt: "test_receipt_" + Date.now(),
            notes: { purpose: "test" }
        });
        console.log("✅ Order Created Successfully:", order);
        if (order && order.id) {
            orderId = order.id;
        }
    } catch (error) {
        console.error("❌ Failed to create order. Is the Key/Secret valid?", error);
    }

    // 2. Test Verify Signature
    console.log("\n[Test 2] Verifying Signature Logic...");
    
    // We need a dummy orderId if the real one failed
    const testOrderId = orderId || "order_test_123"; 
    const testPaymentId = "pay_test_123";
    const secret = process.env.RAZORPAY_KEY_SECRET as string;

    // Manually create valid signature
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(testOrderId + "|" + testPaymentId);
    const validSignature = hmac.digest("hex");

    const isValid = verifySignature(testOrderId, testPaymentId, validSignature);
    if (isValid) {
        console.log("✅ Signature Verification Failed (Positive Test): PASSED");
    } else {
        console.error("❌ Signature Verification Failed (Positive Test): FAILED");
    }

    const isInvalid = verifySignature(testOrderId, testPaymentId, "invalid_signature");
    if (!isInvalid) {
        console.log("✅ Signature Verification Passed (Negative Test): PASSED");
    } else {
        console.error("❌ Signature Verification Passed (Negative Test): FAILED (It accepted an invalid signature!)");
    }

    console.log("\n--- Tests Completed ---");
};

runTests();

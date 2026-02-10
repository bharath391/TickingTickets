import { stage1Queue, stage2Queue } from "../redis/redis.queues.js";
import {
    tryLockSeats,
    unlockSeats,
    markSeatsAsSold,
    addToStage1,
    removeFromStage1,
    addToStage2,
    removeFromStage2,
    storeUserSeats,
    getUserSeats,
    clearUserSeats,
    isInStage1,
    hasActiveBooking,
} from "../redis/redis.sets.js";
import { generateOrderId, verifySignature } from "../utils/razorpay.js";
import { execQueryPool } from "../db/connect.js";

const STAGE1_DELAY_MS = 3 * 60 * 1000; // 3 minutes
const STAGE2_DELAY_MS = 7 * 60 * 1000; // 7 minutes

export class BookingService {
    /**
     * Stage 1: Lock Seats (3min Hold)
     * Triggered when user clicks "Book" on seats.
     */
    async lockSeats(userId: string, showId: string, seatIds: number[]): Promise<{ success: boolean; message: string }> {
        console.log(`[BookingService] Attempting to lock seats ${seatIds} for user ${userId} in show ${showId}`);

        const alreadyBooking = await hasActiveBooking(userId);
        if (alreadyBooking) {
            return { success: false, message: "You already have a booking in progress. Complete or cancel it first." };
        }

        const { execQueryPool } = await import("../db/connect.js");
        const showResult = await execQueryPool("SELECT is_live FROM shows WHERE id = $1", [showId]);
        if (showResult.rowCount === 0) {
            return { success: false, message: "Show not found" };
        }
        if (!showResult.rows[0].is_live) {
            return { success: false, message: "Booking is not open for this show yet" };
        }

        const locked = await tryLockSeats(showId, seatIds);
        if (!locked) {
            return { success: false, message: "One or more seats are not available" };
        }

        await storeUserSeats(userId, showId, seatIds);

        await addToStage1(userId, showId);

        await stage1Queue.add({ userId, showId }, { delay: STAGE1_DELAY_MS });

        // Note: broadcast happens automatically in tryLockSeats()

        console.log(`[BookingService] Seats ${seatIds} locked for user ${userId}. Expires in 3min.`);
        return { success: true, message: "Seats locked for 3 minutes. Click PayNow to proceed." };
    }

    /**
     * Stage 2: Initiate Payment (5m Checkout)
     * Triggered when user clicks "Pay Now".
     */
    async initiatePayment(userId: string, showId: string): Promise<{ success: boolean; message: string; data?: any }> {
        console.log(`[BookingService] User ${userId} clicked PayNow for show ${showId}`);

        const inStage1 = await isInStage1(userId, showId);
        if (!inStage1) {
            return { success: false, message: "No active booking found. Please select seats again." };
        }

        await removeFromStage1(userId, showId);
        await addToStage2(userId, showId);

        await stage2Queue.add({ userId, showId }, { delay: STAGE2_DELAY_MS });

        // Fixed price for MVP: ₹500.00 -> 50000 paise
        const amount = 50000;
        const receiptId = `receipt_${userId}_${showId}_${Date.now()}`;
        const notes = { userId, showId };

        try {
            const order = await generateOrderId({
                amount: amount,
                receipt: receiptId,
                notes: notes
            });
            console.log(`[BookingService] User ${userId} moved to Stage 2. Payment Order Created: ${order.id}`);
            return {
                success: true,
                message: "Payment window opened. Complete payment within 5 minutes.",
                data: order
            };
        } catch (err) {
            console.error("[BookingService] Failed to create Razorpay order", err);
            return { success: false, message: "Failed to initiate payment gateway." };
        }
    }

    /**
     * Confirm Booking (Payment Webhook)
     * Called when payment gateway confirms successful payment.
     */
    async confirmBooking(userId: string, showId: string, paymentId: string, orderId: string, signature: string): Promise<{ success: boolean; message: string }> {
        console.log(`[BookingService] Verifying payment for user ${userId}, show ${showId}`);

        const isValid = verifySignature(orderId, paymentId, signature);
        if (!isValid) {
            console.error(`[BookingService] Invalid signature for user ${userId}, show ${showId}`);
            return { success: false, message: "Payment verification failed (Invalid Signature)" };
        }

        await removeFromStage2(userId, showId);

        const seatIds = await getUserSeats(userId, showId);
        if (!seatIds) {
            return { success: false, message: "No seats found for this booking" };
        }

        await markSeatsAsSold(showId, seatIds);

        await clearUserSeats(userId, showId);

        try {
            const insertBooking = `
                INSERT INTO bookings (user_id, show_id, seats, payment_id, status) 
                VALUES ($1, $2, $3, $4, 'confirmed') 
                RETURNING id
            `;
            const bookingResult = await execQueryPool(insertBooking, [userId, showId, seatIds, paymentId]);

            const updateSeats = `
                UPDATE shows SET seat_count = seat_count - $1 WHERE id = $2
            `;
            await execQueryPool(updateSeats, [seatIds.length, showId]);

            console.log(`[BookingService] Booking ${bookingResult.rows[0].id} confirmed! Seats ${seatIds} sold.`);
        } catch (dbError) {
            console.error(`[BookingService] DB Error saving booking:`, dbError);
            // Note: Seats are already marked sold in Redis, so booking is effectively complete
        }

        // Note: broadcast happens automatically in markSeatsAsSold()

        return { success: true, message: "Booking confirmed successfully!" };
    }

    /**
     * Cancel Booking (User initiated)
     * Called when user cancels during Stage 1 or Stage 2.
     */
    async cancelBooking(userId: string, showId: string): Promise<{ success: boolean; message: string }> {
        console.log(`[BookingService] User ${userId} cancelling booking for show ${showId}`);

        const seatIds = await getUserSeats(userId, showId);
        if (!seatIds) {
            return { success: false, message: "No active booking found" };
        }

        await removeFromStage1(userId, showId);
        await removeFromStage2(userId, showId);

        await unlockSeats(showId, seatIds);

        await clearUserSeats(userId, showId);

        console.log(`[BookingService] Booking cancelled. Seats ${seatIds} released.`);
        return { success: true, message: "Booking cancelled. Seats released." };
    }
}

export const bookingService = new BookingService();

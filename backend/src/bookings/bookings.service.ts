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
} from "../redis/redis.sets.js";

const STAGE1_DELAY_MS = 30 * 1000; // 30 seconds
const STAGE2_DELAY_MS = 5 * 60 * 1000; // 5 minutes

export class BookingService {
    /**
     * Stage 1: Lock Seats (30s Hold)
     * Triggered when user clicks "Book" on seats.
     */
    async lockSeats(userId: string, showId: string, seatIds: number[]): Promise<{ success: boolean; message: string }> {
        console.log(`[BookingService] Attempting to lock seats ${seatIds} for user ${userId} in show ${showId}`);

        // 1. Try to lock seats atomically
        const locked = await tryLockSeats(showId, seatIds);
        if (!locked) {
            return { success: false, message: "One or more seats are not available" };
        }

        // 2. Store which seats this user locked
        await storeUserSeats(userId, showId, seatIds);

        // 3. Add user to Stage 1 tracking
        await addToStage1(userId, showId);

        // 4. Add job to Queue 1 (expires in 30s)
        await stage1Queue.add({ userId, showId }, { delay: STAGE1_DELAY_MS });

        console.log(`[BookingService] Seats ${seatIds} locked for user ${userId}. Expires in 30s.`);
        return { success: true, message: "Seats locked for 30 seconds. Click PayNow to proceed." };
    }

    /**
     * Stage 2: Initiate Payment (5m Checkout)
     * Triggered when user clicks "Pay Now".
     */
    async initiatePayment(userId: string, showId: string): Promise<{ success: boolean; message: string }> {
        console.log(`[BookingService] User ${userId} clicked PayNow for show ${showId}`);

        // 1. Verify user is in Stage 1
        const inStage1 = await isInStage1(userId, showId);
        if (!inStage1) {
            return { success: false, message: "No active booking found. Please select seats again." };
        }

        // 2. Move from Stage 1 to Stage 2
        await removeFromStage1(userId, showId);
        await addToStage2(userId, showId);

        // 3. Add job to Queue 2 (expires in 5min)
        await stage2Queue.add({ userId, showId }, { delay: STAGE2_DELAY_MS });

        console.log(`[BookingService] User ${userId} moved to Stage 2. Payment window: 5 minutes.`);
        return { success: true, message: "Payment window opened. Complete payment within 5 minutes." };
    }

    /**
     * Confirm Booking (Payment Webhook)
     * Called when payment gateway confirms successful payment.
     */
    async confirmBooking(userId: string, showId: string, paymentId: string): Promise<{ success: boolean; message: string }> {
        console.log(`[BookingService] Payment confirmed for user ${userId}, show ${showId}, payment ${paymentId}`);

        //Remove from Stage 2
        await removeFromStage2(userId, showId);

        //Get locked seats
        const seatIds = await getUserSeats(userId, showId);
        if (!seatIds) {
            return { success: false, message: "No seats found for this booking" };
        }

        //Mark seats as sold (remove from locked set entirely)
        await markSeatsAsSold(showId, seatIds);

        //Clear user seat mapping
        await clearUserSeats(userId, showId);

        //TODO: Insert into DB (bookings table)
        //TODO: Decrement seat_count in shows table

        console.log(`[BookingService] Booking confirmed! Seats ${seatIds} sold for show ${showId}.`);
        return { success: true, message: "Booking confirmed successfully!" };
    }

    /**
     * Cancel Booking (User initiated)
     * Called when user cancels during Stage 1 or Stage 2.
     */
    async cancelBooking(userId: string, showId: string): Promise<{ success: boolean; message: string }> {
        console.log(`[BookingService] User ${userId} cancelling booking for show ${showId}`);

        //Get locked seats
        const seatIds = await getUserSeats(userId, showId);
        if (!seatIds) {
            return { success: false, message: "No active booking found" };
        }

        //Remove from Stage 1 or Stage 2
        await removeFromStage1(userId, showId);
        await removeFromStage2(userId, showId);

        //Unlock seats
        await unlockSeats(showId, seatIds);

        //Clear user seat mapping
        await clearUserSeats(userId, showId);

        console.log(`[BookingService] Booking cancelled. Seats ${seatIds} released.`);
        return { success: true, message: "Booking cancelled. Seats released." };
    }
}

export const bookingService = new BookingService();

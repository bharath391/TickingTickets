import { firstQueue, secondQueue } from "../redis/redis.queues.js";

export class BookingService {
    /**
     * Stage 1: Lock Seats (30s Hold)
     * Triggered when user clicks "Book" on seats.
     * Logic:
     * 1. Validate seat count (max 3).
     * 2. Check availability in Redis.
     * 3. Set atomic lock in Redis (30s TTL).
     * 4. Add to "Waiting Queue" (Queue 1).
     */
    async lockSeats(userId: string, showId: string, seatIds: number[]) {
        console.log(`[BookingService] Locking seats ${seatIds} for user ${userId} in show ${showId}`);
        firstQueue.add({ userId, showId, seatIds, startTime: Date.now() }, { delay: 31000 });
        // TODO: Implement Redis Logic
        // const s = await redis.get(...)
        // if (exists) throw new Error("Seat taken")

        // TODO: Add to BullMQ Queue 1 (30s delay)

        return { success: true, message: "Seats locked for 30 seconds", expiresAt: Date.now() + 30000 };
    }

    /**
     * Stage 2: Initiate Payment (5m Checkout)
     * Triggered when user clicks "Pay Now".
     * Logic:
     * 1. Validate user holds the lock on these seats.
     * 2. Extend Redis lock TTL to 5 mins.
     * 3. Move from "Waiting Queue" to "Payment Queue" (Queue 2).
     */
    async initiatePayment(userId: string, showId: string) {
        console.log(`[BookingService] Initiating payment for user ${userId} in show ${showId}`);

        // TODO: Verify lock ownership in Redis

        // TODO: Extend TTL in Redis

        // TODO: Move job from Queue 1 to Queue 2

        return { success: true, message: "Lock extended for payment", expiresAt: Date.now() + 300000 };
    }

    /**
   * Finalize Booking
   * Triggered by Payment Webhook.
   */
    async confirmBooking(userId: string, showId: string, paymentId: string) {
        // TODO: Update DB (Bookings table)
        // TODO: Mark seats as SOLD in Redis
        // TODO: Remove from all Queues
    }
}

export const bookingService = new BookingService();

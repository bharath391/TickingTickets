import Queue from "bull";
import {
    isInStage1,
    isInStage2,
    removeFromStage1,
    removeFromStage2,
    unlockSeats,
    getUserSeats,
    clearUserSeats,
} from "./redis.sets.js";

// ============================================
// QUEUE CONFIGURATION
// ============================================
const redisConfig = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
};

// Queue 1: 30-second hold expiration
export const stage1Queue = new Queue("stage1Queue", { redis: redisConfig });

// Queue 2: 5-minute payment expiration
export const stage2Queue = new Queue("stage2Queue", { redis: redisConfig });

// ============================================
// QUEUE 1 PROCESSOR (30s Hold Expiration)
// ============================================
stage1Queue.process(async (job) => {
    const { userId, showId } = job.data;
    console.log(`[Queue1] Processing expiration for user ${userId}, show ${showId}`);

    // Check if user is still in Stage 1 (didn't click PayNow)
    const stillInStage1 = await isInStage1(userId, showId);

    if (stillInStage1) {
        // User didn't click PayNow within 30s → Unlock seats
        console.log(`[Queue1] User ${userId} didn't click PayNow. Unlocking seats.`);

        const seatIds = await getUserSeats(userId, showId);
        if (seatIds) {
            await unlockSeats(showId, seatIds);
            await clearUserSeats(userId, showId);
        }
        await removeFromStage1(userId, showId);

        return { status: "unlocked", reason: "30s timeout" };
    } else {
        // User clicked PayNow → Already moved to Stage 2, do nothing
        console.log(`[Queue1] User ${userId} already in Stage 2. No action needed.`);
        return { status: "skipped", reason: "already_in_stage2" };
    }
});

// ============================================
// QUEUE 2 PROCESSOR (5min Payment Expiration)
// ============================================
stage2Queue.process(async (job) => {
    const { userId, showId } = job.data;
    console.log(`[Queue2] Processing expiration for user ${userId}, show ${showId}`);

    // Check if user is still in Stage 2 (payment not completed)
    const stillInStage2 = await isInStage2(userId, showId);

    if (stillInStage2) {
        // Payment not completed within 5min → Unlock seats + timeout error
        console.log(`[Queue2] User ${userId} payment timeout. Unlocking seats.`);

        const seatIds = await getUserSeats(userId, showId);
        if (seatIds) {
            await unlockSeats(showId, seatIds);
            await clearUserSeats(userId, showId);
        }
        await removeFromStage2(userId, showId);

        // TODO: Optionally notify user via WebSocket or store timeout status
        return { status: "timeout", reason: "5min payment timeout" };
    } else {
        // Payment completed → Already removed from Stage 2, do nothing
        console.log(`[Queue2] User ${userId} payment completed. No action needed.`);
        return { status: "skipped", reason: "payment_completed" };
    }
});

// Log queue events
stage1Queue.on("completed", (job, result) => {
    console.log(`[Queue1] Job ${job.id} completed:`, result);
});

stage2Queue.on("completed", (job, result) => {
    console.log(`[Queue2] Job ${job.id} completed:`, result);
});

stage1Queue.on("failed", (job, err) => {
    console.error(`[Queue1] Job ${job.id} failed:`, err.message);
});

stage2Queue.on("failed", (job, err) => {
    console.error(`[Queue2] Job ${job.id} failed:`, err.message);
});

console.log("[Queues] Stage1 and Stage2 queue processors initialized");

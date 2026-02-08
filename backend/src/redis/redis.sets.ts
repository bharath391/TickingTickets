import redisClient from "./redis.client.js";
import tryCatch from "../utils/tryCatch.js";
import { broadcastToShow } from "../sockets/websocket.js";

// seats:{showId}       - Available seats
// lockedSeats:{showId} - Currently locked seats

export async function initializeSeatsForShow(showId: string, totalSeats: number): Promise<void> {
    await tryCatch(async () => {
        const key = `seats:${showId}`;
        const seats = Array.from({ length: totalSeats }, (_, i) => String(i + 1));
        await redisClient.sAdd(key, seats);
        console.log(`[Redis] Initialized ${totalSeats} seats for show ${showId}`);
    }, [showId, totalSeats], "initializeSeatsForShow");
}

/**
 * Atomically lock seats using Redis MULTI/EXEC transaction.
 * 
 * Why MULTI? Without it, there's a race condition:
 * - Thread A checks seat 1 is available ✓
 * - Thread B checks seat 1 is available ✓  
 * - Thread A locks seat 1
 * - Thread B locks seat 1 → DOUBLE BOOKING!
 * 
 * MULTI batches all commands and executes them atomically.
 * If any sMove returns 0 (seat wasn't in available set), we rollback.
 */
export async function tryLockSeats(showId: string, seatIds: number[]): Promise<boolean> {
    const availableKey = `seats:${showId}`;
    const lockedKey = `lockedSeats:${showId}`;

    try {
        // Use MULTI to batch all sMove commands atomically
        const multi = redisClient.multi();

        for (const seatId of seatIds) {
            // sMove returns 1 if moved, 0 if source didn't contain element
            multi.sMove(availableKey, lockedKey, String(seatId));
        }

        const results = await multi.exec();

        // Check if all seats were successfully moved
        // If any sMove returned 0, that seat wasn't available
        const allMoved = results?.every((result) => Number(result) === 1);

        if (!allMoved) {
            // Rollback: Move any locked seats back to available
            console.log(`[Redis] Some seats not available. Rolling back...`);
            const rollbackMulti = redisClient.multi();
            for (const seatId of seatIds) {
                rollbackMulti.sMove(lockedKey, availableKey, String(seatId));
            }
            await rollbackMulti.exec();
            return false;
        }

        console.log(`[Redis] Atomically locked seats ${seatIds} for show ${showId}`);

        // Broadcast seat state update to all watching clients
        broadcastToShow(showId);

        return true;
    } catch (error) {
        console.error(`[Redis] Error in tryLockSeats:`, error);
        return false;
    }
}

export async function unlockSeats(showId: string, seatIds: number[]): Promise<void> {
    await tryCatch(async () => {
        const availableKey = `seats:${showId}`;
        const lockedKey = `lockedSeats:${showId}`;

        for (const seatId of seatIds) {
            await redisClient.sMove(lockedKey, availableKey, String(seatId));
        }
        console.log(`[Redis] Unlocked seats ${seatIds} for show ${showId}`);

        // Broadcast seat state update to all watching clients
        broadcastToShow(showId);
    }, [showId, seatIds], "unlockSeats");
}

export async function markSeatsAsSold(showId: string, seatIds: number[]): Promise<void> {
    const lockedKey = `lockedSeats:${showId}`;

    for (const seatId of seatIds) {
        await redisClient.sRem(lockedKey, String(seatId));
    }
    console.log(`[Redis] Marked seats ${seatIds} as SOLD for show ${showId}`);

    // Broadcast seat state update to all watching clients
    broadcastToShow(showId);
}

// stage1Lock - Users in 3min hold window
// stage2Lock - Users in 7min payment window

export async function addToStage1(userId: string, showId: string): Promise<void> {
    await redisClient.sAdd("stage1Lock", `${userId}:${showId}`);
}

export async function isInStage1(userId: string, showId: string): Promise<boolean> {
    const result = await redisClient.sIsMember("stage1Lock", `${userId}:${showId}`);
    return Boolean(result);
}

export async function removeFromStage1(userId: string, showId: string): Promise<void> {
    await redisClient.sRem("stage1Lock", `${userId}:${showId}`);
}

export async function addToStage2(userId: string, showId: string): Promise<void> {
    await redisClient.sAdd("stage2Lock", `${userId}:${showId}`);
}

export async function isInStage2(userId: string, showId: string): Promise<boolean> {
    const result = await redisClient.sIsMember("stage2Lock", `${userId}:${showId}`);
    return Boolean(result);
}

export async function removeFromStage2(userId: string, showId: string): Promise<void> {
    await redisClient.sRem("stage2Lock", `${userId}:${showId}`);
}

/**
 * Check if user has ANY active booking (in stage1 or stage2 for any show)
 * Prevents booking multiple shows simultaneously
 */
export async function hasActiveBooking(userId: string): Promise<boolean> {
    const stage1Members = await redisClient.sMembers("stage1Lock");
    const stage2Members = await redisClient.sMembers("stage2Lock");
    const allMembers = [...stage1Members, ...stage2Members];
    return allMembers.some(m => m.startsWith(`${userId}:`));
}

/**
 * Get all users with active bookings for a specific show
 * Returns array of {userId, stage} objects
 */
export async function getActiveBookingsForShow(showId: string): Promise<{ userId: string, stage: 1 | 2 }[]> {
    const stage1Members = await redisClient.sMembers("stage1Lock");
    const stage2Members = await redisClient.sMembers("stage2Lock");

    const result: { userId: string, stage: 1 | 2 }[] = [];

    for (const member of stage1Members) {
        if (member.endsWith(`:${showId}`)) {
            const userId = member.split(":")[0]!;
            result.push({ userId, stage: 1 });
        }
    }
    for (const member of stage2Members) {
        if (member.endsWith(`:${showId}`)) {
            const userId = member.split(":")[0]!;
            result.push({ userId, stage: 2 });
        }
    }

    return result;
}

/**
 * Clean up all Redis data for a show (when admin stops booking)
 */
export async function cleanupShowData(showId: string): Promise<void> {
    await redisClient.del(`seats:${showId}`);
    await redisClient.del(`lockedSeats:${showId}`);
    console.log(`[Redis] Cleaned up all data for show ${showId}`);
}

// userSeats:{userId}:{showId} -> seatIds as JSON string

export async function storeUserSeats(userId: string, showId: string, seatIds: number[]): Promise<void> {
    await redisClient.set(`userSeats:${userId}:${showId}`, JSON.stringify(seatIds), { EX: 900 }); // 15 min TTL
}

export async function getUserSeats(userId: string, showId: string): Promise<number[] | null> {
    const data = await redisClient.get(`userSeats:${userId}:${showId}`);
    return data ? JSON.parse(data) : null;
}

export async function clearUserSeats(userId: string, showId: string): Promise<void> {
    await redisClient.del(`userSeats:${userId}:${showId}`);
}

//Get complete seat state for a show (used by WebSocket broadcasts)
export async function getShowSeatState(showId: string): Promise<{
    showId: string;
    available: number[];
    locked: number[];
}> {
    const availableKey = `seats:${showId}`;
    const lockedKey = `lockedSeats:${showId}`;

    const [available, locked] = await Promise.all([
        redisClient.sMembers(availableKey),
        redisClient.sMembers(lockedKey),
    ]);

    return {
        showId,
        available: available.map(Number).sort((a, b) => a - b),
        locked: locked.map(Number).sort((a, b) => a - b),
    };
}
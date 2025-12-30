import redisClient from "./redis.client.js";
import tryCatch from "../utils/tryCatch.js";

// ============================================
// SEAT MANAGEMENT SETS
// ============================================
// seats:{showId}       - Available seats (1, 2, 3, ... N)
// lockedSeats:{showId} - Currently locked seats

export async function addToRoom(userId: string): Promise<void> {
    await tryCatch(async () => {
        const key = `userInRoom`;
        await redisClient.sAdd(key, userId);
    }, [userId], "addToRoom");

}
export async function userInRoom(userId: string): Promise<Boolean> {
    return await tryCatch(async () => {
        const key = `userInRoom`;
        const isMember = await redisClient.sIsMember(key, userId);
        return Boolean(isMember);
    }, [userId], "userInRoom");
}
export async function removeFromRoom(userId: string): Promise<void> {
    await tryCatch(async () => {
        const key = `userInRoom`;
        await redisClient.sRem(key, userId);
    }, [userId], "removeFromRoom");
}

/**
 * Initialize seats for a show (called when show opens for booking)
 * @param showId - Show ID
 * @param totalSeats - Total number of seats (e.g., 30)
 */
export async function initializeSeatsForShow(showId: string, totalSeats: number): Promise<void> {
    await tryCatch(async () => {
        const key = `seats:${showId}`;
        const seats = Array.from({ length: totalSeats }, (_, i) => String(i + 1));
        await redisClient.sAdd(key, seats);
        console.log(`[Redis] Initialized ${totalSeats} seats for show ${showId}`);
    }, [showId, totalSeats], "initializeSeatsForShow");
}

/**
 * Try to lock specific seats atomically
 * @returns true if ALL seats were locked, false if ANY seat was unavailable
 */
export async function tryLockSeats(showId: string, seatIds: number[]): Promise<Boolean | undefined> {
    return await tryCatch(async () => {
        const availableKey = `seats:${showId}`;
        const lockedKey = `lockedSeats:${showId}`;

        // Check if all seats are available
        for (const seatId of seatIds) {
            const isMember = await redisClient.sIsMember(availableKey, String(seatId));
            if (!isMember) {
                return false; // At least one seat is not available
            }
        }

        // Move seats from available to locked
        for (const seatId of seatIds) {
            await redisClient.sMove(availableKey, lockedKey, String(seatId));
        }

        return true;
    }, [showId, seatIds], "tryLockSeats");
}

/**
 * Unlock seats (move back from locked to available)
 */
export async function unlockSeats(showId: string, seatIds: number[]): Promise<void> {
    await tryCatch(async () => {
        const availableKey = `seats:${showId}`;
        const lockedKey = `lockedSeats:${showId}`;

        for (const seatId of seatIds) {
            await redisClient.sMove(lockedKey, availableKey, String(seatId));
        }
        console.log(`[Redis] Unlocked seats ${seatIds} for show ${showId}`);
    }, [showId, seatIds], "unlockSeats");
}

/**
 * Mark seats as sold (remove from locked, don't add back to available)
 */
export async function markSeatsAsSold(showId: string, seatIds: number[]): Promise<void> {
    const lockedKey = `lockedSeats:${showId}`;

    for (const seatId of seatIds) {
        await redisClient.sRem(lockedKey, String(seatId));
    }
    console.log(`[Redis] Marked seats ${seatIds} as SOLD for show ${showId}`);
}

// ============================================
// STAGE TRACKING SETS
// ============================================
// stage1Lock - Users in 30s hold window (format: "userId:showId")
// stage2Lock - Users in 5min payment window (format: "userId:showId")

/**
 * Add user to Stage 1 (30s hold)
 */
export async function addToStage1(userId: string, showId: string): Promise<void> {
    await redisClient.sAdd("stage1Lock", `${userId}:${showId}`);
}

/**
 * Check if user is in Stage 1
 */
export async function isInStage1(userId: string, showId: string): Promise<boolean> {
    const result = await redisClient.sIsMember("stage1Lock", `${userId}:${showId}`);
    return Boolean(result);
}

/**
 * Remove user from Stage 1
 */
export async function removeFromStage1(userId: string, showId: string): Promise<void> {
    await redisClient.sRem("stage1Lock", `${userId}:${showId}`);
}

/**
 * Add user to Stage 2 (5min payment window)
 */
export async function addToStage2(userId: string, showId: string): Promise<void> {
    await redisClient.sAdd("stage2Lock", `${userId}:${showId}`);
}

/**
 * Check if user is in Stage 2
 */
export async function isInStage2(userId: string, showId: string): Promise<boolean> {
    const result = await redisClient.sIsMember("stage2Lock", `${userId}:${showId}`);
    return Boolean(result);
}

/**
 * Remove user from Stage 2
 */
export async function removeFromStage2(userId: string, showId: string): Promise<void> {
    await redisClient.sRem("stage2Lock", `${userId}:${showId}`);
}

// ============================================
// USER-SEAT MAPPING (to track which user locked which seats)
// ============================================
// userSeats:{userId}:{showId} -> seatIds as JSON string

export async function storeUserSeats(userId: string, showId: string, seatIds: number[]): Promise<void> {
    await redisClient.set(`userSeats:${userId}:${showId}`, JSON.stringify(seatIds), { EX: 600 }); // 10 min TTL
}

export async function getUserSeats(userId: string, showId: string): Promise<number[] | null> {
    const data = await redisClient.get(`userSeats:${userId}:${showId}`);
    return data ? JSON.parse(data) : null;
}

export async function clearUserSeats(userId: string, showId: string): Promise<void> {
    await redisClient.del(`userSeats:${userId}:${showId}`);
}
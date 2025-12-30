import redisClient from "./redis.client.js";
import { v4 as uuidv4 } from 'uuid';
import tryCatch from "../utils/tryCatch.js";

/**
 * Generate and store a short-lived ticket for WebSocket connection
 * @param userId - The user ID to associate with the ticket
 * @returns The generated ticket string
 */
export async function createSocketTicket(userId: string): Promise<string> {
    return await tryCatch(async () => {
        const ticket = uuidv4();
        const key = `ws_ticket:${ticket}`;

        // Store ticket with 30-second expiration
        await redisClient.set(key, userId, { EX: 30 });

        return ticket;
    }, [userId], "createSocketTicket");
}

/**
 * Validate and consume a WebSocket ticket
 * @param ticket - The ticket string provided by client
 * @returns The userId if valid, null otherwise
 */
export async function validateSocketTicket(ticket: string): Promise<string | null> {
    return await tryCatch(async () => {
        const key = `ws_ticket:${ticket}`;

        // Get and Delete (Atomic implementation not strictly necessary here, but good practice)
        // Using getDel if available in this redis version, otherwise get then del
        const userId = await redisClient.get(key);

        if (userId) {
            await redisClient.del(key); // Consume the ticket so it can't be reused
        }

        return userId;
    }, [ticket], "validateSocketTicket");
}

import { WebSocket, WebSocketServer } from "ws";
import redisClient from "../redis/redis.client.js";
import { validateSocketTicket } from "../redis/redis.tickets.js";
import { getUserSeats } from "../redis/redis.sets.js";

// ============================================
// ROOM MANAGEMENT
// ============================================
// Map of showId -> Set of WebSocket clients
const showRooms: Map<string, Set<WebSocket>> = new Map();

// Track which shows are live (rooms can only be joined if show is live)
const liveShows: Set<string> = new Set();

// Debounce tracking to prevent broadcast flooding
const pendingBroadcasts: Map<string, NodeJS.Timeout> = new Map();
const BROADCAST_DEBOUNCE_MS = 100; // Max 10 broadcasts per second

/**
 * Create a room for a show (called when admin goes live)
 */
export function createShowRoom(showId: string): void {
    liveShows.add(showId);
    if (!showRooms.has(showId)) {
        showRooms.set(showId, new Set());
    }
    console.log(`[WS] Room created for show ${showId}. Show is now live.`);
}

/**
 * Check if a show room is active (live)
 */
export function isShowRoomActive(showId: string): boolean {
    return liveShows.has(showId);
}

/**
 * Destroy a room for a show (called when admin stops booking)
 * Sends 'show-closed' event to all clients and disconnects them
 */
export function destroyShowRoom(showId: string): void {
    liveShows.delete(showId);

    const room = showRooms.get(showId);
    if (room && room.size > 0) {
        // Notify all clients that the show is closed
        const closeMessage = JSON.stringify({
            event: "show-closed",
            data: { showId, message: "Booking has been closed by admin" }
        });

        room.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(closeMessage);
            }
        });

        console.log(`[WS] Sent 'show-closed' to ${room.size} clients for show ${showId}`);
    }

    // Clear the room
    showRooms.delete(showId);

    // Clear any pending broadcasts
    const pendingTimeout = pendingBroadcasts.get(showId);
    if (pendingTimeout) {
        clearTimeout(pendingTimeout);
        pendingBroadcasts.delete(showId);
    }

    console.log(`[WS] Room destroyed for show ${showId}. Show is no longer live.`);
}

/**
 * Add client to a show's room (only if show is live)
 */
export function joinShowRoom(ws: WebSocket, showId: string): boolean {
    // Check if show is live
    if (!liveShows.has(showId)) {
        ws.send(JSON.stringify({
            event: "error",
            data: { message: "Show is not currently accepting bookings" }
        }));
        return false;
    }

    if (!showRooms.has(showId)) {
        showRooms.set(showId, new Set());
    }
    showRooms.get(showId)!.add(ws);
    console.log(`[WS] Client joined room for show ${showId}. Room size: ${showRooms.get(showId)!.size}`);
    return true;
}


export function leaveShowRoom(ws: WebSocket, showId: string): void {
    const room = showRooms.get(showId);
    if (room) {
        room.delete(ws);
        console.log(`[WS] Client left room for show ${showId}. Room size: ${room.size}`);
        // Cleanup empty rooms
        if (room.size === 0) {
            showRooms.delete(showId);
            console.log(`[WS] Room for show ${showId} deleted (empty)`);
        }
    }
}

//Get current seat state from Redis
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


// Broadcast seat state to all clients in a show's room
// Debounced to prevent flooding during high-traffic

export function broadcastToShow(showId: string): void {
    // Clear any pending broadcast for this show
    if (pendingBroadcasts.has(showId)) {
        return; // Already scheduled
    }

    // Schedule broadcast
    const timeout = setTimeout(async () => {
        pendingBroadcasts.delete(showId);

        const room = showRooms.get(showId);
        if (!room || room.size === 0) return;
        //why execute this only after 100 seconds ?
        try {
            const state = await getShowSeatState(showId);
            const message = JSON.stringify({ event: "seat-state", data: state });

            let sentCount = 0;
            room.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                    sentCount++;
                }
            });

            console.log(`[WS] Broadcasted seat-state to ${sentCount} clients for show ${showId}`);
        } catch (error) {
            console.error(`[WS] Error broadcasting to show ${showId}:`, error);
        }
    }, BROADCAST_DEBOUNCE_MS);
    pendingBroadcasts.set(showId, timeout);
}

// ============================================
// CONNECTION HANDLER
// ============================================
// Extended WebSocket type to track user authentication
interface AuthenticatedWebSocket extends WebSocket {
    userId?: string;
    isAuthenticated?: boolean;
}

export function initWebSocket(wss: WebSocketServer): void {
    wss.on("connection", (ws: AuthenticatedWebSocket) => {
        console.log("[WS] Client connected (unauthenticated)");

        // Track which shows this client is subscribed to
        const subscribedShows: Set<string> = new Set();

        ws.on("message", async (raw: Buffer) => {
            try {
                const msg = JSON.parse(raw.toString());

                // Handle authentication (must be done first)
                if (msg.event === "auth" && msg.data?.ticket) {
                    const { ticket } = msg.data;

                    // Validate and consume ticket (one-time use)
                    const userId = await validateSocketTicket(ticket);

                    if (!userId) {
                        ws.send(JSON.stringify({
                            event: "auth-error",
                            data: { message: "Invalid or expired ticket" }
                        }));
                        return;
                    }

                    // Mark connection as authenticated
                    ws.userId = userId;
                    ws.isAuthenticated = true;

                    ws.send(JSON.stringify({
                        event: "auth-success",
                        data: { userId }
                    }));

                    console.log(`[WS] Client authenticated as user ${userId}`);
                    return;
                }

                // All other events require authentication
                if (!ws.isAuthenticated) {
                    ws.send(JSON.stringify({
                        event: "error",
                        data: { message: "Not authenticated. Send auth event with ticket first." }
                    }));
                    return;
                }

                // Handle join-show (requires auth)
                if (msg.event === "join-show" && msg.data?.showId) {
                    const { showId } = msg.data;

                    // Add to room (returns false if show not live)
                    const joined = joinShowRoom(ws, showId);
                    if (!joined) return;

                    subscribedShows.add(showId);

                    // Send current state immediately
                    const state = await getShowSeatState(showId);
                    ws.send(JSON.stringify({ event: "seat-state", data: state }));

                    // Session recovery: Send user their previously locked seats (if any)
                    const myLockedSeats = await getUserSeats(ws.userId!, showId);
                    if (myLockedSeats && myLockedSeats.length > 0) {
                        ws.send(JSON.stringify({
                            event: "your-locked-seats",
                            data: { seats: myLockedSeats }
                        }));
                        console.log(`[WS] Sent recovery: User ${ws.userId} has seats ${myLockedSeats} locked`);
                    }
                }

                // Handle leave-show
                if (msg.event === "leave-show" && msg.data?.showId) {
                    const { showId } = msg.data;
                    leaveShowRoom(ws, showId);
                    subscribedShows.delete(showId);
                }
            } catch (error) {
                console.error("[WS] Error processing message:", error);
            }
        });

        ws.on("close", () => {
            // Cleanup: Remove from all subscribed rooms
            subscribedShows.forEach((showId) => {
                leaveShowRoom(ws, showId);
            });
            console.log(`[WS] Client disconnected (user: ${ws.userId || 'unauthenticated'})`);
        });

        ws.on("error", (error) => {
            console.error("[WS] Client error:", error);
        });
    });

    console.log("[WS] WebSocket server initialized with room-based subscriptions and ticket auth");
}
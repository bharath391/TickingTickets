import type { Request, Response } from "express";
import { bookingService } from "./bookings.service.js";

/**
 * POST /bookings/:showId/lock
 * Body: { seats: [1, 2, 3] }
 */
export const lockSeats = async (req: Request, res: Response) => {
    try {
        const showId = req.params.showId;
        const { seats } = req.body;
        const userId = (req as any).user?.id as string | undefined;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        if (!showId) {
            res.status(400).json({ error: "Show ID is required" });
            return;
        }

        if (!seats || !Array.isArray(seats) || seats.length === 0 || seats.length > 3) {
            res.status(400).json({ error: "Invalid seat selection (1-3 seats required)" });
            return;
        }

        const result = await bookingService.lockSeats(userId, showId, seats);

        if (result.success) {
            res.json(result);
        } else {
            res.status(409).json(result); // 409 Conflict for unavailable seats
        }
    } catch (error: any) {
        console.error("[Controller] lockSeats error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * POST /bookings/:showId/pay
 */
export const initiatePayment = async (req: Request, res: Response) => {
    try {
        const showId = req.params.showId;
        const userId = (req as any).user?.id as string | undefined;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        if (!showId) {
            res.status(400).json({ error: "Show ID is required" });
            return;
        }

        const result = await bookingService.initiatePayment(userId, showId);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error: any) {
        console.error("[Controller] initiatePayment error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * POST /bookings/:showId/cancel
 */
export const cancelBooking = async (req: Request, res: Response) => {
    try {
        const showId = req.params.showId;
        const userId = (req as any).user?.id as string | undefined;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        if (!showId) {
            res.status(400).json({ error: "Show ID is required" });
            return;
        }

        const result = await bookingService.cancelBooking(userId, showId);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error: any) {
        console.error("[Controller] cancelBooking error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * POST /bookings/webhook
 * Body: { userId, showId, paymentId, status }
 */
export const confirmBooking = async (req: Request, res: Response) => {
    try {
        const { userId, showId, paymentId, status } = req.body;

        // TODO: Verify webhook signature from payment gateway

        if (status !== "success") {
            // Payment failed - cancel the booking
            await bookingService.cancelBooking(userId, showId);
            res.json({ received: true, action: "cancelled" });
            return;
        }

        const result = await bookingService.confirmBooking(userId, showId, paymentId);
        res.json({ received: true, ...result });
    } catch (error: any) {
        console.error("[Controller] confirmBooking error:", error);
        res.status(500).json({ error: error.message });
    }
};

import type { Request, Response } from "express";
import { bookingService } from "./bookings.service.js";
import { execQueryPool } from "../db/connect.js";

export const confirmBooking = async (req: Request, res: Response) => {
    try {
        const { showId, paymentId, status } = req.body; // Webhook payload usually comes in body
        // In a real scenario, you'd verify the webhook signature here.

        if (status !== "success") {
            // Handle payment failure (release seat)
            // await bookingService.releaseSeat(...)
            res.json({ received: true });
            return;
        }

        // We probably need to extract userId from metadata sent to payment gateway
        // For this abstraction, we'll assume it's in the body for now
        const { userId } = req.body;

        await bookingService.confirmBooking(userId, showId, paymentId);
        res.json({ received: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const lockSeats = async (req: Request, res: Response) => {
    try {
        const { showId } = req.params;
        const { seats } = req.body; // Expecting array of numbers e.g., [1, 2]
        const userId = (req as any).user?.id; // Assuming auth middleware populates this
        if (!showId || !seats || seats.length > 3) {
            res.status(400).json({ msg: "Invalid showId or seats" });
            return;
        }
        const show = await execQueryPool(`SELECT * FROM shows WHERE id = $1`, [showId]);
        if (!show) {
            res.status(404).json({ msg: "Show not found" });
            return;
        }
        //check seat count from redis : TODO or include this in lockseats

        const result = await bookingService.lockSeats(userId, showId, seats);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const initiatePayment = async (req: Request, res: Response) => {
    try {
        const { showId } = req.params;
        const userId = (req as any).user?.id;
        if (!showId || !userId) {
            res.status(400).json({ msg: "Missing showId or userId" });
            return;
        }
        const query = "select * from shows where id = $1";
        const queryResult = await execQueryPool(query, [showId]);
        if (queryResult.rowCount == 0) {
            res.status(404).json({ msg: "Show not found" });
            return;
        }
        const result = await bookingService.initiatePayment(userId, showId);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

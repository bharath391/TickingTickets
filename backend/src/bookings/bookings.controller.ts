import type { Request, Response } from "express";
import tryCatch from "../utils/tryCatch.js";
import { getClient } from "../db/db.config.js"; // Likely need transaction for booking

const bookTicket = async (req: Request, res: Response) => {
    await tryCatch(async () => {
        const { showId, seatNumber } = req.body;
        // TODO: Start Transaction (getClient)
        // TODO: Check seat availability
        // TODO: Reserve seat
        // TODO: Process payment (Mock)
        // TODO: Confirm booking
        res.status(200).json({ msg: "Ticket booked successfully" });
    }, res, "bookTicket");
};

const cancelBooking = async (req: Request, res: Response) => {
    await tryCatch(async () => {
        const { bookingId } = req.params;
        // TODO: Verify ownership
        // TODO: Refund logic
        // TODO: Free up seat
        res.status(200).json({ msg: "Booking cancelled" });
    }, res, "cancelBooking");
};

const getMyBookings = async (req: Request, res: Response) => {
    await tryCatch(async () => {
        // const userId = req.user.id; // from middleware
        // TODO: Fetch user bookings
        res.status(200).json({ msg: "User bookings list" });
    }, res, "getMyBookings");
};

export { bookTicket, cancelBooking, getMyBookings };

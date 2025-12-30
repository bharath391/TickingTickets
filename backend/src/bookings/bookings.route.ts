import { Router, type Router as RouterType } from "express";
import { lockSeats, initiatePayment, cancelBooking, confirmBooking } from "./bookings.controller.js";

const router: RouterType = Router();

// POST /api/v1/bookings/:showId/lock
// Body: { seats: [1, 2, 3] }
router.post("/:showId/lock", lockSeats);

// POST /api/v1/bookings/:showId/pay
// TODO: send {showId,userId} -> so that payment webhook can 
//send this data to me laater , which i can use to confirm booking
router.post("/:showId/pay", initiatePayment);

// POST /api/v1/bookings/:showId/cancel
router.post("/:showId/cancel", cancelBooking);

// POST /api/v1/bookings/confirm (Client-side payment confirmation)
router.post("/confirm", confirmBooking);

export default router;

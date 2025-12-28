import { Router, type Router as RouterType } from "express";
import { lockSeats, initiatePayment, cancelBooking, confirmBooking } from "./bookings.controller.js";

const router: RouterType = Router();

// POST /api/v1/bookings/:showId/lock
// Body: { seats: [1, 2, 3] }
router.post("/:showId/lock", lockSeats);

// POST /api/v1/bookings/:showId/pay
router.post("/:showId/pay", initiatePayment);

// POST /api/v1/bookings/:showId/cancel
router.post("/:showId/cancel", cancelBooking);

// POST /api/v1/bookings/webhook (Payment gateway callback)
router.post("/webhook", confirmBooking);

export default router;

import express from "express";
import { lockSeats, initiatePayment, confirmBooking } from "./bookings.controller.js";

import { Router, type Router as RouterType } from "express";

const router: RouterType = Router();

// POST /api/v1/bookings/:showId/lock
// Body: { seats: [1, 2] }
router.post("/:showId/lock", lockSeats);

// POST /api/v1/bookings/:showId/pay
router.post("/:showId/pay", initiatePayment);

// POST /api/v1/bookings/webhook
// Usually webhooks are global, not per-show, but mounting it here for now.
// Verify signature middleware should be used in production.
router.post("/webhook", confirmBooking);

export default router;

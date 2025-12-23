import { Router } from "express";
import { bookTicket, cancelBooking, getMyBookings } from "./bookings.controller.js";
import authMiddleware from "../middleware/userAuth.middleware.js"; 

const router = Router();

router.use(authMiddleware); // Protect all booking routes

router.post("/", bookTicket);
router.get("/my-bookings", getMyBookings);
router.delete("/:bookingId", cancelBooking);

export default router;
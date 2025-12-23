import { Router } from "express";
import { getShows, getShowById, createShow } from "./shows.controller.js";
import authMiddleware from "../middleware/userAuth.middleware.js";

const router = Router();

router.get("/", getShows);
router.get("/:id", getShowById);
router.post("/", authMiddleware, createShow); 

export default router;
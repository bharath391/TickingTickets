import { Router, type Router as RouterType } from "express";
import {
    adminLogin, createMovie, updateMovie, deleteMovie,
    createShow, updateShow, deleteShow, goLiveShow, stopBooking,
    createTheatre, updateTheatre, deleteTheatre
} from "./admin.controller.js";

const router: RouterType = Router();

//auth
router.post("/login", adminLogin);

// Movies
router.post("/movies", createMovie);
router.put("/movies/:id", updateMovie);
router.delete("/movies/:id", deleteMovie);

// Shows
router.post("/shows", createShow);
router.put("/shows/:id", updateShow);
router.delete("/shows/:id", deleteShow);
router.post("/shows/:id/go-live", goLiveShow);       // Start booking
router.post("/shows/:id/stop-booking", stopBooking); // Stop booking

// Theatres
router.post("/theatres", createTheatre);
router.put("/theatres/:id", updateTheatre);
router.delete("/theatres/:id", deleteTheatre);

export default router;

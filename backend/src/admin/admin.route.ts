import { Router, type Router as RouterType } from "express";
import {
    createMovie, updateMovie, deleteMovie,
    createShow, updateShow, deleteShow,
    createTheatre, updateTheatre, deleteTheatre
} from "./admin.controller.js";
import { searchShows } from "../search/search.controller.js";

const router: RouterType = Router();

// Search
router.get("/search", searchShows);

// Movies
router.post("/movies", createMovie);
router.put("/movies/:id", updateMovie);
router.delete("/movies/:id", deleteMovie);

// Shows
router.post("/shows", createShow);
router.put("/shows/:id", updateShow);
router.delete("/shows/:id", deleteShow);

// Theatres
router.post("/theatres", createTheatre);
router.put("/theatres/:id", updateTheatre);
router.delete("/theatres/:id", deleteTheatre);

export default router;

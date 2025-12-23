import {Router} from "express";
import { createShow,createMovie,createTheatre } from "./admin.create.controller.js";
import { updateMovie,updateShow,updateTheatre } from "./admin.update.controller.js";
import {deleteMovie,deleteShow,deleteTheatre} from "./admin.delete.controller.js";
import adminAuth from "../middleware/adminAuth.middleware.js";

const router = Router();

router.post("/create/movie",adminAuth,createMovie);
router.post("/create/theatre",adminAuth,createTheatre);
router.post("/create/show",adminAuth,createShow);

router.post("/update/movie",adminAuth,updateMovie);
router.post("/update/theatre",adminAuth,updateTheatre);
router.post("/update/show",adminAuth,updateShow);

router.post("/delete/movie",adminAuth,deleteMovie);
router.post("/delete/theatre",adminAuth,deleteTheatre);
router.post("/delete/show",adminAuth,deleteShow);

export default router;
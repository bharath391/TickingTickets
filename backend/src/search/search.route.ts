import { Router, type Router as RouterType } from "express";
import { searchShows } from "./search.controller.js";

const router: RouterType = Router();

router.get("/", searchShows);

export default router;

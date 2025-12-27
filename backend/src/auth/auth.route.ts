import express  from "express";
import { signup, login } from "./auth.controller.js";

const router:express.Router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

export default router;

import {Router} from "express";
import {signUp,logIn} from "./auth.controller.js";

const router = Router();

router.get("/",(req,res) => res.status(200).json({msg:"hello there"}));
router.post("/signup",signUp);
router.post("/login",logIn);

export default router;
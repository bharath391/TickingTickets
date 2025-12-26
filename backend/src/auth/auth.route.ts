import { login ,singup} from "./auth.controller.js"
import {Router} from "express";

const router:Router = Router();

router.post("/singup",singup);
router.post("/login",login);

export default router;
import { login, singup } from "./auth.controller.js";
import { Router } from "express";
const router = Router();
router.post("/singup", singup);
router.post("/login", login);
export default router;
//# sourceMappingURL=auth.route.js.map
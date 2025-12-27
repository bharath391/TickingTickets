import express from "express";
import { signup, login, adminLogin } from "./auth.controller.js";
const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.post("/admin/login", adminLogin);
export default router;
//# sourceMappingURL=auth.route.js.map
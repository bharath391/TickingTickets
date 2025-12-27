import express from "express";
import { signup, login } from "./auth.controller.js";
import { adminLogin } from "../admin/admin.controller.js";
const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.post("/admin/login", adminLogin);
export default router;
//# sourceMappingURL=auth.route.js.map
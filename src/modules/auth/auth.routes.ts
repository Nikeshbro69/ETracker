import { Router } from "express";
import { login, refresh, logout, me } from "./auth.controller.js";
import { authGuard } from "../../middleware/authGuard.js";
import { authRateLimiter } from "../../middleware/rateLimiter.js";

const router = Router();

router.post("/login", authRateLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", authGuard, logout);
router.get("/me", authGuard, me);

export default router;

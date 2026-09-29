import { Router } from "express";
import {
  register,
  login,
  logout,
  getMe,
} from "../controllers/authController.js";
import { registerRules, loginRules } from "../validators/authValidators.js";
import validate from "../middleware/validate.js";
import protect from "../middleware/auth.js";
import { loginLimiter, registerLimiter } from "../middleware/rateLimiters.js";

const router = Router();

router.post("/register", registerLimiter, registerRules, validate, register);
router.post("/login", loginLimiter, loginRules, validate, login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;

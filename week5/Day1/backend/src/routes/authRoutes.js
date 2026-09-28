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

const router = Router();

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;

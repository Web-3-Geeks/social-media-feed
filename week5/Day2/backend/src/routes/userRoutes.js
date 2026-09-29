import { Router } from "express";
import { getMyProfile } from "../controllers/userController.js";
import protect from "../middleware/auth.js";

const router = Router();

router.get("/me", protect, getMyProfile);

export default router;

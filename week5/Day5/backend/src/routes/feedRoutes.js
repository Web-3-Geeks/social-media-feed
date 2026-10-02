import { Router } from "express";
import { getFollowingFeed } from "../controllers/postController.js";
import protect from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { listPostsRules } from "../validators/postValidators.js";

// GET /api/feed from the task spec. Same handler as /api/posts/feed, which the
// frontend already uses, so both paths keep working.
const router = Router();

router.get("/", protect, listPostsRules, validate, getFollowingFeed);

export default router;

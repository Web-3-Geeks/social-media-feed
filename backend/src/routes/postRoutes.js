import { Router } from "express";
import { createPost, getFeed, getPost, updatePost, deletePost } from "../controllers/postController.js";
import protect from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { createPostRules, listPostsRules, postIdRules, updatePostRules } from "../validators/postValidators.js";

const router = Router();

router.use(protect);

router.get("/", listPostsRules, validate, getFeed);
router.post("/", createPostRules, validate, createPost);
router.get("/:id", postIdRules, validate, getPost);
router.patch("/:id", updatePostRules, validate, updatePost);
router.delete("/:id", postIdRules, validate, deletePost);

export default router;

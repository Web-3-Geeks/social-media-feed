import { Router } from "express";
import { createPost, getFeed, getFollowingFeed, getPost, updatePost, deletePost } from "../controllers/postController.js";
import protect from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { createPostRules, listPostsRules, postIdRules, updatePostRules } from "../validators/postValidators.js";
import { likePost, unlikePost } from "../controllers/likeController.js";
import { createComment, getComments } from "../controllers/commentController.js";
import { createCommentRules, listCommentsRules } from "../validators/commentValidators.js";

const router = Router();

router.use(protect);

router.get("/", listPostsRules, validate, getFeed);
router.get("/feed", listPostsRules, validate, getFollowingFeed);
router.post("/", createPostRules, validate, createPost);
router.get("/:id", postIdRules, validate, getPost);
router.patch("/:id", updatePostRules, validate, updatePost);
router.delete("/:id", postIdRules, validate, deletePost);
router.post("/:id/like", postIdRules, validate, likePost);
router.delete("/:id/like", postIdRules, validate, unlikePost);
router.post("/:id/comments", createCommentRules, validate, createComment);
router.get("/:id/comments", listCommentsRules, validate, getComments);

export default router;

import { Router } from "express";
import { deleteComment, updateComment } from "../controllers/commentController.js";
import protect from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { commentIdRules, updateCommentRules } from "../validators/commentValidators.js";

const router = Router();

router.use(protect);

router.patch("/:id", updateCommentRules, validate, updateComment);
router.delete("/:id", commentIdRules, validate, deleteComment);

export default router;

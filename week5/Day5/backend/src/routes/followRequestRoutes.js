import { Router } from "express";
import {
  acceptRequest,
  declineRequest,
  getFollowRequests,
} from "../controllers/followRequestController.js";
import protect from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { requestUserIdRules } from "../validators/followRequestValidators.js";
import { listFollowRules } from "../validators/userValidators.js";

const router = Router();

router.use(protect);

router.get("/", listFollowRules, validate, getFollowRequests);
router.post("/:userId/accept", requestUserIdRules, validate, acceptRequest);
router.delete("/:userId", requestUserIdRules, validate, declineRequest);

export default router;

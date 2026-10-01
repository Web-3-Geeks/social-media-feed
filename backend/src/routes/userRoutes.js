import { Router } from "express";
import { getMyProfile, getUserProfile, updateMyProfile, searchUsers } from "../controllers/userController.js";
import { followUser, unfollowUser, getFollowers, getFollowing } from "../controllers/followController.js";
import protect from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { userIdRules, listFollowRules, updateProfileRules, searchUsersRules } from "../validators/userValidators.js";

const router = Router();

router.use(protect);

router.get("/me", getMyProfile);
router.post("/:id/follow", userIdRules, validate, followUser);
router.delete("/:id/follow", userIdRules, validate, unfollowUser);
router.get("/:id/followers", userIdRules, listFollowRules, validate, getFollowers);
router.get("/:id/following", userIdRules, listFollowRules, validate, getFollowing);
router.get("/:id", userIdRules, validate, getUserProfile);
router.patch("/me", updateProfileRules, validate, updateMyProfile);
router.get("/", searchUsersRules, validate, searchUsers);

export default router;

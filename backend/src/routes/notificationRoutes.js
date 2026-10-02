import { Router } from "express";
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "../controllers/notificationController.js";
import protect from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {
  listNotificationsRules,
  notificationIdRules,
} from "../validators/notificationValidators.js";

const router = Router();

router.use(protect);

router.get("/", listNotificationsRules, validate, getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", notificationIdRules, validate, markAsRead);

export default router;

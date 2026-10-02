import { param, query } from "express-validator";

export const listNotificationsRules = [
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
  query("before").optional().isISO8601().withMessage("before must be an ISO date"),
  query("beforeId").optional().isMongoId().withMessage("beforeId must be a notification id"),
  query().custom((_, { req }) => {
    if (Boolean(req.query.before) !== Boolean(req.query.beforeId)) {
      throw new Error("before and beforeId must be sent together");
    }
    return true;
  }),
];

export const notificationIdRules = [
  param("id").isMongoId().withMessage("Invalid notification id"),
];

import { body, param, query } from "express-validator";

export const userIdRules = [
  param("id").isMongoId().withMessage("Invalid user id"),
];

export const listFollowRules = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("before")
    .optional()
    .isISO8601()
    .withMessage("before must be an ISO date"),
  query("beforeId")
    .optional()
    .isMongoId()
    .withMessage("beforeId must be a follow id"),
  query().custom((_, { req }) => {
    if (Boolean(req.query.before) !== Boolean(req.query.beforeId)) {
      throw new Error("before and beforeId must be sent together");
    }
    return true;
  }),
];

export const updateProfileRules = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be text")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters"),

  body("bio")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("Bio must be text")
    .trim()
    .isLength({ max: 160 })
    .withMessage("Bio cannot exceed 160 characters"),

  body("avatar")
    .optional({ values: "falsy" })
    .trim()
    .isURL({ protocols: ["https"], require_protocol: true })
    .withMessage("Avatar must be a valid https:// link"),

  // Only true/false. toBoolean makes the value a real boolean for the controller.
  body("isPrivate")
    .optional()
    .isBoolean({ strict: true })
    .withMessage("isPrivate must be true or false")
    .toBoolean(true),

  body().custom((_, { req }) => {
    if (
      req.body?.name === undefined &&
      req.body?.bio === undefined &&
      req.body?.avatar === undefined &&
      req.body?.isPrivate === undefined
    ) {
      throw new Error("Nothing to update");
    }
    return true;
  }),
];

export const searchUsersRules = [
  query("search")
    .isString()
    .withMessage("Search must be text")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Search query is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Search must be 1-50 characters"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive number")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50")
    .toInt(),
];

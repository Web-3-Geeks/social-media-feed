import { body, param, query } from "express-validator";

const MAX_CONTENT = 500;

export const postIdRules = [param("id").isMongoId().withMessage("Invalid post id")];

export const listPostsRules = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive number").toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50")
    .toInt(),
];

export const createPostRules = [
  body("content")
    .isString().withMessage("Content must be text")
    .trim()
    .notEmpty().withMessage("Post content cannot be empty")
    .isLength({ max: MAX_CONTENT }).withMessage(`Content cannot exceed ${MAX_CONTENT} characters`),

  body("imageUrl")
    .optional({ values: "falsy" })
    .trim()
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("Image URL must be a valid http(s) link"),
];

export const updatePostRules = [
  ...postIdRules,

  body("content")
    .optional()
    .isString().withMessage("Content must be text")
    .trim()
    .notEmpty().withMessage("Post content cannot be empty")
    .isLength({ max: MAX_CONTENT }).withMessage(`Content cannot exceed ${MAX_CONTENT} characters`),

  body("imageUrl")
    .optional({ values: "falsy" })
    .trim()
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("Image URL must be a valid http(s) link"),

  body().custom((_, { req }) => {
    if (req.body?.content === undefined && req.body?.imageUrl === undefined) {
      throw new Error("Nothing to update");
    }
    return true;
  }),
];

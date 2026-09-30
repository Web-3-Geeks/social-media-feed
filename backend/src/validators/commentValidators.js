import { body, param, query } from "express-validator";
import { COMMENT_MAX_LENGTH } from "../models/Comment.js";

const contentRule = () =>
  body("content")
    .isString().withMessage("Comment must be text")
    .trim()
    .notEmpty().withMessage("Comment cannot be empty")
    .isLength({ max: COMMENT_MAX_LENGTH })
    .withMessage(`Comment cannot exceed ${COMMENT_MAX_LENGTH} characters`);

const postIdParam = param("id").isMongoId().withMessage("Invalid post id");

export const createCommentRules = [postIdParam, contentRule()];

export const listCommentsRules = [
  postIdParam,
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
  query("before").optional().isISO8601().withMessage("before must be an ISO date"),
  query("beforeId").optional().isMongoId().withMessage("beforeId must be a comment id"),
  query().custom((_, { req }) => {
    if (Boolean(req.query.before) !== Boolean(req.query.beforeId)) {
      throw new Error("before and beforeId must be sent together");
    }
    return true;
  }),
];

export const commentIdRules = [param("id").isMongoId().withMessage("Invalid comment id")];

export const updateCommentRules = [...commentIdRules, contentRule()];


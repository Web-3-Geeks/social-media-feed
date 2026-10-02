import { param } from "express-validator";

export const requestUserIdRules = [
  param("userId").isMongoId().withMessage("Invalid user id"),
];

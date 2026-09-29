import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";

const validate = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) return next();

  const errors = {};
  for (const error of result.array()) {
    // Whole-request checks (body().custom / query().custom) have no path, so use
    // their location ("body" or "query") as the key.
    const field = error.path || error.location || "body";
    if (!errors[field]) {
      errors[field] = error.msg;
    }
  }

  next(new AppError("Validation failed", 400, errors));
};

export default validate;

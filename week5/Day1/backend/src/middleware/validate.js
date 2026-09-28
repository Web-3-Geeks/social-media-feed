import { validationResult  } from "express-validator";
import AppError from "../utils/AppError.js";

const validate = (req, res, next) => {
    const result = validationResult(req);

    if (result.isEmpty()) return next();

    const errors = {};
    for (const error of result.array()) {
        if (!errors[error.path]) {
            errors[error.path] = error.msg;
        }
    }

    next(new AppError("Validation failed", 400, errors));
};

export default validate;
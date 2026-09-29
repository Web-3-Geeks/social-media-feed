import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import AppError from "../utils/AppError.js";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const tooManyRequests = (message) => (req, res, next) => {
  next(new AppError(message, 429));
};

// Only failed logins count, keyed by IP + email: slows down password guessing
// against one account without blocking other users behind the same IP.
export const loginLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip)}:${String(req.body?.email || "").toLowerCase()}`,
  handler: tooManyRequests("Too many failed login attempts. Please try again in 15 minutes."),
});

// Only successful sign-ups count: limits how many accounts one IP can create.
export const registerLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 20,
  skipFailedRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: tooManyRequests("Too many accounts created. Please try again later."),
});

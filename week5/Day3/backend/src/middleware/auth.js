import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";

const protect = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    throw new AppError("Not authenticated. Please log in.", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch (error) {
    const message =
      error.name === "TokenExpiredError"
        ? "Session expired. Please log in again."
        : "Invalid token. Please log in again.";
    throw new AppError(message, 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError("User no longer exists. Please log in again.", 401);
  }

  req.user = user;
  next();
};

export default protect;

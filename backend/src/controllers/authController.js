import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import generateToken from "../utils/generateToken.js";
import { setTokenCookie, clearTokenCookie  } from "../utils/tokenCookie.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    success: true,
    message: "Registration successful",
    user,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken(user._id);
  setTokenCookie(res, token);

  res.status(200).json({
    success: true,
    message: "Login successful",
    user,
  });
};

export const logout = (req, res) => {
  clearTokenCookie(res);
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};


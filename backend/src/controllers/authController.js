import bcrypt from "bcryptjs";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import generateToken from "../utils/generateToken.js";
import { setTokenCookie, clearTokenCookie  } from "../utils/tokenCookie.js";

// bcrypt hash (cost 12) of a throwaway string. Login compares against it when the
// email doesn't exist, so "no such user" takes as long as "wrong password" and
// response times can't reveal which emails are registered.
const DUMMY_PASSWORD_HASH = "$2b$12$rcfRTcJtn7pYn.Xo85bruO1RFf3ZaCmEYiFr0l2lfzTXFqwm/7MqO";

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

  const passwordMatches = user
    ? await user.comparePassword(password)
    : await bcrypt.compare(password, DUMMY_PASSWORD_HASH);

  if (!user || !passwordMatches) {
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


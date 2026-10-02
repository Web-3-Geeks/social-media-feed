import User from "../models/User.js";
import FollowRequest from "../models/FollowRequest.js";
import AppError from "../utils/AppError.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import { acceptFollowRequest, withFollowState } from "../utils/followService.js";

const PUBLIC_FIELDS =
  "name avatar bio followerCount followingCount postCount isPrivate createdAt";

export const getMyProfile = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.params.id).select(PUBLIC_FIELDS);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // The profile header (name, bio, counts) is visible even for a private
  // account, like on Instagram. Only the posts and lists are locked.
  const [withState] = await withFollowState([user.toJSON()], req.user._id);

  res.status(200).json({
    success: true,
    user: withState,
  });
};

export const updateMyProfile = async (req, res) => {
  const { name, bio, avatar, isPrivate } = req.body;
  const goingPublic = isPrivate === false && req.user.isPrivate;

  if (name !== undefined) req.user.name = name;
  if (bio !== undefined) req.user.bio = bio || "";
  if (avatar !== undefined) req.user.avatar = avatar || "";
  if (isPrivate !== undefined) req.user.isPrivate = isPrivate;

  await req.user.save();

  // A public account has nothing to approve, so everyone waiting is let in.
  if (goingPublic) {
    const pending = await FollowRequest.find({ to: req.user._id }).select("from");
    for (const request of pending) {
      await acceptFollowRequest(request.from, req.user._id);
    }
    const fresh = await User.findById(req.user._id);
    return res.status(200).json({ success: true, message: "Profile updated", user: fresh });
  }

  res.status(200).json({
    success: true,
    message: "Profile updated",
    user: req.user,
  });
};

export const searchUsers = async (req, res) => {
  const escaped = escapeRegex(req.query.search.trim());
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {
    name: { $regex: escaped, $options: "i" },
    _id: { $ne: req.user._id },
  };

  const [users, total] = await Promise.all([
    User.find(filter).select(PUBLIC_FIELDS).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    users: await withFollowState(
      users.map((u) => u.toJSON()),
      req.user._id,
    ),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

import User from "../models/User.js";
import Follow from "../models/Follow.js";
import AppError from "../utils/AppError.js";

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getMyProfile = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "name avatar bio followerCount followingCount postCount createdAt",
  );
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isFollowing = await Follow.exists({
    follower: req.user._id,
    following: user._id,
  });

  res.status(200).json({
    success: true,
    user: { ...user.toJSON(), isFollowing: Boolean(isFollowing) },
  });
};

export const updateMyProfile = async (req, res) => {
  const { name, bio, avatar } = req.body;

  if (name !== undefined) req.user.name = name;
  if (bio !== undefined) req.user.bio = bio || "";
  if (avatar !== undefined) req.user.avatar = avatar || "";

  await req.user.save();

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
    User.find(filter)
      .select("name avatar bio followerCount followingCount postCount createdAt")
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  const follows = await Follow.find({
    follower: req.user._id,
    following: { $in: users.map((u) => u._id) },
  }).select("following");
  const followingIds = new Set(follows.map((f) => String(f.following)));

  res.status(200).json({
    success: true,
    users: users.map((u) => ({
      ...u.toJSON(),
      isFollowing: followingIds.has(String(u._id)),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};


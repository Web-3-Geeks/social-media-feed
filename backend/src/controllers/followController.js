import Follow from "../models/Follow.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";

const ensureUserExists = async (userId) => {
  const exists = await User.exists({ _id: userId });
  if (!exists) {
    throw new AppError("User not found", 404);
  }
};

// Adds isFollowing to each user with ONE query for the whole list (not one per user),
// same pattern as withLikedByMe() in postController.js.
const withIsFollowing = async (users, currentUserId) => {
  const follows = await Follow.find({
    follower: currentUserId,
    following: { $in: users.map((u) => u.id) },
  }).select("following");

  const followingIds = new Set(follows.map((f) => String(f.following)));

  return users.map((user) => ({
    ...user,
    isFollowing: followingIds.has(String(user.id)),
  }));
};

export const followUser = async (req, res) => {
  const targetId = req.params.id;

  // equals() also matches an uppercase-hex id, which a plain string compare would miss.
  if (req.user._id.equals(targetId)) {
    throw new AppError("You cannot follow yourself", 403);
  }
  await ensureUserExists(targetId);

  let created = false;
  try {
    const result = await Follow.updateOne(
      { follower: req.user._id, following: targetId },
      { $setOnInsert: { follower: req.user._id, following: targetId } },
      { upsert: true },
    );
    created = result.upsertedCount === 1;
  } catch (error) {
    if (error.code !== 11000) throw error;
  }

  if (created) {
    await Promise.all([
      User.updateOne({ _id: req.user._id }, { $inc: { followingCount: 1 } }),
      User.updateOne({ _id: targetId }, { $inc: { followerCount: 1 } }),
    ]);
  }

  const target = await User.findById(targetId).select("followerCount");

  res.status(200).json({
    success: true,
    following: true,
    followerCount: target.followerCount,
  });
};

export const unfollowUser = async (req, res) => {
  const targetId = req.params.id;
  await ensureUserExists(targetId);

  const result = await Follow.deleteOne({
    follower: req.user._id,
    following: targetId,
  });

  if (result.deletedCount === 1) {
    await Promise.all([
      User.updateOne(
        { _id: req.user._id, followingCount: { $gt: 0 } },
        { $inc: { followingCount: -1 } },
      ),
      User.updateOne(
        { _id: targetId, followerCount: { $gt: 0 } },
        { $inc: { followerCount: -1 } },
      ),
    ]);
  }

  const target = await User.findById(targetId).select("followerCount");

  res.status(200).json({
    success: true,
    following: false,
    followerCount: target.followerCount,
  });
};

export const getFollowers = async (req, res) => {
  const targetId = req.params.id;
  await ensureUserExists(targetId);

  const limit = Number(req.query.limit) || 20;
  const filter = { following: targetId };

  if (req.query.before) {
    const before = new Date(req.query.before);
    filter.$or = [
      { createdAt: { $lt: before } },
      { createdAt: before, _id: { $lt: req.query.beforeId } },
    ];
  }

  const follows = await Follow.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .populate("follower", "name avatar bio");

  const hasMore = follows.length > limit;

  const users = await withIsFollowing(
    follows.slice(0, limit).map((f) => ({
      ...f.follower.toJSON(),
      followedAt: f.createdAt,
      followId: f._id,
    })),
    req.user._id,
  );

  res.status(200).json({ success: true, users, hasMore });
};

export const getFollowing = async (req, res) => {
  const targetId = req.params.id;
  await ensureUserExists(targetId);

  const limit = Number(req.query.limit) || 20;
  const filter = { follower: targetId };

  if (req.query.before) {
    const before = new Date(req.query.before);
    filter.$or = [
      { createdAt: { $lt: before } },
      { createdAt: before, _id: { $lt: req.query.beforeId } },
    ];
  }

  const follows = await Follow.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .populate("following", "name avatar bio");

  const hasMore = follows.length > limit;

  const users = await withIsFollowing(
    follows.slice(0, limit).map((f) => ({
      ...f.following.toJSON(),
      followedAt: f.createdAt,
      followId: f._id,
    })),
    req.user._id,
  );

  res.status(200).json({ success: true, users, hasMore });
};

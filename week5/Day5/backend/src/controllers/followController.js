import Follow from "../models/Follow.js";
import FollowRequest from "../models/FollowRequest.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { addFollow, withFollowState } from "../utils/followService.js";
import { notify, unnotify } from "../utils/notify.js";
import { assertCanViewUser } from "../utils/privacy.js";

const findUserOr404 = async (userId) => {
  const user = await User.findById(userId).select("isPrivate followerCount");
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

export const followUser = async (req, res) => {
  const targetId = req.params.id;

  // equals() also matches an uppercase-hex id, which a plain string compare would miss.
  if (req.user._id.equals(targetId)) {
    throw new AppError("You cannot follow yourself", 403);
  }
  const target = await findUserOr404(targetId);

  const alreadyFollowing = await Follow.exists({
    follower: req.user._id,
    following: targetId,
  });

  // Private account: send a request instead. It becomes a follow only when
  // they accept it (see followRequestController.js).
  if (target.isPrivate && !alreadyFollowing) {
    let created = false;
    try {
      const result = await FollowRequest.updateOne(
        { from: req.user._id, to: targetId },
        { $setOnInsert: { from: req.user._id, to: targetId } },
        { upsert: true },
      );
      created = result.upsertedCount === 1;
    } catch (error) {
      if (error.code !== 11000) throw error;
    }

    if (created) {
      await notify({ recipient: targetId, actor: req.user._id, type: "FOLLOW_REQUEST" });
    }

    return res.status(200).json({
      success: true,
      following: false,
      requested: true,
      followerCount: target.followerCount,
    });
  }

  if (await addFollow(req.user._id, targetId)) {
    await notify({ recipient: targetId, actor: req.user._id, type: "FOLLOW" });
  }

  const updated = await User.findById(targetId).select("followerCount");

  res.status(200).json({
    success: true,
    following: true,
    requested: false,
    followerCount: updated.followerCount,
  });
};

// Unfollows, or cancels a request that hasn't been accepted yet.
export const unfollowUser = async (req, res) => {
  const targetId = req.params.id;
  await findUserOr404(targetId);

  const [result, request] = await Promise.all([
    Follow.deleteOne({ follower: req.user._id, following: targetId }),
    FollowRequest.deleteOne({ from: req.user._id, to: targetId }),
  ]);

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
    await unnotify({
      type: "FOLLOW",
      actor: req.user._id,
      recipient: targetId,
    });
  }

  if (request.deletedCount === 1) {
    await unnotify({
      type: "FOLLOW_REQUEST",
      actor: req.user._id,
      recipient: targetId,
    });
  }

  const target = await User.findById(targetId).select("followerCount");

  res.status(200).json({
    success: true,
    following: false,
    requested: false,
    followerCount: target.followerCount,
  });
};

const USER_FIELDS = "name avatar bio isPrivate";

// Shared by followers and following: same cursor, only the side of the follow differs.
const listFollows = async (req, res, { match, side }) => {
  const targetId = req.params.id;
  // A private account's lists are only for its followers, like its posts.
  await assertCanViewUser(req.user._id, targetId);

  const limit = Number(req.query.limit) || 20;
  const filter = { [match]: targetId };

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
    .populate(side, USER_FIELDS);

  const hasMore = follows.length > limit;

  const users = await withFollowState(
    follows
      .slice(0, limit)
      .filter((f) => f[side])
      .map((f) => ({
        ...f[side].toJSON(),
        followedAt: f.createdAt,
        followId: f._id,
      })),
    req.user._id,
  );

  res.status(200).json({ success: true, users, hasMore });
};

export const getFollowers = (req, res) =>
  listFollows(req, res, { match: "following", side: "follower" });

export const getFollowing = (req, res) =>
  listFollows(req, res, { match: "follower", side: "following" });

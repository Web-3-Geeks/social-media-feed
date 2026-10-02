import FollowRequest from "../models/FollowRequest.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { acceptFollowRequest } from "../utils/followService.js";
import { unnotify } from "../utils/notify.js";

const countUnread = (userId) =>
  Notification.countDocuments({ recipient: userId, isRead: false });

// Requests sent to me, newest first, with the same cursor as the other lists.
export const getFollowRequests = async (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const filter = { to: req.user._id };

  if (req.query.before) {
    const before = new Date(req.query.before);
    filter.$or = [
      { createdAt: { $lt: before } },
      { createdAt: before, _id: { $lt: req.query.beforeId } },
    ];
  }

  const requests = await FollowRequest.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .populate("from", "name avatar bio");

  const hasMore = requests.length > limit;

  res.status(200).json({
    success: true,
    requests: requests
      .slice(0, limit)
      .filter((r) => r.from)
      .map((r) => ({ id: r.id, user: r.from, createdAt: r.createdAt })),
    pagination: { limit, hasMore },
  });
};

// :userId is the person who sent the request. Each pair can only have one
// request, so the user id is enough to find it.
export const acceptRequest = async (req, res) => {
  const accepted = await acceptFollowRequest(req.params.userId, req.user._id);
  if (!accepted) {
    throw new AppError("Follow request not found", 404);
  }

  const [me, unreadCount] = await Promise.all([
    User.findById(req.user._id).select("followerCount"),
    countUnread(req.user._id),
  ]);

  res.status(200).json({
    success: true,
    message: "Follow request accepted",
    followerCount: me.followerCount,
    unreadCount,
  });
};

export const declineRequest = async (req, res) => {
  const result = await FollowRequest.deleteOne({
    from: req.params.userId,
    to: req.user._id,
  });
  if (result.deletedCount === 0) {
    throw new AppError("Follow request not found", 404);
  }

  await unnotify({
    type: "FOLLOW_REQUEST",
    actor: req.params.userId,
    recipient: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Follow request removed",
    unreadCount: await countUnread(req.user._id),
  });
};

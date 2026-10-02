import Notification from "../models/Notification.js";
import AppError from "../utils/AppError.js";

// Who did it, and a short look at the post/comment it was about.
const NOTIFICATION_POPULATE = [
  { path: "actor", select: "name avatar" },
  { path: "post", select: "content imageUrl" },
  { path: "comment", select: "content" },
];

const countUnread = (userId) =>
  Notification.countDocuments({ recipient: userId, isRead: false });

export const getNotifications = async (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const filter = { recipient: req.user._id };

  // Same cursor as the feed and comments: older than the last one shown.
  if (req.query.before) {
    const before = new Date(req.query.before);
    filter.$or = [
      { createdAt: { $lt: before } },
      { createdAt: before, _id: { $lt: req.query.beforeId } },
    ];
  }

  const [notifications, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .populate(NOTIFICATION_POPULATE),
    countUnread(req.user._id),
  ]);

  const hasMore = notifications.length > limit;

  res.status(200).json({
    success: true,
    notifications: notifications.slice(0, limit),
    unreadCount,
    pagination: { limit, hasMore },
  });
};

export const getUnreadCount = async (req, res) => {
  res.status(200).json({ success: true, unreadCount: await countUnread(req.user._id) });
};

export const markAsRead = async (req, res) => {
  // Filtering by recipient too means someone else's notification is a 404,
  // so you can't even tell whether that id exists.
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { returnDocument: "after" },
  );

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  res.status(200).json({
    success: true,
    id: notification.id,
    isRead: true,
    unreadCount: await countUnread(req.user._id),
  });
};

export const markAllAsRead = async (req, res) => {
  const result = await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true },
  );

  res.status(200).json({
    success: true,
    updated: result.modifiedCount,
    unreadCount: 0,
  });
};

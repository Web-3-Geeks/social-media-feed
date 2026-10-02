import Follow from "../models/Follow.js";
import FollowRequest from "../models/FollowRequest.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { notify } from "./notify.js";

// Creates the follow and updates both counters. Safe to call twice: the second
// call finds the follow already there and changes nothing. Returns true only
// when a new follow was made.
export const addFollow = async (followerId, followingId) => {
  let created = false;
  try {
    const result = await Follow.updateOne(
      { follower: followerId, following: followingId },
      { $setOnInsert: { follower: followerId, following: followingId } },
      { upsert: true },
    );
    created = result.upsertedCount === 1;
  } catch (error) {
    if (error.code !== 11000) throw error;
  }

  if (created) {
    await Promise.all([
      User.updateOne({ _id: followerId }, { $inc: { followingCount: 1 } }),
      User.updateOne({ _id: followingId }, { $inc: { followerCount: 1 } }),
    ]);
  }
  return created;
};

// Turns a pending request into a real follow. Deleting the request first means
// two accepts at the same time can't both go through. Returns false when there
// was no request (already accepted, declined or cancelled).
export const acceptFollowRequest = async (fromId, toId) => {
  const removed = await FollowRequest.deleteOne({ from: fromId, to: toId });
  if (removed.deletedCount === 0) return false;

  await addFollow(fromId, toId);

  // "X wants to follow you" becomes "X started following you".
  try {
    await Notification.updateOne(
      { type: "FOLLOW_REQUEST", actor: fromId, recipient: toId },
      { type: "FOLLOW", isRead: true },
    );
  } catch (error) {
    console.error("Failed to update notification:", error.message);
  }
  await notify({ recipient: fromId, actor: toId, type: "FOLLOW_ACCEPTED" });
  return true;
};

// Adds isFollowing and isRequested to each user with two queries for the whole
// list (not two per user), so every follow button knows which state to show.
export const withFollowState = async (users, viewerId) => {
  const ids = users.map((u) => u.id);
  const [follows, requests] = await Promise.all([
    Follow.find({ follower: viewerId, following: { $in: ids } }).select("following"),
    FollowRequest.find({ from: viewerId, to: { $in: ids } }).select("to"),
  ]);

  const followingIds = new Set(follows.map((f) => String(f.following)));
  const requestedIds = new Set(requests.map((r) => String(r.to)));

  return users.map((user) => ({
    ...user,
    isFollowing: followingIds.has(String(user.id)),
    isRequested: requestedIds.has(String(user.id)),
  }));
};

import Follow from "../models/Follow.js";
import User from "../models/User.js";
import AppError from "./AppError.js";

// A public account is open to everyone. A private one only to its owner and
// the people whose follow request it accepted.
export const canViewUser = async (viewerId, owner) => {
  if (!owner.isPrivate || owner._id.equals(viewerId)) return true;
  return Boolean(await Follow.exists({ follower: viewerId, following: owner._id }));
};

// For anything that shows a user's content: their posts, a single post, its
// comments and likes, their followers/following lists.
export const assertCanViewUser = async (viewerId, ownerId) => {
  const owner = await User.findById(ownerId).select("isPrivate");
  if (!owner) {
    throw new AppError("User not found", 404);
  }
  if (!(await canViewUser(viewerId, owner))) {
    throw new AppError("This account is private", 403);
  }
  return owner;
};

// Private accounts the viewer doesn't follow, so the global feed can skip
// their posts.
export const hiddenAuthorIds = async (viewerId) => {
  const followingIds = await Follow.find({ follower: viewerId }).distinct("following");
  return User.find({
    isPrivate: true,
    _id: { $nin: [viewerId, ...followingIds] },
  }).distinct("_id");
};

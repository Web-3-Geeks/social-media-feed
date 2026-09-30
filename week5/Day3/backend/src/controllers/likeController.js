import Like from "../models/Like.js";
import Post from "../models/Post.js";
import AppError from "../utils/AppError.js";

const ensurePostExists = async (postId) => {
  const exists = await Post.exists({ _id: postId });
  if (!exists) {
    throw new AppError("Post not found", 404);
  }
};

export const likePost = async (req, res) => {
  const postId = req.params.id;
  await ensurePostExists(postId);

  let created = false;
  try {
    const result = await Like.updateOne(
      { post: postId, user: req.user._id },
      { $setOnInsert: { post: postId, user: req.user._id } },
      { upsert: true }
    );
    created = result.upsertedCount === 1;
  } catch (error) {
    if (error.code !== 11000) throw error;
  }

  const post = created
    ? await Post.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } }, { returnDocument: "after" })
    : await Post.findById(postId);

  res.status(200).json({
    success: true,
    likeCount: post.likeCount,
    likedByMe: true,
  });
};

export const unlikePost = async (req, res) => {
  const postId = req.params.id;
  await ensurePostExists(postId);

  const result = await Like.deleteOne({ post: postId, user: req.user._id });

  const post =
    result.deletedCount === 1
      ? await Post.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } }, { returnDocument: "after" })
      : await Post.findById(postId);

  res.status(200).json({
    success: true,
    likeCount: post.likeCount,
    likedByMe: false,
  });
};

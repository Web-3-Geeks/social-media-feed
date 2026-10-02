import Like from "../models/Like.js";
import Post from "../models/Post.js";
import AppError from "../utils/AppError.js";
import { notify, unnotify } from "../utils/notify.js";
import { assertCanViewUser } from "../utils/privacy.js";

// Also blocks liking/commenting on (or reading comments of) a private
// account's post when you don't follow them.
const findPostOr404 = async (postId, viewerId) => {
  const post = await Post.findById(postId).select("author");
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  await assertCanViewUser(viewerId, post.author);
  return post;
};

export const likePost = async (req, res) => {
  const postId = req.params.id;
  const { author } = await findPostOr404(postId, req.user._id);

  let created = false;
  try {
    const result = await Like.updateOne(
      { post: postId, user: req.user._id },
      { $setOnInsert: { post: postId, user: req.user._id } },
      { upsert: true },
    );
    created = result.upsertedCount === 1;
  } catch (error) {
    if (error.code !== 11000) throw error;
  }

  const post = created
    ? await Post.findByIdAndUpdate(
        postId,
        { $inc: { likeCount: 1 } },
        { returnDocument: "after", timestamps: false },
      )
    : await Post.findById(postId);

  // Only a new like notifies. Liking again (already liked) does nothing.
  if (created) {
    await notify({
      recipient: author,
      actor: req.user._id,
      type: "LIKE",
      post: postId,
    });
  }

  res.status(200).json({
    success: true,
    likeCount: post.likeCount,
    likedByMe: true,
  });
};

export const unlikePost = async (req, res) => {
  const postId = req.params.id;
  await findPostOr404(postId, req.user._id);

  const result = await Like.deleteOne({ post: postId, user: req.user._id });

  const post =
    result.deletedCount === 1
      ? await Post.findByIdAndUpdate(
          postId,
          { $inc: { likeCount: -1 } },
          { returnDocument: "after", timestamps: false },
        )
      : await Post.findById(postId);

  if (result.deletedCount === 1) {
    await unnotify({ type: "LIKE", actor: req.user._id, post: postId });
  }

  res.status(200).json({
    success: true,
    likeCount: post.likeCount,
    likedByMe: false,
  });
};

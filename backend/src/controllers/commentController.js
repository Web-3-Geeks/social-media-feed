import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import AppError from "../utils/AppError.js";
import { notify, unnotify } from "../utils/notify.js";
import { assertCanViewUser } from "../utils/privacy.js";

const AUTHOR_FIELDS = "name avatar";

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

const findCommentOr404 = async (id) => {
  const comment = await Comment.findById(id);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  return comment;
};

const assertCommentOwner = (comment, user) => {
  if (!comment.author.equals(user._id)) {
    throw new AppError("You can only modify your own comments", 403);
  }
};

export const createComment = async (req, res) => {
  const postId = req.params.id;
  const { author } = await findPostOr404(postId, req.user._id);

  const comment = await Comment.create({
    post: postId,
    author: req.user._id,
    content: req.body.content,
  });
  // timestamps: false so a new comment doesn't make the post look "Edited".
  await Post.updateOne(
    { _id: postId },
    { $inc: { commentCount: 1 } },
    { timestamps: false },
  );
  await comment.populate("author", AUTHOR_FIELDS);

  await notify({
    recipient: author,
    actor: req.user._id,
    type: "COMMENT",
    post: postId,
    comment: comment._id,
  });

  res.status(201).json({
    success: true,
    message: "Comment added",
    comment,
  });
};

export const getComments = async (req, res) => {
  const postId = req.params.id;
  await findPostOr404(postId, req.user._id);

  const limit = Number(req.query.limit) || 20;
  const filter = { post: postId };

  // Newest first. For "view more", return comments older than the last one shown.
  if (req.query.before) {
    const before = new Date(req.query.before);
    filter.$or = [
      { createdAt: { $lt: before } },
      { createdAt: before, _id: { $lt: req.query.beforeId } },
    ];
  }

  const comments = await Comment.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .populate("author", AUTHOR_FIELDS);

  const hasMore = comments.length > limit;

  res.status(200).json({
    success: true,
    comments: comments.slice(0, limit),
    pagination: { limit, hasMore },
  });
};

export const updateComment = async (req, res) => {
  const comment = await findCommentOr404(req.params.id);
  assertCommentOwner(comment, req.user);

  comment.content = req.body.content;
  await comment.save();
  await comment.populate("author", AUTHOR_FIELDS);

  res.status(200).json({
    success: true,
    message: "Comment updated",
    comment,
  });
};

export const deleteComment = async (req, res) => {
  const comment = await findCommentOr404(req.params.id);
  assertCommentOwner(comment, req.user);

  await comment.deleteOne();
  await Post.updateOne(
    { _id: comment.post, commentCount: { $gt: 0 } },
    { $inc: { commentCount: -1 } },
    { timestamps: false },
  );

  await unnotify({ comment: comment._id });

  res.status(200).json({
    success: true,
    message: "Comment deleted",
    id: comment.id,
  });
};

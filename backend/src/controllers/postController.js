import Comment from "../models/Comment.js";
import Like from "../models/Like.js";
import Post from "../models/Post.js";
import AppError from "../utils/AppError.js";
import User from "../models/User.js";
import Follow from "../models/Follow.js";
import Notification from "../models/Notification.js";
import { assertCanViewUser, hiddenAuthorIds } from "../utils/privacy.js";
import { escapeRegex } from "../utils/escapeRegex.js";

const AUTHOR_FIELDS = "name avatar";

const findPostOr404 = async (id) => {
  const post = await Post.findById(id);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  return post;
};

const assertOwner = (post, user) => {
  if (!post.author.equals(user._id)) {
    throw new AppError("You can only modify your own posts", 403);
  }
};

// Adds likedByMe to each post with ONE query for the whole list (not one per post).
const withLikedByMe = async (posts, userId) => {
  const likes = await Like.find({
    user: userId,
    post: { $in: posts.map((p) => p._id) },
  }).select("post");

  const likedIds = new Set(likes.map((like) => String(like.post)));

  return posts.map((post) => ({
    ...post.toJSON(),
    likedByMe: likedIds.has(String(post._id)),
  }));
};

export const createPost = async (req, res) => {
  const { content, imageUrl } = req.body;

  const post = await Post.create({
    author: req.user._id,
    content,
    imageUrl: imageUrl || "",
  });
  await User.updateOne({ _id: req.user._id }, { $inc: { postCount: 1 } });
  await post.populate("author", AUTHOR_FIELDS);

  res.status(201).json({
    success: true,
    message: "Post created",
    post: { ...post.toJSON(), likedByMe: false },
  });
};

const FEED_SORT = { createdAt: -1, _id: -1 };

export const getFeed = async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  // Everyone's posts, except private accounts you don't follow.
  const visible = { author: { $nin: await hiddenAuthorIds(req.user._id) } };
  // ?search= narrows the same feed to posts whose text contains the keyword
  // (any case), so privacy and both pagination modes keep working as they are.
  const search = req.query.search?.trim();
  if (search) {
    visible.content = { $regex: escapeRegex(search), $options: "i" };
  }

  // Cursor mode (default): the newest posts, or with before/beforeId the posts
  // older than the last one the client has. Unlike skip/offset, this can't repeat
  // or skip posts when posts are created or deleted between requests.
  if (!req.query.page) {
    const filter = { ...visible };
    if (req.query.before) {
      const before = new Date(req.query.before);
      filter.$or = [
        { createdAt: { $lt: before } },
        { createdAt: before, _id: { $lt: req.query.beforeId } },
      ];
    }
    const posts = await Post.find(filter)
      .sort(FEED_SORT)
      .limit(limit + 1)
      .populate("author", AUTHOR_FIELDS);

    // Fetching one extra post tells us whether another page exists.
    const hasMore = posts.length > limit;

    return res.status(200).json({
      success: true,
      posts: await withLikedByMe(posts.slice(0, limit), req.user._id),
      pagination: { limit, hasMore },
    });
  }

  // Page mode, only when ?page= is sent (e.g. ?page=1&limit=10, as in the task spec).
  const page = Number(req.query.page);
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find(visible)
      .sort(FEED_SORT)
      .skip(skip)
      .limit(limit)
      .populate("author", AUTHOR_FIELDS),
    Post.countDocuments(visible),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    posts: await withLikedByMe(posts, req.user._id),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  });
};

export const getFollowingFeed = async (req, res) => {
  const limit = Number(req.query.limit) || 10;

  const follows = await Follow.find({ follower: req.user._id }).select(
    "following",
  );
  const authorIds = [...follows.map((f) => f.following), req.user._id];

  const filter = { author: { $in: authorIds } };
  if (req.query.before) {
    const before = new Date(req.query.before);
    filter.$or = [
      { createdAt: { $lt: before } },
      { createdAt: before, _id: { $lt: req.query.beforeId } },
    ];
  }

  const posts = await Post.find(filter)
    .sort(FEED_SORT)
    .limit(limit + 1)
    .populate("author", AUTHOR_FIELDS);

  const hasMore = posts.length > limit;

  res.status(200).json({
    success: true,
    posts: await withLikedByMe(posts.slice(0, limit), req.user._id),
    pagination: { limit, hasMore },
  });
};

// One user's posts for their profile page, newest first, with the same cursor
// pagination as the feeds.
export const getUserPosts = async (req, res) => {
  const userId = req.params.id;
  // 404 for an unknown user, 403 for a private account you don't follow.
  await assertCanViewUser(req.user._id, userId);

  const limit = Number(req.query.limit) || 10;
  const filter = { author: userId };
  if (req.query.before) {
    const before = new Date(req.query.before);
    filter.$or = [
      { createdAt: { $lt: before } },
      { createdAt: before, _id: { $lt: req.query.beforeId } },
    ];
  }

  const posts = await Post.find(filter)
    .sort(FEED_SORT)
    .limit(limit + 1)
    .populate("author", AUTHOR_FIELDS);

  const hasMore = posts.length > limit;

  res.status(200).json({
    success: true,
    posts: await withLikedByMe(posts.slice(0, limit), req.user._id),
    pagination: { limit, hasMore },
  });
};

export const getPost = async (req, res) => {
  const post = await Post.findById(req.params.id).populate(
    "author",
    AUTHOR_FIELDS,
  );
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  if (post.author) await assertCanViewUser(req.user._id, post.author._id);

  const [postWithLike] = await withLikedByMe([post], req.user._id);
  res.status(200).json({ success: true, post: postWithLike });
};

export const updatePost = async (req, res) => {
  const post = await findPostOr404(req.params.id);
  assertOwner(post, req.user);

  const { content, imageUrl } = req.body;
  if (content !== undefined) post.content = content;
  if (imageUrl !== undefined) post.imageUrl = imageUrl || "";

  await post.save();
  await post.populate("author", AUTHOR_FIELDS);
  const [postWithLike] = await withLikedByMe([post], req.user._id);

  res.status(200).json({
    success: true,
    message: "Post updated",
    post: postWithLike,
  });
};

export const deletePost = async (req, res) => {
  const post = await findPostOr404(req.params.id);
  assertOwner(post, req.user);

  await post.deleteOne();
  // Remove the post's likes and comments too, so none are left orphaned.
  await Promise.all([
    Like.deleteMany({ post: post._id }),
    Comment.deleteMany({ post: post._id }),
    Notification.deleteMany({ post: post._id }),
    User.updateOne(
      { _id: post.author, postCount: { $gt: 0 } },
      { $inc: { postCount: -1 } },
    ),
  ]);

  res.status(200).json({
    success: true,
    message: "Post deleted",
    id: post.id,
  });
};

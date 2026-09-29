import Post from "../models/Post.js";
import AppError from "../utils/AppError.js";

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

export const createPost = async (req, res) => {
  const { content, imageUrl } = req.body;

  const post = await Post.create({
    author: req.user._id,
    content,
    imageUrl: imageUrl || "",
  });
  await post.populate("author", AUTHOR_FIELDS);

  res.status(201).json({
    success: true,
    message: "Post created",
    post,
  });
};

const FEED_SORT = { createdAt: -1, _id: -1 };

export const getFeed = async (req, res) => {
  const limit = Number(req.query.limit) || 10;

  // Cursor mode ("load more"): posts older than the last one the client has.
  // Unlike skip/offset, this can't repeat or skip posts when posts are created
  // or deleted between requests.
  if (req.query.before) {
    const before = new Date(req.query.before);
    const posts = await Post.find({
      $or: [
        { createdAt: { $lt: before } },
        { createdAt: before, _id: { $lt: req.query.beforeId } },
      ],
    })
      .sort(FEED_SORT)
      .limit(limit + 1)
      .populate("author", AUTHOR_FIELDS);

    // Fetching one extra post tells us whether another page exists.
    const hasMore = posts.length > limit;

    return res.status(200).json({
      success: true,
      posts: posts.slice(0, limit),
      pagination: { limit, hasMore },
    });
  }

  // Page mode: ?page=1&limit=10
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find().sort(FEED_SORT).skip(skip).limit(limit).populate("author", AUTHOR_FIELDS),
    Post.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
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

  res.status(200).json({ success: true, post });
};

export const updatePost = async (req, res) => {
    const post = await findPostOr404(req.params.id);
    assertOwner(post, req.user);

    const { content, imageUrl } = req.body;
    if (content !== undefined) post.content = content;
    if (imageUrl !== undefined) post.imageUrl = imageUrl || "";

    await post.save();
    await post.populate("author", AUTHOR_FIELDS);

    res.status(200).json({
        success: true,
        message: "Post updated",
        post,
    });
};

export const deletePost = async (req, res) => {
  const post = await findPostOr404(req.params.id);
  assertOwner(post, req.user);

  await post.deleteOne();

  res.status(200).json({
    success: true,
    message: "Post deleted",
    id: post.id,
  });
};


import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Post must have an author"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      maxlength: [500, "Content cannot exceed 500 characters"],
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0
    },
  },
  { timestamps: true },
);

postSchema.index({ createdAt: -1, _id: -1 });
// A profile's posts and the following feed: filter by author and sort from the
// same index. Also covers plain "posts by author" lookups.
postSchema.index({ author: 1, createdAt: -1, _id: -1 });

postSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Post = mongoose.model("Post", postSchema);

export default Post;

import mongoose from "mongoose";

export const COMMENT_MAX_LENGTH = 300;

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Comment must belong to a post"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Comment must have an author"],
      index: true,
    },
    content: {
      type: String,
      required: [true, "Comment cannot be empty"],
      trim: true,
      maxlength: [
        COMMENT_MAX_LENGTH,
        `Comment cannot exceed ${COMMENT_MAX_LENGTH} characters`,
      ],
    },
  },
  { timestamps: true },
);

// Comments are listed newest first; MongoDB reads this index in reverse for that.
commentSchema.index({ post: 1, createdAt: 1, _id: 1 });

commentSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;

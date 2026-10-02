import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification must have a recipient"],
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification must have an actor"],
    },
    type: {
      type: String,
      enum: ["LIKE", "COMMENT", "FOLLOW", "FOLLOW_REQUEST", "FOLLOW_ACCEPTED"],
      required: [true, "Notification must have a type"],
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// "My notifications, newest first" — the query every GET /api/notifications makes.
notificationSchema.index({ recipient: 1, createdAt: -1, _id: -1 });
// Unread-count badge: count where recipient + isRead:false.
notificationSchema.index({ recipient: 1, isRead: 1 });
// Deleting a post or comment removes its notifications. Sparse: follow
// notifications have no post/comment, so they stay out of these indexes.
notificationSchema.index({ post: 1 }, { sparse: true });
notificationSchema.index({ comment: 1 }, { sparse: true });

notificationSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

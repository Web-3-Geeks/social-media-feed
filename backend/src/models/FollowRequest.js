import mongoose from "mongoose";

// A pending follow to a private account. Kept apart from Follow, so Follow only
// ever holds accepted follows and the feed/followers queries don't change.
const followRequestSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Follow request must have a sender"],
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Follow request must have a receiver"],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

followRequestSchema.index({ from: 1, to: 1 }, { unique: true });
// "Requests sent to me, newest first".
followRequestSchema.index({ to: 1, createdAt: -1, _id: -1 });

followRequestSchema.pre("validate", function () {
  if (this.from.equals(this.to)) {
    throw new Error("You cannot request to follow yourself");
  }
});

followRequestSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const FollowRequest = mongoose.model("FollowRequest", followRequestSchema);

export default FollowRequest;

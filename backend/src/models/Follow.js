import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Follow must have a follower"],
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Follow must have a following user"],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

followSchema.index({ follower: 1, following: 1 }, { unique: true });

followSchema.pre("validate", function () {
  if (this.follower.equals(this.following)) {
    throw new Error("You cannot follow yourself");
  }
});


const Follow = mongoose.model("Follow", followSchema);

export default Follow;


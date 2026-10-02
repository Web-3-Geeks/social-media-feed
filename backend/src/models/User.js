import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: [160, "Bio cannot exceed 160 characters"],
    },
    followerCount: {
      type: Number,
      default: 0,
      min: 0
    },
    followingCount: {
      type: Number,
      default: 0,
      min: 0
    },
    postCount: {
      type: Number,
      default: 0,
      min: 0
    },
    // Private: following needs approval, and only followers see the posts.
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// The feed looks up private accounts on every request. Partial: only private
// users are in this index, so it stays tiny.
userSchema.index({ isPrivate: 1 }, { partialFilterExpression: { isPrivate: true } });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

export default User;

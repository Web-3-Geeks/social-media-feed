import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import healthRoutes from "./routes/healthRoutes.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import feedRoutes from "./routes/feedRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import followRequestRoutes from "./routes/followRequestRoutes.js";

const app = express();

// Vercel sits in front of the app, so trust its X-Forwarded-For header for req.ip
// (used by the rate limiters).
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(async (req, res, next) => {
  await connectDB();
  next();
});
// The API has no pages. Visiting its base URL explains where things are instead of a 404.
const apiInfo = (req, res) => {
  res.status(200).json({
    name: "Social Feed API",
    app: process.env.CLIENT_URL,
    health: "/api/health",
    docs: "See README.md and backend/postman-collection.json in the repo",
  });
};
app.get("/", apiInfo);
app.get("/api", apiInfo);
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/follow-requests", followRequestRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;

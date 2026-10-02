import { useState } from "react";
import { useNavigate } from "react-router";
import { getErrorMessage } from "../api/axios";
import { fullDateTime, timeAgo } from "../utils/time";
import { CheckIcon, CommentIcon, HeartIcon, UserPlusIcon } from "./Icons";
import Avatar from "./Avatar";

// One small colored badge per type, shown on the corner of the avatar.
const TYPE_BADGE = {
  LIKE: { icon: <HeartIcon filled size={10} />, className: "bg-red-500" },
  COMMENT: { icon: <CommentIcon size={10} />, className: "bg-blue-500" },
  FOLLOW: { icon: <UserPlusIcon size={10} />, className: "bg-green-500" },
  FOLLOW_REQUEST: { icon: <UserPlusIcon size={10} />, className: "bg-violet-500" },
  FOLLOW_ACCEPTED: { icon: <CheckIcon size={10} />, className: "bg-green-500" },
};

const snippet = (text = "", max = 60) =>
  text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;

function message(notification) {
  switch (notification.type) {
    case "LIKE":
      return "liked your post";
    case "COMMENT":
      return notification.comment
        ? `commented: "${snippet(notification.comment.content)}"`
        : "commented on your post";
    case "FOLLOW":
      return "started following you";
    case "FOLLOW_REQUEST":
      return "requested to follow you";
    case "FOLLOW_ACCEPTED":
      return "accepted your follow request";
    default:
      return "";
  }
}

// Notifications about a person (not a post) open that person's profile.
const PERSON_TYPES = ["FOLLOW", "FOLLOW_REQUEST", "FOLLOW_ACCEPTED"];

export default function NotificationItem({ notification, onRead, onAccept, onDecline }) {
  const navigate = useNavigate();
  const { actor, post, type, isRead, createdAt } = notification;
  // The actor's account may have been deleted, so populate can return null.
  const who = actor ?? { name: "Someone", avatar: "" };
  const badge = TYPE_BADGE[type];
  const isRequest = type === "FOLLOW_REQUEST" && actor;
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const handleClick = () => {
    if (!isRead) onRead(notification.id);
    // No single-post page yet: a like/comment opens your own profile where the post is.
    if (PERSON_TYPES.includes(type) && actor) navigate(`/users/${actor.id}`);
    else navigate(`/users/${notification.recipient}`);
  };

  const respond = async (action) => {
    setBusy(action);
    setError("");
    try {
      await (action === "accept" ? onAccept : onDecline)(notification);
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy("");
    }
  };

  return (
    <li
      className={`flex flex-col sm:flex-row sm:items-center ${isRead ? "" : "bg-blue-50/60"}`}
    >
      <button
        type="button"
        onClick={handleClick}
        className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3 text-left transition hover:bg-gray-50/80 focus:outline-none focus-visible:bg-gray-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-200"
      >
        <div className="relative shrink-0">
          <Avatar user={who} size={40} />
          {badge && (
            <span
              className={`absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full text-white ring-2 ring-white ${badge.className}`}
            >
              {badge.icon}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="break-words text-sm text-gray-700">
            <span className="font-semibold text-gray-900">{who.name}</span>{" "}
            {message(notification)}
          </p>
          {post?.content && (
            <p className="mt-0.5 truncate text-sm text-gray-500">
              {snippet(post.content, 80)}
            </p>
          )}
          <time
            dateTime={createdAt}
            title={fullDateTime(createdAt)}
            className="mt-1 block text-xs text-gray-400"
          >
            {timeAgo(createdAt)}
          </time>
        </div>

        {post?.imageUrl && (
          <img
            src={post.imageUrl}
            alt=""
            className="h-12 w-12 shrink-0 rounded-md object-cover"
          />
        )}

        {!isRead && (
          <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500">
            <span className="sr-only">Unread</span>
          </span>
        )}
      </button>

      {/* Outside the row's button: a button inside a button isn't valid HTML. */}
      {isRequest && (
        <div className="flex flex-col items-start gap-1 px-4 pb-3 pl-17 sm:items-end sm:py-3 sm:pl-0">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => respond("accept")}
              disabled={Boolean(busy)}
              aria-label={`Confirm follow request from ${who.name}`}
              className="rounded-lg bg-blue-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-wait disabled:opacity-60"
            >
              {busy === "accept" ? "Confirming..." : "Confirm"}
            </button>
            <button
              type="button"
              onClick={() => respond("decline")}
              disabled={Boolean(busy)}
              aria-label={`Delete follow request from ${who.name}`}
              className="rounded-lg bg-gray-100 px-4 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:cursor-wait disabled:opacity-60"
            >
              {busy === "decline" ? "Deleting..." : "Delete"}
            </button>
          </div>
          {error && (
            <p role="alert" className="text-xs text-red-600">
              {error}
            </p>
          )}
        </div>
      )}
    </li>
  );
}

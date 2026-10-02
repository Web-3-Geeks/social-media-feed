import { useState } from "react";
import { CommentIcon, HeartIcon } from "./Icons";

// Soft backgrounds for text-only posts. The same post always gets the same color.
const TEXT_TILE_COLORS = [
  "from-sky-100 to-indigo-100 text-indigo-900",
  "from-rose-100 to-orange-100 text-rose-900",
  "from-emerald-100 to-teal-100 text-teal-900",
  "from-amber-100 to-yellow-100 text-amber-900",
  "from-violet-100 to-fuchsia-100 text-violet-900",
];

const colorFor = (id) =>
  TEXT_TILE_COLORS[[...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TEXT_TILE_COLORS.length];

// One square in the profile grid: the photo if the post has one, otherwise the
// start of its text. Likes and comments show on hover, like Instagram.
export default function PostGridTile({ post, onOpen }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = post.imageUrl && !imageFailed;
  const snippet = post.content.length > 60 ? `${post.content.slice(0, 60)}...` : post.content;

  return (
    <button
      id={`tile-${post.id}`}
      type="button"
      onClick={() => onOpen(post.id)}
      aria-label={`Open post: ${snippet}. ${post.likeCount} likes, ${post.commentCount} comments`}
      className="group relative block aspect-square w-full overflow-hidden rounded-lg bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
    >
      {showImage ? (
        <img
          src={post.imageUrl}
          alt=""
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className={`flex h-full w-full items-center bg-linear-to-br p-2 sm:p-4 ${colorFor(post.id)}`}>
          <p className="line-clamp-4 whitespace-pre-line break-words text-left text-[11px] font-medium leading-snug transition group-hover:opacity-0 group-focus-visible:opacity-0 sm:text-sm">
            {post.content}
          </p>
        </div>
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center gap-3 bg-black/60 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100 sm:gap-5"
      >
        <span className="flex items-center gap-1 tabular-nums">
          <HeartIcon filled size={16} />
          {post.likeCount}
        </span>
        <span className="flex items-center gap-1 tabular-nums">
          <CommentIcon size={16} />
          {post.commentCount}
        </span>
      </div>
    </button>
  );
}

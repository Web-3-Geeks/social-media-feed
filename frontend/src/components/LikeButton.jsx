import { useLike } from "../hooks/useLike";
import { HeartIcon } from "./Icons";

export default function LikeButton({ post, onChange }) {
  const { liked, count, pending, error, toggle } = useLike(post, onChange);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={liked}
        aria-busy={pending}
        aria-label={`${liked ? "Unlike" : "Like"} post. ${count} ${count === 1 ? "like" : "likes"}`}
        className={`group inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 ${
          liked ? "text-rose-600 hover:bg-rose-50" : "text-gray-500 hover:bg-gray-100 hover:text-rose-600"
        }`}
      >
        <span className={`transition-transform ${liked ? "scale-110" : "group-active:scale-90"}`}>
          <HeartIcon filled={liked} />
        </span>
        <span className={`tabular-nums ${pending ? "opacity-70" : ""}`}>{count}</span>
      </button>
      {error && (
        <span role="alert" className="text-xs text-red-600">
          Couldn&apos;t update like. Try again.
        </span>
      )}
    </div>
  );
}

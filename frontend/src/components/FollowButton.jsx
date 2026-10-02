import { useFollow } from "../hooks/useFollow";

const LABELS = {
  none: { idle: "Follow", hover: "Follow", action: "Follow" },
  requested: { idle: "Requested", hover: "Cancel", action: "Cancel follow request to" },
  following: { idle: "Following", hover: "Unfollow", action: "Unfollow" },
};

export default function FollowButton({
  userId,
  initialFollowing,
  initialRequested = false,
  isPrivate = false,
  name,
}) {
  const { status, pending, error, toggle } = useFollow(userId, {
    initialFollowing,
    initialRequested,
    isPrivate,
  });
  const label = LABELS[status];
  const active = status !== "none";

  const handleClick = () => {
    // Leaving a private account can't be undone with one click: you'd have to
    // send a new request and wait again, so ask first.
    if (
      status === "following" &&
      isPrivate &&
      !window.confirm(`Unfollow ${name || "this account"}? You'll have to request again to see their posts.`)
    ) {
      return;
    }
    toggle();
  };

  return (
    <div className="flex shrink-0 flex-col items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-pressed={active}
        aria-label={name ? `${label.action} ${name}` : undefined}
        className={`group min-w-24 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 disabled:cursor-wait disabled:opacity-70 ${
          active
            ? "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-red-50 hover:text-red-600 hover:ring-red-200 focus-visible:ring-red-200"
            : "bg-blue-500 text-white hover:bg-blue-600 focus-visible:ring-blue-300"
        }`}
      >
        {active ? (
          <>
            <span className="group-hover:hidden">{label.idle}</span>
            <span className="hidden group-hover:inline">{label.hover}</span>
          </>
        ) : (
          label.idle
        )}
      </button>
      {error && (
        <p role="alert" className="mt-1 max-w-48 text-right text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

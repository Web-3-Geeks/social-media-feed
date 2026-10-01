import { useFollow } from "../hooks/useFollow";

export default function FollowButton({ userId, initialFollowing, name }) {
  const { following, pending, error, toggle } = useFollow(userId, initialFollowing);

  return (
    <div className="flex shrink-0 flex-col items-end">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={following}
        aria-label={name ? `${following ? "Unfollow" : "Follow"} ${name}` : undefined}
        className={`group min-w-24 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 disabled:cursor-wait disabled:opacity-70 ${
          following
            ? "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-red-50 hover:text-red-600 hover:ring-red-200 focus-visible:ring-red-200"
            : "bg-blue-500 text-white hover:bg-blue-600 focus-visible:ring-blue-300"
        }`}
      >
        {following ? (
          <>
            <span className="group-hover:hidden">Following</span>
            <span className="hidden group-hover:inline">Unfollow</span>
          </>
        ) : (
          "Follow"
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

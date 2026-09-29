import { Link } from "react-router";
import Avatar from "../components/Avatar";
import PostCard from "../components/PostCard";
import { useAuth } from "../hooks/useAuth";
import { useFeed } from "../hooks/useFeed";
import CreatePost from "../components/CreatePost";

export default function Dashboard() {
  const { user } = useAuth();
  const {
    posts,
    hasMore,
    loading,
    error,
    retry,
    loadingMore,
    loadMoreError,
    loadMore,
    addPost,
    replacePost,
    removePost,
  } = useFeed();
  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-sky-500 to-indigo-600 p-6 text-white shadow-md">
        <div
          aria-hidden="true"
          className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-16 right-24 h-32 w-32 rounded-full bg-white/10"
        />

        <div className="relative flex items-center gap-4">
          <div className="shrink-0 rounded-full ring-2 ring-white/70">
            <Avatar user={user} size={52} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-xl font-bold">
              Welcome, {firstName}!
            </h1>
            <p className="text-sm text-white/80">
              See what everyone is sharing today.
            </p>
          </div>
          <Link
            to="/profile"
            className="hidden shrink-0 rounded-xl bg-white/15 px-3.5 py-2 text-sm font-medium text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:inline-flex"
          >
            View profile
          </Link>
        </div>
      </section>
      <CreatePost onCreated={addPost} />
      <section aria-labelledby="feed-heading" className="space-y-4">
        <h2
          id="feed-heading"
          className="px-1 text-sm font-semibold uppercase tracking-wide text-gray-500"
        >
          Latest posts
        </h2>

        {loading ? (
          <FeedSkeleton />
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
          >
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200 transition hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            >
              Try again
            </button>
          </div>
        ) : posts.length === 0 && !hasMore ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="font-medium text-gray-900">No posts yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Be the first to share something.
            </p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isOwn={post.author.id === user.id}
                onUpdated={replacePost}
                onDeleted={removePost}
              />
            ))}

            {loadMoreError && (
              <p role="alert" className="text-center text-sm text-red-600">
                {loadMoreError}
              </p>
            )}

            {hasMore ? (
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:cursor-wait disabled:opacity-70"
              >
                {loadingMore && (
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"
                  />
                )}
                {loadingMore ? "Loading..." : loadMoreError ? "Try again" : "Load more"}
              </button>
            ) : (
              <p className="py-2 text-center text-sm text-gray-400">
                You&apos;re all caught up. No more posts.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div role="status" aria-label="Loading posts" className="space-y-4">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="h-3 w-20 rounded bg-gray-100" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full rounded bg-gray-100" />
            <div className="h-4 w-3/4 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

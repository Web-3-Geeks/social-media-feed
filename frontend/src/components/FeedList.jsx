import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useFeed } from "../hooks/useFeed";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import PostGridTile from "./PostGridTile";

// A list of posts from any cursor-paginated endpoint (/posts, /posts/feed,
// /users/:id/posts) with loading, error, empty and "load more" states.
// view="grid" shows square tiles instead of full cards. Both views use the same
// posts, so a like or delete in the list is already there when you go back.
export default function FeedList({
  endpoint,
  emptyTitle,
  emptyMessage,
  showCreate = false,
  onPostCreated,
  onPostDeleted,
  view = "list",
  scrollToId,
  onOpenPost,
}) {
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
    patchPost,
  } = useFeed(endpoint);

  // After switching views, jump to the post that was opened: its card in the
  // list, or its tile when going back to the grid.
  useEffect(() => {
    if (!scrollToId) return;
    const target = document.getElementById(`${view === "grid" ? "tile" : "post"}-${scrollToId}`);
    target?.scrollIntoView({ block: view === "grid" ? "center" : "start" });
  }, [view, scrollToId]);

  const handleCreated = (post) => {
    addPost(post);
    onPostCreated?.(post);
  };

  const handleDeleted = (id) => {
    removePost(id);
    onPostDeleted?.(id);
  };

  return (
    <>
      {showCreate && <CreatePost onCreated={handleCreated} />}

      {loading ? (
        view === "grid" ? <GridSkeleton /> : <FeedSkeleton />
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
          <p className="font-medium text-gray-900">{emptyTitle}</p>
          <p className="mt-1 text-sm text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <>
          {view === "grid" ? (
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {posts.map((post) => (
                <PostGridTile key={post.id} post={post} onOpen={onOpenPost} />
              ))}
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isOwn={post.author.id === user.id}
                onUpdated={replacePost}
                onDeleted={handleDeleted}
                onPatch={patchPost}
              />
            ))
          )}

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
    </>
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

function GridSkeleton() {
  return (
    <div role="status" aria-label="Loading posts" className="grid animate-pulse grid-cols-3 gap-1 sm:gap-2">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div key={n} className="aspect-square rounded-lg bg-gray-200" />
      ))}
    </div>
  );
}

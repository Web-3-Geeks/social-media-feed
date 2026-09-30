import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { COMMENT_MAX_LENGTH, validateComment } from "../utils/validation";
import Avatar from "./Avatar";
import CommentItem from "./CommentItem";

const PAGE_SIZE = 10;

// Mounted only when the user opens a post's comments, so comments are fetched on demand.
// Comments are newest first. The draft lives in the parent (PostCard) so closing and
// reopening the section keeps what the user was typing.
export default function CommentsSection({ postId, onCountChange, draft, onDraftChange, onClose }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let ignore = false;
    api
      .get(`/posts/${postId}/comments`, { params: { limit: PAGE_SIZE } })
      .then((res) => {
        if (ignore) return;
        setComments(res.data.comments);
        setHasMore(res.data.pagination.hasMore);
      })
      .catch((err) => {
        if (!ignore) setLoadError(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [postId, reloadKey]);

  const retry = () => {
    setLoading(true);
    setLoadError("");
    setReloadKey((key) => key + 1);
  };

  const loadMore = async () => {
    const last = comments[comments.length - 1];
    if (!last) return;
    setLoadingMore(true);
    setLoadError("");
    try {
      const res = await api.get(`/posts/${postId}/comments`, {
        params: { limit: PAGE_SIZE, before: last.createdAt, beforeId: last.id },
      });
      setComments((prev) => {
        const seen = new Set(prev.map((c) => c.id));
        return [...prev, ...res.data.comments.filter((c) => !seen.has(c.id))];
      });
      setHasMore(res.data.pagination.hasMore);
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateComment(draft);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await api.post(`/posts/${postId}/comments`, { content: draft.trim() });
      const created = res.data.comment;
      setComments((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
      onDraftChange("");
      onCountChange(1);
    } catch (err) {
      setSubmitError(err.response?.data?.errors?.content || getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdated = (updated) => {
    setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleted = (id) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    onCountChange(-1);
  };

  const inputId = `new-comment-${postId}`;

  return (
    <section
      aria-label="Comments"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      className="mt-3 border-t border-gray-100 pt-3"
    >
      <form onSubmit={handleSubmit} noValidate className="mb-3 flex items-start gap-2.5">
        <Avatar user={user} size={32} />
        <div className="min-w-0 flex-1">
          <label htmlFor={inputId} className="sr-only">
            Write a comment
          </label>
          <textarea
            id={inputId}
            rows={1}
            value={draft}
            onChange={(e) => {
              onDraftChange(e.target.value);
              if (submitError) setSubmitError("");
            }}
            placeholder="Write a comment..."
            aria-invalid={submitError ? "true" : "false"}
            aria-describedby={submitError ? `${inputId}-error` : undefined}
            className={`w-full resize-none rounded-2xl border bg-white px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:ring-2 ${
              submitError
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
            }`}
          />
          <div className="mt-1 flex items-center justify-between gap-2">
            <span
              className={`text-xs tabular-nums ${
                draft.length > COMMENT_MAX_LENGTH ? "font-semibold text-red-600" : "text-gray-400"
              }`}
            >
              {draft.length}/{COMMENT_MAX_LENGTH}
            </span>
            <button
              type="submit"
              disabled={submitting || draft.length > COMMENT_MAX_LENGTH}
              className="rounded-lg bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Posting..." : "Comment"}
            </button>
          </div>
          {submitError && (
            <p id={`${inputId}-error`} role="alert" className="mt-1 text-xs text-red-600">
              {submitError}
            </p>
          )}
        </div>
      </form>

      {loading ? (
        <div role="status" aria-label="Loading comments" className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="flex animate-pulse gap-2.5">
              <div className="h-8 w-8 rounded-full bg-gray-200" />
              <div className="h-12 flex-1 rounded-2xl bg-gray-100" />
            </div>
          ))}
        </div>
      ) : loadError && comments.length === 0 ? (
        <div role="alert" className="flex items-center justify-between gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={retry}
            className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-xs font-medium ring-1 ring-red-200 hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {comments.length === 0 ? (
            <p className="py-1 text-center text-sm text-gray-500">No comments yet. Start the conversation.</p>
          ) : (
            <ul className="space-y-3">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  isOwn={comment.author.id === user.id}
                  onUpdated={handleUpdated}
                  onDeleted={handleDeleted}
                />
              ))}
            </ul>
          )}

          {loadError && comments.length > 0 && (
            <p role="alert" className="mt-2 text-center text-xs text-red-600">
              {loadError}
            </p>
          )}

          {hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="mt-2 w-full rounded-lg py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:opacity-60"
            >
              {loadingMore ? "Loading..." : "View more comments"}
            </button>
          )}
        </>
      )}


      <button
        type="button"
        onClick={onClose}
        className="mt-2 w-full rounded-lg py-1.5 text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
      >
        Hide comments
      </button>
    </section>
  );
}

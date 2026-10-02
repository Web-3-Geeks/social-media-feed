import { useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import { fullDateTime, timeAgo } from "../utils/time";
import { COMMENT_MAX_LENGTH, validateComment } from "../utils/validation";
import Avatar from "./Avatar";

export default function CommentItem({ comment, isOwn, onUpdated, onDeleted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const wasEdited = comment.updatedAt !== comment.createdAt;

  const startEditing = () => {
    setDraft(comment.content);
    setError("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const validationError = validateComment(draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await api.patch(`/comments/${comment.id}`, { content: draft.trim() });
      onUpdated(res.data.comment);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.errors?.content || getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await api.delete(`/comments/${comment.id}`);
      onDeleted(comment.id);
    } catch (err) {
      // Already gone (e.g. deleted in another tab): remove it anyway.
      if (err.response?.status === 404) {
        onDeleted(comment.id);
        return;
      }
      setError(getErrorMessage(err));
      setDeleting(false);
    }
  };

  return (
    <li className="flex gap-2.5">
      <Avatar user={comment.author} size={32} />
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl bg-gray-50 px-3.5 py-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="truncate text-sm font-semibold text-gray-900">{comment.author.name}</span>
              <span className="ml-2 text-xs text-gray-500">
                <time dateTime={comment.createdAt} title={fullDateTime(comment.createdAt)}>
                  {timeAgo(comment.createdAt)}
                </time>
                {wasEdited && <span title={`Edited ${fullDateTime(comment.updatedAt)}`}> · Edited</span>}
              </span>
            </div>
            {isOwn && !isEditing && !confirmingDelete && (
              <div className="flex shrink-0 gap-0.5">
                <button
                  type="button"
                  onClick={startEditing}
                  className="rounded-md px-1.5 py-0.5 text-xs font-medium text-gray-500 transition hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="rounded-md px-1.5 py-0.5 text-xs font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <form
              onSubmit={handleSave}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  if (!saving) cancelEditing();
                }
              }}
              noValidate
              className="mt-2 space-y-2"
            >
              <label htmlFor={`edit-comment-${comment.id}`} className="sr-only">
                Edit comment
              </label>
              <textarea
                id={`edit-comment-${comment.id}`}
                rows={2}
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs tabular-nums ${
                    draft.length > COMMENT_MAX_LENGTH ? "font-semibold text-red-600" : "text-gray-400"
                  }`}
                >
                  {draft.length}/{COMMENT_MAX_LENGTH}
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={saving}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || draft.length > COMMENT_MAX_LENGTH}
                    className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <p className="mt-0.5 whitespace-pre-line break-words text-sm text-gray-800">{comment.content}</p>
          )}
        </div>

        {confirmingDelete && (
          <div
            role="alertdialog"
            aria-labelledby={`delete-comment-${comment.id}`}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                if (!deleting) setConfirmingDelete(false);
              }
            }}
            className="mt-1.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2"
          >
            <p id={`delete-comment-${comment.id}`} className="text-xs font-medium text-red-800">
              Delete this comment?
            </p>
            <div className="flex gap-1.5">
              <button
                type="button"
                autoFocus
                onClick={() => {
                  setConfirmingDelete(false);
                  setError("");
                }}
                disabled={deleting}
                className="rounded-lg bg-white px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-1 px-1 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    </li>
  );
}

import { useState } from "react";
import { fullDateTime, timeAgo } from "../utils/time";
import Avatar from "./Avatar";
import api, { getErrorMessage } from "../api/axios";
import { POST_MAX_LENGTH, validatePost } from "../utils/validation";

export default function PostCard({ post, isOwn, onUpdated, onDeleted }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState("");
  const [draftImage, setDraftImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const wasEdited = post.updatedAt !== post.createdAt;

  const startEditing = () => {
    setDraftContent(post.content);
    setDraftImage(post.imageUrl);
    setEditError("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const errors = validatePost({
      content: draftContent,
      imageUrl: draftImage,
    });
    if (Object.keys(errors).length > 0) {
      setEditError(Object.values(errors)[0]);
      return;
    }

    setSaving(true);
    setEditError("");
    try {
      const res = await api.patch(`/posts/${post.id}`, {
        content: draftContent.trim(),
        imageUrl: draftImage.trim(),
      });
      onUpdated(res.data.post);
      setImageFailed(false);
      setImageLoaded(false);
      setIsEditing(false);
    } catch (error) {
      const fieldErrors = error.response?.data?.errors;
      setEditError(
        fieldErrors ? Object.values(fieldErrors)[0] : getErrorMessage(error),
      );
    } finally {
      setSaving(false);
    }
  };

  const cancelDelete = () => {
    setConfirmingDelete(false);
    setDeleteError("");
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/posts/${post.id}`);
      onDeleted(post.id);
    } catch (error) {
      // Already gone (e.g. deleted in another tab): remove it from the feed anyway.
      if (error.response?.status === 404) {
        onDeleted(post.id);
        return;
      }
      setDeleteError(getErrorMessage(error));
      setDeleting(false);
    }
  };

  return (
    <article
      className={`rounded-2xl border bg-white p-5 transition hover:shadow-md ${
        isOwn
          ? "border-blue-200 bg-linear-to-b from-blue-50/60 to-white"
          : "border-gray-200"
      }`}
    >
      <header className="flex items-center gap-3">
        <Avatar user={post.author} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold text-gray-900">
              {post.author.name}
            </span>
            {isOwn && (
              <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                You
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            <time
              dateTime={post.createdAt}
              title={fullDateTime(post.createdAt)}
            >
              {timeAgo(post.createdAt)}
            </time>
            {wasEdited && (
              <span title={`Edited ${fullDateTime(post.updatedAt)}`}>
                {" "}
                · Edited
              </span>
            )}
          </p>
        </div>
        {isOwn && !isEditing && !confirmingDelete && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={startEditing}
              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
            >
              Delete
            </button>
          </div>
        )}
      </header>

      {confirmingDelete && (
        <div
          role="alertdialog"
          aria-labelledby={`delete-title-${post.id}`}
          onKeyDown={(e) => {
            if (e.key === "Escape" && !deleting) cancelDelete();
          }}
          className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <p id={`delete-title-${post.id}`} className="text-sm font-medium text-red-800">
            Delete this post? This can&apos;t be undone.
          </p>
          {deleteError && (
            <p role="alert" className="mt-1 text-sm text-red-700">
              {deleteError}
            </p>
          )}
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              autoFocus
              onClick={cancelDelete}
              disabled={deleting}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}

      {isEditing ? (
        <form
          onSubmit={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Escape" && !saving) cancelEditing();
          }}
          noValidate
          className="mt-3 space-y-3"
        >
          {editError && (
            <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2 text-sm text-red-700">
              {editError}
            </p>
          )}

          <div>
            <label htmlFor={`edit-content-${post.id}`} className="sr-only">
              Post content
            </label>
            <textarea
              id={`edit-content-${post.id}`}
              rows={3}
              autoFocus
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[15px] text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <p
              className={`mt-1 text-right text-xs tabular-nums ${
                draftContent.length > POST_MAX_LENGTH
                  ? "font-semibold text-red-600"
                  : "text-gray-400"
              }`}
            >
              {draftContent.length}/{POST_MAX_LENGTH}
            </p>
          </div>

          <div>
            <label
              htmlFor={`edit-image-${post.id}`}
              className="block text-xs font-medium text-gray-500"
            >
              Image URL <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id={`edit-image-${post.id}`}
              type="url"
              value={draftImage}
              onChange={(e) => setDraftImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={cancelEditing}
              disabled={saving}
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || draftContent.length > POST_MAX_LENGTH}
              className="rounded-xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="mt-3 whitespace-pre-line break-words text-[15px] leading-relaxed text-gray-800">
            {post.content}
          </p>

          {post.imageUrl && !imageFailed && (
            <img
              src={post.imageUrl}
              alt={`Image shared by ${post.author.name}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageFailed(true)}
              className={`mt-3 max-h-[28rem] w-full rounded-xl border border-gray-100 object-cover ${
                imageLoaded ? "" : "h-64 animate-pulse bg-gray-100"
              }`}
            />
          )}
        </>
      )}
    </article>
  );
}

import { useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { POST_MAX_LENGTH, validatePost } from "../utils/validation";
import Avatar from "./Avatar";

export default function CreatePost({ onCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const firstName = user.name.split(" ")[0];
  const length = content.length;
  const isOverLimit = length > POST_MAX_LENGTH;
  const isNearLimit = !isOverLimit && length > POST_MAX_LENGTH - 50;

  const handleCancel = () => {
    setIsOpen(false);
    setContent("");
    setImageUrl("");
    setErrors({});
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validatePost({ content, imageUrl });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/posts", {
        content: content.trim(),
        imageUrl: imageUrl.trim(),
      });
      onCreated(res.data.post);
      setContent("");
      setImageUrl("");
      setErrors({});
      setIsOpen(false);
    } catch (error) {
      const fieldErrors = error.response?.data?.errors;
      if (fieldErrors) {
        setErrors(fieldErrors);
      } else {
        setServerError(getErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <Avatar user={user} size={40} />
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex-1 truncate rounded-full bg-gray-100 px-4 py-2.5 text-left text-[15px] text-gray-500 transition hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          What&apos;s on your mind, {firstName}?
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !submitting) handleCancel();
      }}
      noValidate
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      {serverError && (
        <div role="alert" className="mb-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="flex gap-3">
        <Avatar user={user} size={40} />
        <div className="min-w-0 flex-1">
          <label htmlFor="post-content" className="sr-only">
            What&apos;s on your mind?
          </label>
          <textarea
            id="post-content"
            rows={3}
            autoFocus
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }));
            }}
            placeholder={`What's on your mind, ${firstName}?`}
            aria-invalid={errors.content ? "true" : "false"}
            aria-describedby={`post-content-count${errors.content ? " post-content-error" : ""}`}
            className={`w-full resize-none rounded-xl border px-3.5 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none transition focus:ring-2 ${
              errors.content
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
            }`}
          />
          {errors.content && (
            <p id="post-content-error" className="mt-1 text-sm text-red-600">
              {errors.content}
            </p>
          )}

          <label htmlFor="post-image" className="mt-3 block text-xs font-medium text-gray-500">
            Image URL <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            id="post-image"
            type="url"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              if (errors.imageUrl) setErrors((prev) => ({ ...prev, imageUrl: undefined }));
            }}
            placeholder="https://example.com/image.jpg"
            aria-invalid={errors.imageUrl ? "true" : "false"}
            aria-describedby={errors.imageUrl ? "post-image-error" : undefined}
            className={`mt-1 w-full rounded-xl border px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:ring-2 ${
              errors.imageUrl
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
            }`}
          />
          {errors.imageUrl && (
            <p id="post-image-error" className="mt-1 text-sm text-red-600">
              {errors.imageUrl}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between gap-3">
            <span
              id="post-content-count"
              className={`text-xs tabular-nums ${
                isOverLimit ? "font-semibold text-red-600" : isNearLimit ? "text-amber-600" : "text-gray-400"
              }`}
            >
              {length}/{POST_MAX_LENGTH}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || isOverLimit}
                className="rounded-xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

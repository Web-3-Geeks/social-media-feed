import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import Avatar from "../components/Avatar";

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    api
      .get("/users/me")
      .then((res) => {
        if (!ignore) setProfile(res.data.user);
      })
      .catch((err) => {
        if (!ignore) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  };

  if (loading) {
    return (
      <div
        className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        role="status"
        aria-label="Loading profile"
      >
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 rounded bg-gray-200" />
            <div className="h-4 w-56 rounded bg-gray-100" />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-4 w-full rounded bg-gray-100" />
          <div className="h-4 w-2/3 rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={handleRetry}
          className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200 transition hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <Avatar user={profile} size={80} />
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold text-gray-900">{profile.name}</h1>
          <p className="break-all text-sm text-gray-500">{profile.email}</p>
        </div>
      </div>

      <dl className="mt-6 space-y-4 border-t border-gray-100 pt-6">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Bio</dt>
          <dd className="mt-1 whitespace-pre-line break-words text-sm text-gray-700">
            {profile.bio || <span className="italic text-gray-400">No bio yet.</span>}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Joined</dt>
          <dd className="mt-1 text-sm text-gray-700">
            <time dateTime={profile.createdAt}>{formatDate(profile.createdAt)}</time>
          </dd>
        </div>
      </dl>
    </section>
  );
}

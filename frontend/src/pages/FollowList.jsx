import { useEffect, useState } from "react";
import { Link, NavLink, useParams } from "react-router";
import api, { getErrorMessage } from "../api/axios";
import UserListSkeleton from "../components/UserListSkeleton";
import UserRow from "../components/UserRow";

const tabClass = ({ isActive }) =>
  `flex-1 rounded-lg py-2 text-center text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 ${
    isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
  }`;

// Keyed by type + id, so switching tabs or users starts with fresh state.
export default function FollowList({ type }) {
  const { id } = useParams();
  return <FollowListView key={`${type}-${id}`} type={type} userId={id} />;
}

function FollowListView({ type, userId }) {
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");

  useEffect(() => {
    let ignore = false;

    Promise.all([api.get(`/users/${userId}`), api.get(`/users/${userId}/${type}`)])
      .then(([profileRes, listRes]) => {
        if (ignore) return;
        setName(profileRes.data.user.name);
        setUsers(listRes.data.users);
        setHasMore(listRes.data.hasMore);
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
  }, [userId, type, reloadKey]);

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  };

  const loadMore = async () => {
    const last = users[users.length - 1];
    setLoadingMore(true);
    setLoadMoreError("");
    try {
      const res = await api.get(`/users/${userId}/${type}`, {
        params: { before: last.followedAt, beforeId: last.followId },
      });
      setUsers((prev) => {
        const seen = new Set(prev.map((u) => u.id));
        return [...prev, ...res.data.users.filter((u) => !seen.has(u.id))];
      });
      setHasMore(res.data.hasMore);
    } catch (err) {
      setLoadMoreError(getErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={`/users/${userId}`}
          className="text-sm font-medium text-blue-600 hover:underline focus:outline-none focus-visible:underline"
        >
          &larr; Back to profile
        </Link>
        <h1 className="mt-2 break-words text-2xl font-bold text-gray-900">
          {name || (loading ? "Loading..." : "Profile")}
        </h1>
      </div>

      <nav aria-label="Connections" className="flex gap-1 rounded-xl bg-gray-100 p-1">
        <NavLink to={`/users/${userId}/followers`} className={tabClass}>
          Followers
        </NavLink>
        <NavLink to={`/users/${userId}/following`} className={tabClass}>
          Following
        </NavLink>
      </nav>

      {loading ? (
        <UserListSkeleton />
      ) : error ? (
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
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="font-medium text-gray-900">
            {type === "followers" ? "No followers yet" : "Not following anyone yet"}
          </p>
          <Link
            to="/search"
            className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
          >
            Find people to follow
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <ul className="space-y-3">
            {users.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </ul>

          {loadMoreError && (
            <p role="alert" className="text-center text-sm text-red-600">
              {loadMoreError}
            </p>
          )}

          {hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:cursor-wait disabled:opacity-70"
            >
              {loadingMore ? "Loading..." : loadMoreError ? "Try again" : "Load more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router";
import api, { getErrorMessage } from "../api/axios";
import NotificationItem from "../components/NotificationItem";
import UserListSkeleton from "../components/UserListSkeleton";
import { emitUnreadCount } from "../utils/notificationEvents";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [actionError, setActionError] = useState("");

  // Keeps the page count and the navbar badge in sync.
  const updateUnread = (count) => {
    setUnreadCount(count);
    emitUnreadCount(count);
  };

  useEffect(() => {
    let ignore = false;

    api
      .get("/notifications")
      .then((res) => {
        if (ignore) return;
        setNotifications(res.data.notifications);
        setHasMore(res.data.pagination.hasMore);
        updateUnread(res.data.unreadCount);
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

  const loadMore = async () => {
    const last = notifications[notifications.length - 1];
    setLoadingMore(true);
    setLoadMoreError("");
    try {
      const res = await api.get("/notifications", {
        params: { before: last.createdAt, beforeId: last.id },
      });
      setNotifications((prev) => {
        const seen = new Set(prev.map((n) => n.id));
        return [...prev, ...res.data.notifications.filter((n) => !seen.has(n.id))];
      });
      setHasMore(res.data.pagination.hasMore);
      updateUnread(res.data.unreadCount);
    } catch (err) {
      setLoadMoreError(getErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  };

  // Optimistic: show it as read right away; the item navigates away anyway.
  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      emitUnreadCount(res.data.unreadCount);
    } catch {
      // Not worth an error here: the user has already moved to another page.
    }
  };

  // Accepted: the row turns into "started following you". Errors are shown
  // by the row itself, so they're thrown on to it.
  const acceptRequest = async (notification) => {
    const res = await api.post(`/follow-requests/${notification.actor.id}/accept`);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, type: "FOLLOW", isRead: true } : n)),
    );
    updateUnread(res.data.unreadCount);
  };

  // Declined: the request and its notification are gone.
  const declineRequest = async (notification) => {
    const res = await api.delete(`/follow-requests/${notification.actor.id}`);
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    updateUnread(res.data.unreadCount);
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    setActionError("");
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      updateUnread(0);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {!loading && !error && (
            <p className="mt-1 text-sm text-gray-500">
              {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={markingAll}
            className="rounded-xl px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:opacity-60"
          >
            {markingAll ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      {actionError && (
        <p role="alert" className="text-sm text-red-600">
          {actionError}
        </p>
      )}

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
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="font-medium text-gray-900">No notifications yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Likes, comments and new followers will show up here.
          </p>
          <Link
            to="/search"
            className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
          >
            Find people to follow
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
                onAccept={acceptRequest}
                onDecline={declineRequest}
              />
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

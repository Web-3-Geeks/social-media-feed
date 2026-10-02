import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router";
import api from "../api/axios";
import { onUnreadCountChange } from "../utils/notificationEvents";

const POLL_MS = 60_000;

// The unread count for the navbar badge. Refreshes on every page change, every
// minute while the tab is visible, and when you come back to the tab.
export function useUnreadCount() {
  const [count, setCount] = useState(0);
  const { pathname } = useLocation();

  const refresh = useCallback(() => {
    api
      .get("/notifications/unread-count")
      .then((res) => setCount(res.data.unreadCount))
      .catch(() => {}); // The badge is extra. If a check fails, keep the last count.
  }, []);

  useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const timer = setInterval(refreshIfVisible, POLL_MS);
    document.addEventListener("visibilitychange", refreshIfVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [refresh]);

  useEffect(() => onUnreadCountChange(setCount), []);

  return count;
}

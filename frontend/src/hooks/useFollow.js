import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import { emitFollowChange, onFollowChange } from "../utils/followEvents";

// Optimistic follow/unfollow. The button flips instantly and goes back if the
// request fails. It stays disabled while a request is in flight, so double
// clicks can't send conflicting requests.
export function useFollow(userId, initialFollowing) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    () =>
      onFollowChange((change) => {
        if (change.userId === userId) setFollowing(change.following);
      }),
    [userId]
  );

  const toggle = async () => {
    const next = !following;
    setFollowing(next);
    setPending(true);
    setError("");
    try {
      const url = `/users/${userId}/follow`;
      const res = next ? await api.post(url) : await api.delete(url);
      emitFollowChange({
        userId,
        following: res.data.following,
        followerCount: res.data.followerCount,
      });
    } catch (err) {
      setFollowing(!next);
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return { following, pending, error, toggle };
}

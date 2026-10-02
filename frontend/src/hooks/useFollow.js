import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import { emitFollowChange, onFollowChange } from "../utils/followEvents";

// "none" -> Follow, "requested" -> waiting for a private account to accept,
// "following" -> Following.
const toStatus = ({ following, requested }) =>
  following ? "following" : requested ? "requested" : "none";

// Optimistic follow/unfollow. The button flips instantly and goes back if the
// request fails. It stays disabled while a request is in flight, so double
// clicks can't send conflicting requests.
export function useFollow(userId, { initialFollowing, initialRequested = false, isPrivate = false }) {
  const [status, setStatus] = useState(
    toStatus({ following: initialFollowing, requested: initialRequested })
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    () =>
      onFollowChange((change) => {
        if (change.userId === userId) setStatus(toStatus(change));
      }),
    [userId]
  );

  // Follow when not following; otherwise unfollow, or cancel the request.
  const toggle = async () => {
    const previous = status;
    const adding = previous === "none";
    setStatus(adding ? (isPrivate ? "requested" : "following") : "none");
    setPending(true);
    setError("");
    try {
      const url = `/users/${userId}/follow`;
      const res = adding ? await api.post(url) : await api.delete(url);
      emitFollowChange({
        userId,
        following: res.data.following,
        requested: res.data.requested,
        followerCount: res.data.followerCount,
        // How much "my following count" changed. A request changes nothing.
        followingDelta: (res.data.following ? 1 : 0) - (previous === "following" ? 1 : 0),
      });
    } catch (err) {
      setStatus(previous);
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return { status, pending, error, toggle };
}

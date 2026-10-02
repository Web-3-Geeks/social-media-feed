import { useRef, useState } from "react";
import api, { getErrorMessage } from "../api/axios";

// Optimistic like/unlike for one post.
// - The button and count change instantly.
// - Requests are sent one at a time; rapid clicks only update the *desired* state,
//   and when a request finishes we send one more only if the user changed their mind.
//   So fast clicking can't create duplicate likes or drift the count.
// - If a request fails, the UI goes back to the last state the server confirmed.
export function useLike(post, onChange) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [count, setCount] = useState(post.likeCount);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const confirmed = useRef({ liked: post.likedByMe, count: post.likeCount });
  const desired = useRef(post.likedByMe);
  const inFlight = useRef(false);

  const show = (wantLiked) => {
    const base = confirmed.current;
    const diff = wantLiked === base.liked ? 0 : wantLiked ? 1 : -1;
    setLiked(wantLiked);
    setCount(Math.max(0, base.count + diff));
  };

  const sync = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    try {
      while (desired.current !== confirmed.current.liked) {
        const url = `/posts/${post.id}/like`;
        const res = desired.current ? await api.post(url) : await api.delete(url);
        confirmed.current = { liked: res.data.likedByMe, count: res.data.likeCount };
      }
      show(confirmed.current.liked);
      onChange?.({ likedByMe: confirmed.current.liked, likeCount: confirmed.current.count });
    } catch (err) {
      desired.current = confirmed.current.liked;
      show(confirmed.current.liked);
      setError(getErrorMessage(err));
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  };

  const toggle = () => {
    setError("");
    desired.current = !desired.current;
    show(desired.current);
    sync();
  };

  return { liked, count, pending, error, toggle };
}

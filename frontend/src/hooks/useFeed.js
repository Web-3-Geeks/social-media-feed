import { useCallback, useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/axios";

const PAGE_SIZE = 10;

export function useFeed() {
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");

  useEffect(() => {
    let ignore = false;

    api
      .get("/posts", { params: { limit: PAGE_SIZE } })
      .then((res) => {
        if (ignore) return;
        setPosts(res.data.posts);
        setHasMore(res.data.pagination.hasMore);
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

  const retry = useCallback(() => {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  }, []);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    setLoadMoreError("");
    try {
      // Ask for posts older than the last one we have (cursor), instead of
      // "page 2". Offsets shift when posts are created or deleted, which made
      // page 2 repeat or skip posts.
      const last = posts[posts.length - 1];
      const params = last
        ? { before: last.createdAt, beforeId: last.id, limit: PAGE_SIZE }
        : { limit: PAGE_SIZE };
      const res = await api.get("/posts", { params });
      // Safety net: never add a post that's already in the list.
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...res.data.posts.filter((p) => !seen.has(p.id))];
      });
      setHasMore(res.data.pagination.hasMore);
    } catch (err) {
      setLoadMoreError(getErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }, [posts]);

  const addPost = useCallback((post) => {
    setPosts((prev) => [post, ...prev.filter((p) => p.id !== post.id)]);
  }, []);

  const replacePost = useCallback((updated) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const removePost = useCallback((id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Merge a few fields into one post (e.g. likeCount/likedByMe, commentCount)
  // without replacing the whole object. `changes` can be an object or a function
  // of the current post, so updates based on the latest value never get lost.
  const patchPost = useCallback((id, changes) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return { ...p, ...(typeof changes === "function" ? changes(p) : changes) };
      })
    );
  }, []);

  return {
    posts,
    hasMore,
    loading,
    error,
    retry,
    loadingMore,
    loadMoreError,
    loadMore,
    addPost,
    replacePost,
    removePost,
    patchPost,
  };
}

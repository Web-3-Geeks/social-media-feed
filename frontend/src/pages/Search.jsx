import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import api, { getErrorMessage } from "../api/axios";
import UserListSkeleton from "../components/UserListSkeleton";
import UserRow from "../components/UserRow";

const PAGE_SIZE = 10;

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get("q") || "").trim();
  const [input, setInput] = useState(searchParams.get("q") || "");

  // Debounce: only update the URL (and search) 300ms after the user stops typing.
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = input.trim();
      setSearchParams(q ? { q } : {}, { replace: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [input, setSearchParams]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find people</h1>
        <p className="mt-1 text-sm text-gray-500">Search by name and follow people you like.</p>
      </div>

      <div role="search">
        <label htmlFor="user-search" className="sr-only">
          Search users by name
        </label>
        <input
          id="user-search"
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={50}
          autoFocus
          placeholder="Search by name..."
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {query ? (
        <SearchResults key={query} query={query} />
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="font-medium text-gray-900">Start typing to search</p>
          <p className="mt-1 text-sm text-gray-500">Results show up as you type.</p>
        </div>
      )}
    </div>
  );
}

// Keyed by query, so every new search starts fresh at page 1.
function SearchResults({ query }) {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    api
      .get("/users", { params: { search: query, page, limit: PAGE_SIZE } })
      .then((res) => {
        if (ignore) return;
        // Dedupe in case someone new signed up between pages.
        setUsers((prev) => {
          const seen = new Set(prev.map((u) => u.id));
          return [...prev, ...res.data.users.filter((u) => !seen.has(u.id))];
        });
        setTotal(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
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
  }, [query, page, reloadKey]);

  // After a failure, retry the same page; otherwise ask for the next one.
  const loadNext = () => {
    setLoading(true);
    setError("");
    if (error) setReloadKey((key) => key + 1);
    else setPage((p) => p + 1);
  };

  if (loading && users.length === 0) return <UserListSkeleton />;

  if (error && users.length === 0) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={loadNext}
          className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200 transition hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
        >
          Try again
        </button>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="font-medium text-gray-900">No users found</p>
        <p className="mt-1 break-words text-sm text-gray-500">
          Nobody matches &quot;{query}&quot;. Try a different name.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500" aria-live="polite">
        {total} {total === 1 ? "person" : "people"} found
      </p>
      <ul className="space-y-3">
        {users.map((user) => (
          <UserRow key={user.id} user={user} />
        ))}
      </ul>

      {error && (
        <p role="alert" className="text-center text-sm text-red-600">
          {error}
        </p>
      )}

      {(page < totalPages || error) && (
        <button
          type="button"
          onClick={loadNext}
          disabled={loading}
          className="w-full rounded-2xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? "Loading..." : error ? "Try again" : "Load more"}
        </button>
      )}
    </div>
  );
}

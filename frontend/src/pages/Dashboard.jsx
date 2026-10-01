import { useState } from "react";
import { Link } from "react-router";
import Avatar from "../components/Avatar";
import { useAuth } from "../hooks/useAuth";
import FeedList from "../components/FeedList";

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("following");
  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-sky-500 to-indigo-600 p-6 text-white shadow-md">
        <div
          aria-hidden="true"
          className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-16 right-24 h-32 w-32 rounded-full bg-white/10"
        />

        <div className="relative flex items-center gap-4">
          <div className="shrink-0 rounded-full ring-2 ring-white/70">
            <Avatar user={user} size={52} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-xl font-bold">
              Welcome, {firstName}!
            </h1>
            <p className="text-sm text-white/80">
              See what everyone is sharing today.
            </p>
          </div>
          <Link
            to={`/users/${user.id}`}
            className="hidden shrink-0 rounded-xl bg-white/15 px-3.5 py-2 text-sm font-medium text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:inline-flex"
          >
            View profile
          </Link>
        </div>
      </section>

      <section aria-label="Feed" className="space-y-4">
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          <TabButton active={tab === "following"} onClick={() => setTab("following")}>
            Following
          </TabButton>
          <TabButton active={tab === "everyone"} onClick={() => setTab("everyone")}>
            Everyone
          </TabButton>
        </div>

        {/* key remounts the feed, so switching tabs starts from a clean state */}
        <FeedList
          key={tab}
          showCreate
          endpoint={tab === "following" ? "/posts/feed" : "/posts"}
          emptyTitle={tab === "following" ? "Your feed is empty" : "No posts yet"}
          emptyMessage={
            tab === "following"
              ? "Follow people to see their posts here, or check the Everyone tab."
              : "Be the first to share something."
          }
        />
      </section>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 rounded-lg py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 ${
        active ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

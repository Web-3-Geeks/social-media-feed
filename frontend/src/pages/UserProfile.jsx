import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import api, { getErrorMessage } from "../api/axios";
import Avatar from "../components/Avatar";
import EditProfileForm from "../components/EditProfileForm";
import FeedList from "../components/FeedList";
import FollowButton from "../components/FollowButton";
import { GridIcon, ListIcon } from "../components/Icons";
import { useAuth } from "../hooks/useAuth";
import { onFollowChange } from "../utils/followEvents";

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// Keyed by id, so going from one profile to another starts with fresh state.
export default function UserProfile() {
  const { id } = useParams();
  return <ProfileView key={id} userId={id} />;
}

function ProfileView({ userId }) {
  const { user: me, updateUser } = useAuth();
  const isMe = userId === me.id;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState(false);
  const [view, setView] = useState("grid");
  const [openedPostId, setOpenedPostId] = useState(null);

  useEffect(() => {
    let ignore = false;

    api
      .get(`/users/${userId}`)
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
  }, [userId, reloadKey]);

  // Keep the counts in sync when a follow button anywhere on the page is used.
  useEffect(
    () =>
      onFollowChange((change) => {
        setProfile((prev) => {
          if (!prev) return prev;
          if (change.userId === prev.id) {
            return { ...prev, isFollowing: change.following, followerCount: change.followerCount };
          }
          if (isMe) {
            const delta = change.following ? 1 : -1;
            return { ...prev, followingCount: Math.max(0, prev.followingCount + delta) };
          }
          return prev;
        });
      }),
    [isMe]
  );

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  };

  const handleSaved = (updated) => {
    setProfile((prev) => ({ ...prev, name: updated.name, bio: updated.bio, avatar: updated.avatar }));
    updateUser(updated);
    setEditing(false);
  };

  if (loading) return <ProfileSkeleton />;

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

  const changePostCount = (delta) =>
    setProfile((prev) => ({ ...prev, postCount: Math.max(0, prev.postCount + delta) }));

  // Clicking a tile opens the list at that post. Going back to the grid keeps
  // openedPostId so the grid scrolls back to the same tile.
  const openPost = (postId) => {
    setOpenedPostId(postId);
    setView("list");
  };
  const showGrid = () => setView("grid");
  const showList = () => {
    setOpenedPostId(null);
    setView("list");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
          <Avatar user={profile} size={80} />
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-2xl font-bold text-gray-900">{profile.name}</h1>
            {isMe && <p className="break-all text-sm text-gray-500">{me.email}</p>}
            <p className="mt-1 text-sm text-gray-500">
              Joined <time dateTime={profile.createdAt}>{formatDate(profile.createdAt)}</time>
            </p>
          </div>
          {isMe ? (
            !editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              >
                Edit profile
              </button>
            )
          ) : (
            <FollowButton userId={profile.id} initialFollowing={profile.isFollowing} name={profile.name} />
          )}
        </div>

        <p className="mt-5 whitespace-pre-line break-words text-sm text-gray-700">
          {profile.bio || <span className="italic text-gray-400">No bio yet.</span>}
        </p>

        <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-gray-100 pt-5 text-center">
          <Stat label="Posts" value={profile.postCount} />
          <Stat label="Followers" value={profile.followerCount} to={`/users/${profile.id}/followers`} />
          <Stat label="Following" value={profile.followingCount} to={`/users/${profile.id}/following`} />
        </dl>

        {editing && (
          <EditProfileForm profile={profile} onSaved={handleSaved} onCancel={() => setEditing(false)} />
        )}
      </section>

      <section aria-label={`Posts by ${profile.name}`} className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Posts</h2>
          <div role="group" aria-label="Posts layout" className="flex gap-1 rounded-xl bg-gray-100 p-1">
            <ViewButton label="Grid view" active={view === "grid"} onClick={showGrid}>
              <GridIcon />
            </ViewButton>
            <ViewButton label="List view" active={view === "list"} onClick={showList}>
              <ListIcon />
            </ViewButton>
          </div>
        </div>

        {/* Stays under the navbar while scrolling through an opened post. */}
        {view === "list" && openedPostId && (
          <div className="sticky top-16 z-5 -mx-1 rounded-xl bg-white/90 px-1 py-2 shadow-sm ring-1 ring-gray-200 backdrop-blur">
            <button
              type="button"
              onClick={showGrid}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            >
              &larr; Back to grid
            </button>
          </div>
        )}

        {/* Re-fetch after a profile edit so the cards show the new name/avatar. */}
        <FeedList
          key={`${profile.name}|${profile.avatar}`}
          endpoint={`/users/${profile.id}/posts`}
          view={view}
          scrollToId={openedPostId}
          onOpenPost={openPost}
          showCreate={isMe}
          onPostCreated={() => changePostCount(1)}
          onPostDeleted={() => changePostCount(-1)}
          emptyTitle="No posts yet"
          emptyMessage={
            isMe
              ? "Share your first post above."
              : `${profile.name} hasn't posted anything yet.`
          }
        />
      </section>
    </div>
  );
}

function ViewButton({ label, active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`rounded-lg p-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 ${
        active ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

function Stat({ label, value, to }) {
  const content = (
    <>
      <dd className="text-xl font-bold tabular-nums text-gray-900">{value}</dd>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
    </>
  );

  if (!to) return <div className="flex flex-col-reverse rounded-xl py-2">{content}</div>;

  return (
    <Link
      to={to}
      className="flex flex-col-reverse rounded-xl py-2 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
    >
      {content}
    </Link>
  );
}

function ProfileSkeleton() {
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
      <div className="mt-6 grid grid-cols-3 gap-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-12 rounded-xl bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

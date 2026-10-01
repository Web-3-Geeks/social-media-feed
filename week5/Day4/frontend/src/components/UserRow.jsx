import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import Avatar from "./Avatar";
import FollowButton from "./FollowButton";

export default function UserRow({ user }) {
  const { user: me } = useAuth();
  const isMe = user.id === me.id;

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
      <Link to={`/users/${user.id}`} tabIndex={-1} aria-hidden="true" className="shrink-0">
        <Avatar user={user} size={44} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            to={`/users/${user.id}`}
            className="truncate font-semibold text-gray-900 hover:underline focus:outline-none focus-visible:underline"
          >
            {user.name}
          </Link>
          {isMe && (
            <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
              You
            </span>
          )}
        </div>
        {user.bio && <p className="truncate text-sm text-gray-500">{user.bio}</p>}
      </div>
      {!isMe && (
        <FollowButton userId={user.id} initialFollowing={user.isFollowing} name={user.name} />
      )}
    </li>
  );
}

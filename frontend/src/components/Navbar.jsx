import { useState } from "react";
import { Link, NavLink } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useUnreadCount } from "../hooks/useUnreadCount";
import { BellIcon, LogoutIcon } from "./Icons";
import Avatar from "./Avatar";
import Logo from "./Logo";

const navLinkClass = ({ isActive }) =>
  `whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 sm:px-3 ${
    isActive
      ? "bg-blue-50 text-blue-600"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const unread = useUnreadCount();

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-1 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          aria-label="Social Feed home"
          className="shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
        >
          <Logo size={32} showText hideTextOnMobile />
        </Link>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/search" className={navLinkClass}>
            Search
          </NavLink>
          <NavLink to={`/users/${user.id}`} end className={navLinkClass}>
            Profile
          </NavLink>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <NavLink
            to="/notifications"
            aria-label={
              unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
            }
            className={({ isActive }) =>
              `relative rounded-lg p-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <BellIcon />
            {unread > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
              >
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </NavLink>

          <div className="hidden sm:block">
            <Avatar user={user} size={32} />
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label={loggingOut ? "Logging out" : "Log out"}
            title="Log out"
            className="whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200 disabled:opacity-60 sm:px-3"
          >
            {/* Icon on small phones, where there's no room for the word next to the bell. */}
            <span className="sm:hidden">
              <LogoutIcon />
            </span>
            <span className="hidden sm:inline">
              {loggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}

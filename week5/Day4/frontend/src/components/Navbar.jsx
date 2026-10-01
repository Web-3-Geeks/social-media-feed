import { useState } from "react";
import { Link, NavLink } from "react-router";
import { useAuth } from "../hooks/useAuth";
import Avatar from "./Avatar";
import Logo from "./Logo";

const navLinkClass = ({ isActive }) =>
  `whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 sm:px-3 ${
    isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Social Feed home" className="shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200">
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

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <Avatar user={user} size={32} />
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200 disabled:opacity-60 sm:px-3"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </nav>
    </header>
  );
}

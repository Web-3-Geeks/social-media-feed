import { Link } from "react-router";
import Avatar from "../components/Avatar";
import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user.name.split(" ")[0];

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <Avatar user={user} size={56} />
        <div className="min-w-0">
          <h1 className="break-words text-xl font-bold text-gray-900">
            Welcome, {firstName}!
          </h1>
          <p className="text-sm text-gray-500">You&apos;re logged in to Social Feed.</p>
        </div>
      </div>

      <Link
        to="/profile"
        className="mt-6 inline-flex rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
      >
        View your profile
      </Link>
    </section>
  );
}

import { Link } from "react-router";

// Any unknown URL. Shown instead of silently sending people home, so a broken
// link is obvious.
export default function NotFound() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
      <p className="text-4xl font-bold text-gray-300">404</p>
      <h1 className="mt-2 font-semibold text-gray-900">Page not found</h1>
      <p className="mt-1 text-sm text-gray-500">
        The link may be broken, or the page may have been removed.
      </p>
      <Link
        to="/"
        className="mt-4 inline-block rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
      >
        Back to home
      </Link>
    </div>
  );
}

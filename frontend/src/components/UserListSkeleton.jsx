export default function UserListSkeleton() {
  return (
    <div role="status" aria-label="Loading users" className="space-y-3">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="flex animate-pulse items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4"
        >
          <div className="h-11 w-11 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-3 w-48 rounded bg-gray-100" />
          </div>
          <div className="h-9 w-24 rounded-xl bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

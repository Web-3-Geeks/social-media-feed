export default function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

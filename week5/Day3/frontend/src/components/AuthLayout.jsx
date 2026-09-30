import Logo from "./Logo";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <Logo size={44} showText />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {children}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">{footer}</p>
      </div>
    </main>
  );
}

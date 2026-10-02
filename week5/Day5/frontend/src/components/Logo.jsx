import { useId } from "react";

export default function Logo({ size = 40, showText = false, hideTextOnMobile = false }) {
  // Unique gradient id per instance, so two logos on one page don't clash.
  const gradientId = `logo-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className="shrink-0 drop-shadow-sm"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="40"
            y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0EA5E9" />
            <stop offset="1" stopColor="#4F46E5" />
          </linearGradient>
        </defs>

        <rect width="40" height="40" rx="12" fill={`url(#${gradientId})`} />

        {/* Back bubble: the reply */}
        <path
          d="M20 8h8a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4v3l-3.5-3H20a4 4 0 0 1-4-4v-5a4 4 0 0 1 4-4z"
          fill="#fff"
          fillOpacity="0.45"
        />

        {/* Front bubble: the post, outlined so it separates from the back one */}
        <path
          d="M12 15h10a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4h-5l-4 3.5V29h-1a4 4 0 0 1-4-4v-6a4 4 0 0 1 4-4z"
          fill="#fff"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        <circle cx="12.5" cy="22" r="1.6" fill={`url(#${gradientId})`} />
        <circle cx="17" cy="22" r="1.6" fill={`url(#${gradientId})`} />
        <circle cx="21.5" cy="22" r="1.6" fill={`url(#${gradientId})`} />
      </svg>

      {showText ? (
        <span
          className={`text-xl font-extrabold tracking-tight text-gray-900 ${
            hideTextOnMobile ? "hidden sm:inline" : ""
          }`}
        >
          Social
          <span className="bg-linear-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
            Feed
          </span>
        </span>
      ) : (
        <span className="sr-only">Social Feed</span>
      )}
    </div>
  );
}

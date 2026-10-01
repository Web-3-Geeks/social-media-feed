const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function HeartIcon({ filled = false, size = 18 }) {
  return (
    <svg {...base} width={size} height={size} fill={filled ? "currentColor" : "none"}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

export function CommentIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

export function GridIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function ListIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <rect x="3" y="3" width="18" height="7" rx="1" />
      <rect x="3" y="14" width="18" height="7" rx="1" />
    </svg>
  );
}

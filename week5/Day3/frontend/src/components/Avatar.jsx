import { useState } from "react";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

export default function Avatar({ user, size = 40 }) {
  const [imageFailed, setImageFailed] = useState(false);
  const style = { width: size, height: size, fontSize: size * 0.4 };

  if (user.avatar && !imageFailed) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        style={style}
        onError={() => setImageFailed(true)}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={user.name}
      style={style}
      className="flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-indigo-600 font-semibold text-white"
    >
      {getInitials(user.name)}
    </div>
  );
}

# Week 5 — Social Media Feed App (snapshots)

Each `DayN/` folder is a complete, standalone copy of the project exactly as it stood at the end of that day. Snapshots are cumulative: Day 2 includes Day 1, and so on. The live, deployed app is always the repo root.

To run a snapshot, follow the root README inside that folder (`npm install` in `backend/` and `frontend/`, and add the `.env` files, which are not included).

| Day | Focus | Highlights |
|---|---|---|
| [Day1](Day1/) | Project setup, database design, authentication | Express 5 + MongoDB Atlas API; register, login, logout, `/auth/me`, `/users/me`; JWT in an httpOnly cookie; React auth flow with protected routes; Dashboard and Profile pages; Vercel deployment |
| [Day2](Day2/) | Posts, feed and content management | Post model linked to User; create, feed, single, owner-only edit/delete API; feed on Home with composer, post cards, inline edit, delete confirmation, Load more (cursor); security hardening (rate limiting, helmet, timing-safe login, SameSite=Lax, session-expiry handling) |
| [Day3](Day3/) | Likes, comments and user interactions | Like model (unique user+post) with race-safe like/unlike; Comment model with create, list (newest first, cursor), owner-only edit/delete; feed includes likeCount, commentCount, likedByMe; optimistic like button; on-demand comments UI; Day 2 review fixes (API base URL info, per-IP login limit, cursor-first feed) |
| [Day4](Day4/) | Profiles, follow system and personalized feed | Follow model (unique follower+following) with race-safe follow/unfollow and stored counts; public profiles, profile editing, user search (debounced, regex-escaped); followers/following lists (cursor); personalized feed (`/api/feed`) with Following/Everyone tabs; Instagram-style profile post grid that opens into the list; synced follow buttons |
| [Day5](Day5/) | Notifications, post search, testing and final polish | Notification model + API (like/comment/follow, never for your own action, removed on undo, unread count, mark one/all read); navbar bell and Notifications page; post search (`/api/posts?search=`) with People/Posts tabs; bonus private accounts with follow requests (accept/decline, 403 on private content); security probe, `explain()`-driven index fixes, responsive walk-through at 3 widths, 404 page; Postman 236 requests / 338 assertions |

`archive/` is reserved for deprecated or old files.

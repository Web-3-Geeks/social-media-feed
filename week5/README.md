# Week 5 — Social Media Feed App (snapshots)

Each `DayN/` folder is a complete, standalone copy of the project exactly as it stood at the end of that day. Snapshots are cumulative: Day 2 includes Day 1, and so on. The live, deployed app is always the repo root.

To run a snapshot, follow the root README inside that folder (`npm install` in `backend/` and `frontend/`, and add the `.env` files, which are not included).

| Day | Focus | Highlights |
|---|---|---|
| [Day1](Day1/) | Project setup, database design, authentication | Express 5 + MongoDB Atlas API; register, login, logout, `/auth/me`, `/users/me`; JWT in an httpOnly cookie; React auth flow with protected routes; Dashboard and Profile pages; Vercel deployment |
| [Day2](Day2/) | Posts, feed and content management | Post model linked to User; create, feed, single, owner-only edit/delete API; feed on Home with composer, post cards, inline edit, delete confirmation, Load more (cursor); security hardening (rate limiting, helmet, timing-safe login, SameSite=Lax, session-expiry handling) |

`archive/` is reserved for deprecated or old files.

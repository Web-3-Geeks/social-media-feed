# Social Media Feed App — Notes

## Week 5 · Day 1 — Setup, Database & Authentication

**Goal:** A user can Register → Login → See their dashboard/profile → Logout.

### What the task asks for

1. **Project setup:** separate `backend/` (Express) and `frontend/` (React) apps, with env variables, CORS, error handling, validation, and a `GET /api/health` endpoint.
2. **Database:** connect MongoDB and create a User model (name, email, password, avatar, bio, timestamps). The email must be unique and the password must be hashed.
3. **Register:** `POST /api/auth/register` creates a new user.
4. **Login:** `POST /api/auth/login` checks the email and password, then gives the user a token.
5. **Protected routes:** `GET /api/auth/me` and `POST /api/auth/logout`. Requests without a valid token get a 401.
6. **Frontend auth:** Register, Login, and Dashboard pages, with validation, error messages, and loading states. Logged-out users can't open protected pages.
7. **Profile:** `GET /api/users/me` plus a profile page showing avatar, name, email, bio, and join date.

### Stack

- **Backend:** Node.js, Express 5, MongoDB Atlas (Mongoose), JWT, bcryptjs
- **Frontend:** React, Vite, Tailwind, React Router, Axios
- **Auth:** JWT stored in an httpOnly cookie

---

### Today's plan

**Part 1 — Backend setup**
- [x] Clean up `package.json`, install the missing packages, set up git
- [x] Add the `.env` file
- [x] Connect the database and start the server
- [x] Add the health endpoint and error handling

**Part 2 — User & Auth API**
- [x] Create the User model
- [x] Register endpoint
- [x] Login endpoint
- [x] Auth middleware + `/api/auth/me`
- [x] Logout endpoint
- [x] `/api/users/me` endpoint
- [x] Test every endpoint in Postman

**Part 3 — Frontend**
- [x] Set up React + Tailwind + Router
- [x] Auth context (keeps track of the logged-in user)
- [x] Protected routes
- [x] Register and Login pages
- [x] Dashboard and Profile pages

**Part 4 — Finish up**
- [x] Test the full flow end to end
- [x] Run lint and build, fix any issues
- [x] Write the README
- [x] Push to GitHub and create the `week5/Day1` snapshot

---

## Week 5 · Day 2 — Posts, Feed & Content Management

**Goal:** A logged-in user can Create Post → See it in Feed → See other users' posts → Edit own post → Delete own post → Load more.

### Decisions

- **The feed lives on the Home page (`/`).** The Create Post form is at the top, with the feed below it.
- **Page-based pagination** (`?page=1&limit=10`), as in the task. The frontend skips any post already in the list, so new posts can't cause duplicates.

### Today's plan

**Part 1 — Posts API**
- [x] Post model (author → User, content, imageUrl, timestamps)
- [x] Post validators (content required, max length, valid image URL)
- [x] `POST /api/posts`: create a post
- [x] `GET /api/posts`: feed, newest first, with pagination
- [x] `GET /api/posts/:id`: single post (404 if missing)
- [x] `PATCH /api/posts/:id`: edit (owner only, 403 otherwise)
- [x] `DELETE /api/posts/:id`: delete (owner only)
- [x] Test in Postman and update the collection

**Part 2 — Feed UI**
- [x] Feed on the Home page: loads the first page
- [x] Post card: author, time, content, optional image; "You" badge on own posts
- [x] Create Post form: textarea, image URL, character counter, loading, errors
- [x] New post appears in the feed right after it's created

**Part 3 — Post actions & pagination**
- [x] Edit post (inline) + Cancel
- [x] Delete post with confirmation
- [x] Load more button, no duplicates, "No more posts" message

**Part 4 — Finish up**
- [x] Test the full flow end to end (local + live)
- [x] Lint, build, audit (a11y, edge cases, empty feed)
- [x] README Day 2 section
- [x] Commit, `week5/Day2` snapshot, push

---

## Week 5 · Day 3 — Likes, Comments & User Interactions

**Goal:** A logged-in user can View Feed → Like Post → Unlike Post → Add Comment → View Comments → Edit Own Comment → Delete Own Comment.

### Today's plan

**Part 1 — Likes API**
- [x] Like model (user + post, unique together, timestamps)
- [x] `POST /api/posts/:id/like` and `DELETE /api/posts/:id/like` → `{ likeCount, likedByMe }`
- [x] Safe on repeat (liking twice or unliking twice doesn't break counts)

**Part 2 — Comments API**
- [x] Comment model (post + user + content, max length, timestamps)
- [x] `POST /api/posts/:id/comments` and `GET /api/posts/:id/comments` (sorted, paginated)
- [x] `PATCH /api/comments/:id` and `DELETE /api/comments/:id` (owner only, 403/404)

**Part 3 — Feed update**
- [x] Feed and single post include `likeCount`, `commentCount`, `likedByMe`
- [x] Deleting a post also deletes its likes and comments
- [x] Postman collection updated

**Part 4 — Frontend**
- [x] Like button: optimistic update, revert on failure, no duplicates on fast clicks
- [x] Comments section per post: list, add, edit/delete own, loading and error states

**Part 5 — Finish up**
- [x] Full flow test (local + live), lint, build, audit
- [x] README Day 3 section, `week5/Day3` snapshot, push
- [x] Fix Day 2 review points (live URL, per-IP login limit, cursor-only feed)

---

## Week 5 · Day 4 — Profiles, Follow System & Personalized Feed

**Goal:** A logged-in user can Search Users → Open Profile → Follow → See Updated Follower Count → View Followers/Following → Unfollow → View Personalized Feed.

### Today's plan

**Part 1 — Profiles API**
- [x] `GET /api/users/:id`: public profile + post/follower/following counts + `isFollowing`
- [x] `PATCH /api/users/me`: edit name, bio, avatar URL (validated)

**Part 2 — Follow API**
- [x] Follow model (follower + following, unique pair, no self-follow, indexes)
- [x] `POST` / `DELETE /api/users/:id/follow` (safe on repeat, returns updated counts)
- [x] `GET /api/users/:id/followers` and `/following` (paginated, with follow status)

**Part 3 — Discovery & feed API**
- [x] `GET /api/users?search=` (by name, paginated, no private fields)
- [x] `GET /api/feed`: posts from people I follow + my own, newest first
- [x] Postman collection updated

**Part 4 — Frontend**
- [x] Profile page `/users/:id` (counts, Follow/Unfollow or Edit Profile, user's posts)
- [x] Edit profile form
- [x] Follow button shared everywhere (search, profile, lists, feed), state kept in sync
- [x] User search page
- [x] Followers / Following lists
- [x] Home feed: personalized "Following" feed

**Part 5 — Finish up**
- [x] Full flow test (local + live), lint, build, audit
- [x] README Day 4 section, `week5/Day4` snapshot, push

---

## Week 5 · Day 5 — Notifications, Testing, Optimization & Final Integration

**Goal:** A new user can Register → Login → Create Profile → Discover Users → Follow Users → Create Posts → View Personalized Feed → Like Posts → Comment → Receive Notifications → Manage Profile → Interact With Other Users → Logout, with the whole app tested, polished and ready for submission.

### Today's plan

**Part 1 — Notifications model**
- [x] `Notification` model: `recipient`, `actor`, `type` (`LIKE`/`COMMENT`/`FOLLOW`), `post` (optional), `comment` (optional), `isRead`, timestamps
- [x] Indexes for "my notifications, newest first" and unread-count queries

**Part 2 — Generate notifications**
- [x] Create a notification on like, comment, and follow
- [x] Skip it when the actor is the recipient (liking/commenting on your own post, or the self-follow case, which is already blocked)

**Part 3 — Notifications API**
- [x] `GET /api/notifications` — mine only, newest first, paginated, with actor info, type, related post/comment, and `isRead`
- [x] `PATCH /api/notifications/:id/read`
- [x] `PATCH /api/notifications/read-all`
- [x] Postman collection updated (including the "no notification for your own action" cases)

**Part 4 — Notifications UI**
- [x] Notification bell in the navbar with an unread-count badge
- [x] Notifications page/dropdown: actor avatar + name, message, type, related post link, time, read/unread style
- [x] Mark one as read (on click/open) and "Mark all as read"; badge count updates right away

**Bonus — Private accounts & follow requests (Instagram style)**
- [x] `isPrivate` on User + toggle in Edit profile; going public accepts everyone waiting
- [x] `FollowRequest` model (kept apart from `Follow`, so Follow only holds accepted follows)
- [x] Follow on a private account sends a request; unfollow cancels it
- [x] `GET /api/follow-requests`, `POST /api/follow-requests/:userId/accept`, `DELETE /api/follow-requests/:userId`
- [x] New notification types `FOLLOW_REQUEST` (with Confirm / Delete) and `FOLLOW_ACCEPTED`
- [x] Privacy: posts, single post, comments, likes, followers/following lists and the global feed are locked for non-followers (403)
- [x] Follow button: Follow / Requested / Following; private profile shows a lock notice
- [x] Tested: backend 48/48, browser 23/23 (desktop + 375px), and by hand on Razi Allah (3 real requests, Confirm/Delete)

**Part 5 — Post search**
- [x] `GET /api/posts?search=keyword` — search by post content (case-insensitive, regex-escaped, max 100 chars, same privacy + pagination as the feed). Author-name search not added: the People tab already covers it
- [x] Frontend: Search page has People | Posts tabs (`?q=&type=posts`), results use `FeedList` (Load more, like, comment) with an empty-results state

**Part 6 — Security & error-handling review**
- [x] Re-check every ownership rule from the spec (posts, comments, profile, likes, follows — self-follow, duplicate follow, duplicate like) against the current code (probe script, 30/30, incl. 10 parallel likes/follows)
- [x] Re-check: passwords hashed, secrets only in env vars, no sensitive fields in responses, validation on every write route
- [x] Confirm error responses are consistent (`400/401/403/404/409/500`, always `{ success: false, message }`) and the frontend shows friendly messages, not raw API errors (network error + first validation error now shown)

**Part 7 — Performance pass**
- [x] Check indexes (including the new `Notification` ones) and look for any N+1 pattern, especially around notifications and feed (`explain()` found 4 collection scans / in-memory sorts → indexes added on Post, Follow, User, Notification; no N+1)
- [x] Confirm pagination and field selection are used everywhere large lists are returned

**Part 8 — UI/UX & responsive polish**
- [x] Walk through every page on desktop, tablet and mobile widths (11 pages × 375/768/1280, 0 overflow)
- [x] Clear any console errors/warnings; check loading, empty and error states everywhere (including the new notifications UI); added a 404 page

**Part 9 — Full testing**
- [x] Re-run the full flow from the spec, end to end, local + live (auth, posts, likes, comments, follow, notifications, search)
- [x] Postman: add notifications + post-search requests, full collection run with 0 failures (local and live) — 3 new folders, 236 requests / 338 assertions

**Part 10 — Deployment prep & docs**
- [x] Re-verify production env vars, CORS, DB connection, frontend/backend builds on both Vercel projects (no new env vars; `/api` proxy keeps it same-origin)
- [x] README: notifications + post-search sections, updated API table and project structure, Day 5 write-up
- [x] `week5/Day5` snapshot, push

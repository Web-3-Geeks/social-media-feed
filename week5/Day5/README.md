# Social Media Feed App

A full-stack social media feed app, built incrementally as a daily internship project (Week 5).

- **Live app (open this):** https://social-media-feed-ruby.vercel.app
- **Live API health check:** https://social-feed-api.vercel.app/api/health. The API has no pages; its base URL returns a short info object.
- **Repo:** https://github.com/Web-3-Geeks/social-media-feed

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router v7, Axios |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT in an httpOnly cookie, bcrypt password hashing |
| Hosting | Vercel (frontend and backend as separate projects) |

---

## Project structure

```
social-media-feed/
├── backend/
│   ├── api/index.js              # Vercel serverless entry (exports the Express app)
│   ├── vercel.json               # Routes every request to api/index.js
│   ├── postman-collection.json   # Importable API collection with tests
│   └── src/
│       ├── server.js             # Local entry: connect DB, then app.listen
│       ├── app.js                # Express app: middleware, routes, error handling
│       ├── config/db.js          # Cached MongoDB connection
│       ├── models/               # User, Post, Like, Comment, Follow, FollowRequest, Notification
│       ├── controllers/          # auth, user, follow, followRequest, post, like, comment, notification
│       ├── routes/               # health, auth, user (incl. follow), post (incl. likes and comments), comment, feed,
│       │                         # notification, followRequest
│       ├── middleware/           # auth (protect), validate, rateLimiters, notFound, errorHandler
│       ├── validators/           # express-validator rules (auth, users, posts, comments, notifications, follow requests)
│       └── utils/                # AppError, generateToken, tokenCookie, escapeRegex, notify (create/undo
│                                 # notifications), followService (follow + accept), privacy (private-account checks)
├── frontend/
│   ├── vercel.json               # SPA fallback + /api proxy to the backend
│   └── src/
│       ├── api/axios.js          # Axios instance (baseURL, withCredentials)
│       ├── context/              # AuthContext + AuthProvider
│       ├── hooks/                # useAuth, useFeed (feed state + pagination), useLike (optimistic likes),
│       │                         # useFollow (optimistic follow/request), useUnreadCount (bell badge)
│       ├── components/           # Route guards, layouts, Navbar, FormInput, Avatar, Logo,
│       │                         # CreatePost, PostCard, LikeButton, CommentsSection, CommentItem, Icons,
│       │                         # FeedList, PostGridTile, FollowButton, UserRow, EditProfileForm, UserListSkeleton,
│       │                         # NotificationItem
│       ├── pages/                # Login, Register, Dashboard, UserProfile, Search (people + posts), FollowList,
│       │                         # Notifications, NotFound, Profile (redirects to your own /users/:id)
│       └── utils/                # validation (forms, posts, profile), time (relative timestamps),
│                                 # followEvents (keeps follow buttons in sync), notificationEvents (badge sync)
└── week5/                        # Per-day snapshots for evaluation (see week5/README.md)
```

---

## Running locally

**Requirements:** Node.js 20+ and a MongoDB Atlas cluster (the free M0 tier is fine).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env    # then fill in the values
npm run dev             # http://localhost:5000
```

`backend/.env`:

| Variable | Example | Purpose |
|---|---|---|
| `PORT` | `5000` | Local server port. Hosting platforms set their own. |
| `NODE_ENV` | `development` | Anything other than `development` hides stack traces and 500 error details. `production` also marks the cookie `Secure`. |
| `MONGO_URI` | `mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/social-feed?...` | Atlas connection string, including the database name |
| `JWT_SECRET` | 128 random hex chars | Signs tokens. Generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime. Keep it in sync with the cookie `maxAge` in `utils/tokenCookie.js`. |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |

Check it's running: http://localhost:5000/api/health

### 2. Frontend

```bash
cd frontend
npm install
echo VITE_API_URL=http://localhost:5000/api > .env
npm run dev             # http://localhost:5173
```

Only `VITE_`-prefixed variables reach the browser bundle, so never put secrets in `frontend/.env`.

---

## API

Base URL: `/api`. Every response is JSON. Errors always use this shape:

```json
{ "success": false, "message": "Validation failed", "errors": { "email": "Please provide a valid email" } }
```

`errors` is only present on validation failures.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | – | Server and database status (`200` or `503`) |
| POST | `/api/auth/register` | – | Create an account (`201`) |
| POST | `/api/auth/login` | – | Log in and set the auth cookie |
| POST | `/api/auth/logout` | – | Clear the auth cookie |
| GET | `/api/auth/me` | 🔒 | Current session user |
| GET | `/api/users/me` | 🔒 | Current user's profile |
| PATCH | `/api/users/me` | 🔒 | Edit your `name`, `bio`, `avatar` and/or `isPrivate` |
| GET | `/api/users?search=<name>&page=1&limit=10` | 🔒 | Search users by name (excludes you), with `isFollowing` and `isRequested` |
| GET | `/api/users/:id` | 🔒 | Profile header with counts, `isPrivate`, `isFollowing` and `isRequested` (visible even for private accounts) |
| GET | `/api/users/:id/posts?limit=10` | 🔒 🔐 | One user's posts, newest first (`before` + `beforeId` for more) |
| POST | `/api/users/:id/follow` | 🔒 | Follow a user, or send a request if the account is private → `{ following, requested, followerCount }` (safe to repeat) |
| DELETE | `/api/users/:id/follow` | 🔒 | Unfollow, or cancel a pending request (safe to repeat) |
| GET | `/api/users/:id/followers?limit=20` | 🔒 🔐 | Who follows this user (`before` + `beforeId` for more) |
| GET | `/api/users/:id/following?limit=20` | 🔒 🔐 | Who this user follows (`before` + `beforeId` for more) |
| GET | `/api/follow-requests?limit=20` | 🔒 | Requests sent to me, newest first (cursor) |
| POST | `/api/follow-requests/:userId/accept` | 🔒 | Accept the request from `:userId` → follow created, they get `FOLLOW_ACCEPTED` |
| DELETE | `/api/follow-requests/:userId` | 🔒 | Decline the request from `:userId` |
| GET | `/api/notifications?limit=20` | 🔒 | My notifications, newest first, with actor, post/comment preview, `isRead` and `unreadCount` (cursor) |
| GET | `/api/notifications/unread-count` | 🔒 | `{ unreadCount }` for the bell badge |
| PATCH | `/api/notifications/:id/read` | 🔒 owner | Mark one as read → new `unreadCount` |
| PATCH | `/api/notifications/read-all` | 🔒 | Mark all as read |
| GET | `/api/feed?limit=10` | 🔒 | Personalized feed: your posts + posts from people you follow. Same as `/api/posts/feed`. |
| POST | `/api/posts` | 🔒 | Create a post (`201`) |
| GET | `/api/posts?limit=10` | 🔒 | Global feed, newest first (cursor mode, the default). Skips private accounts you don't follow. |
| GET | `/api/posts?search=<text>&limit=10` | 🔒 | Search posts by text (case-insensitive, max 100 chars). Works with both cursor and page mode. |
| GET | `/api/posts?before=<createdAt>&beforeId=<id>&limit=10` | 🔒 | Next page of the feed (Load more) |
| GET | `/api/posts?page=1&limit=10` | 🔒 | Feed in page mode, as in the task spec |
| GET | `/api/posts/:id` | 🔒 🔐 | Single post |
| PATCH | `/api/posts/:id` | 🔒 owner | Update `content` and/or `imageUrl` |
| DELETE | `/api/posts/:id` | 🔒 owner | Delete a post (and its likes and comments) |
| POST | `/api/posts/:id/like` | 🔒 | Like a post → `{ likeCount, likedByMe }` |
| DELETE | `/api/posts/:id/like` | 🔒 | Unlike a post → `{ likeCount, likedByMe }` |
| POST | `/api/posts/:id/comments` | 🔒 | Add a comment (`201`) |
| GET | `/api/posts/:id/comments?limit=20` | 🔒 | Comments, newest first (`before` + `beforeId` for older ones) |
| PATCH | `/api/comments/:id` | 🔒 owner | Edit a comment |
| DELETE | `/api/comments/:id` | 🔒 owner | Delete a comment |

🔐 = locked to followers when the owner's account is private (`403 This account is private`). The post's likes and comments follow the same rule.

**Status codes:** `400` validation or bad JSON · `401` not authenticated, invalid or expired token, wrong credentials · `403` not the post's or comment's owner, following yourself, or a private account you don't follow · `404` unknown route, user, post, comment, notification or follow request · `409` email already registered · `429` too many login or sign-up attempts.

**Postman:** import [`backend/postman-collection.json`](backend/postman-collection.json). Set the `baseUrl` variable to the local or live API and click **Run collection**. Every request has tests. Register generates a fresh email each run so the collection can be re-run, and the **Posts - Ownership** and **Comments - Ownership** folders use a second user to prove the `403` cases. The **Post Search**, **Notifications** and **Follow Requests & Private Accounts** folders (Day 5) use the same users. A full run sends 236 requests with 338 assertions, all passing. From the command line: `npx newman run postman-collection.json --env-var baseUrl=https://social-feed-api.vercel.app/api` (run inside `backend/`).

---

## Day 1 — Setup, database and authentication

**Goal:** a new user can Register → Login → reach the protected dashboard and profile → Logout.

### What was built

**Backend**
- Express 5 app split into `app.js` (configuration) and `server.js` (startup). The server only starts listening after MongoDB connects, and exits with a clear error if it can't.
- CORS locked to `CLIENT_URL` with credentials enabled, since the auth cookie must travel cross-origin in development.
- Centralized error handling. A custom `AppError` carries a status code, `notFound` turns unknown routes into a JSON `404`, and one `errorHandler` formats every error the same way. It also translates Mongo duplicate keys (`409`), Mongoose validation errors, invalid ObjectIds, and malformed JSON bodies. Stack traces are only included in development.
- `User` model: `name`, `email` (unique, lowercased), `password`, `avatar`, `bio`, and timestamps.
- Register, login, logout, `/auth/me`, and `/users/me`, with `express-validator` rules and a `protect` middleware.
- `GET /api/health` reports database connectivity, not just that the process is alive.

**Frontend**
- Register and Login pages with client-side validation, per-field server errors, loading states, and a show/hide password toggle.
- `AuthProvider` restores the session on page load by calling `/auth/me`.
- `ProtectedRoute` and `GuestRoute` guards.
- Dashboard and Profile pages. The Profile page fetches `/users/me` with loading-skeleton, error, and retry states.
- Responsive from 320px up. Accessibility: labels tied to inputs, `aria-invalid` and `aria-describedby` on errors, `role="alert"` and `role="status"` on messages, labelled icon-only buttons, and visible keyboard focus rings.

### Key decisions and why

**JWT in an httpOnly cookie, not localStorage.** The task asks for auth state to be stored securely. JavaScript can't read an httpOnly cookie, so an XSS bug can't steal the token, and the browser attaches it to requests automatically. The token is never sent in the response body. The cookie is `SameSite=Lax` everywhere (see the security hardening below) and `Secure` in production.

**Password safety, two layers.** The schema uses `select: false`, so queries don't load the password unless they explicitly ask for it (only login does). A `toJSON` transform also strips `password`, `_id`, and `__v` from every response. Passwords are hashed with bcrypt (cost 12) in a `pre("save")` hook, which skips rehashing when the password hasn't changed.

**Same error for a wrong password and an unknown email.** Login returns `Invalid email or password` in both cases, so it can't be used to discover which emails are registered. Register does reveal duplicates (`409`). That's a common UX trade-off, and fully hiding it needs email verification (see limitations).

**Validation on both sides.** Frontend rules mirror the backend for instant feedback. The backend rules are the real enforcement. Password rules are 8–72 characters with at least one letter and one number. The 72 maximum matches bcrypt's input limit, which silently ignores anything longer.

**Controllers only whitelist fields.** Register passes only `name`, `email`, and `password` to `User.create`, so extra fields like `role` are ignored.

**The auth guard reloads the user.** `protect` verifies the JWT, then loads the user from the database. A valid token for a deleted account is still rejected, and expired tokens get a specific "Session expired" message.

**Logout is not protected.** It must still clear the cookie when the token has already expired. It uses `POST` so that links or prefetching can't trigger it.

**Auth state lives in Context.** The Navbar, the Dashboard, and both route guards need the current user. `AuthContext`, `AuthProvider`, and `useAuth` are in separate files so that Vite Fast Refresh and the lint rules stay clean. The provider's functions use `useCallback` and its value uses `useMemo`, so consumers don't re-render unless auth state actually changes.

**The `loading` state prevents false redirects.** On refresh, `user` starts as `null` until `/auth/me` answers. Guards wait for `loading` to finish before deciding, so logged-in users aren't bounced to the login page.

**Redirects happen in one place.** After login or logout, the pages only update auth state. `GuestRoute` and `ProtectedRoute` react to the change and redirect.

**`/auth/me` and `/users/me` are separate.** `/auth/me` answers "who is logged in?" for the session check. `/users/me` is the profile resource, which will grow with profile editing and public profiles on later days.

---

## Day 2 — Posts, feed and content management

**Goal:** a logged-in user can create a post → see it in the feed → see other users' posts → edit their own post → delete their own post → load more.

### What was built

**Backend**
- `Post` model: `author` (reference to `User`, required), `content` (1–500 characters, trimmed), optional `imageUrl`, timestamps. `likesCount` and `commentsCount` start at 0, ready for Day 3.
- Indexes on `author` (for future profile feeds) and `{ createdAt: -1, _id: -1 }`, which matches the feed's sort exactly.
- Five endpoints: create, paginated feed, single post, update, delete. All are behind `protect` via `router.use(protect)`.
- Validation: content must be a non-empty string of at most 500 characters. `imageUrl` must be an `https://` URL. Ids must be valid ObjectIds. `page` must be ≥ 1 and `limit` 1–50.
- Update and delete are owner-only and return `403` for anyone else, and `404` if the post doesn't exist.
- The Postman collection has a Posts folder and a Posts - Ownership folder (58 requests, 79 assertions).

**Frontend**
- The feed lives on the Home page, below a welcome banner and a collapsible "What's on your mind?" composer.
- `useFeed` hook owns the feed: first page, load more, and add, replace, or remove a post after create, edit, or delete.
- `CreatePost`: textarea, optional image URL, a character counter that turns amber near the limit and red over it, loading state, and validation. It clears and collapses after posting. Escape or Cancel closes it.
- `PostCard`: author, relative time with the full date on hover, an "Edited" marker, content, and an optional image with a loading placeholder and broken-link fallback. Your own posts get a "You" badge and a tinted card.
- Inline edit (Save/Cancel/Escape) and delete with an in-card confirmation (focus starts on Cancel). Both only render on the user's own posts.
- Load more button with a spinner, and "You're all caught up" at the end. Error states have retry buttons.

### Key decisions and why

**The author always comes from the session.** `createPost` uses `req.user._id` and reads only `content` and `imageUrl` from the body. Sending `author` or `likesCount` has no effect, and there's a Postman test for it.

**Posts reference the author by id, and the API populates only `name avatar`.** Author details live in one place, so a renamed user shows correctly on every post. The feed never exposes an author's email or other private fields.

**Update and delete load the post first, then check ownership.** Order: `404` if missing, then `403` if not the owner. Owner ids are compared with `ObjectId.equals()`, because `===` compares object references and would always fail. Updates use `post.save()`, so schema rules run again and `updatedAt` changes. That's what drives the "Edited" label.

**Pagination: cursor by default, with `?page=&limit=` still supported as the task specifies.** Without `page`, the feed returns the newest posts and `{ limit, hasMore }`. With `?page=`, it returns `page`, `limit`, `total`, `totalPages`, and `hasMore`. Page offsets break when posts change between requests, though: a new post makes page 2 repeat a post, and a deleted post makes page 2 skip one (reproduced during the audit). So Load more sends the last post it has (`before=<createdAt>&beforeId=<id>`), and the API returns posts strictly older than it, fetching one extra to compute `hasMore`. The sort and the cursor both use `createdAt` then `_id`, matching the compound index, so the order is stable. The frontend also drops any id already in the list as a safety net.

**Edge cases handled.** A changed image URL resets the card's image state. A `404` on delete (already deleted in another tab) still removes the card. The empty-feed message only shows when there are no posts and no more pages.

**Validation lives in one place per side.** Backend rules are in `postValidators.js`. Frontend rules are in `validatePost()`, shared by the composer and the edit form, with the same 500 limit and the same messages.

---

## Day 3 — Likes, comments and user interactions

**Goal:** a logged-in user can view the feed → like a post → unlike it → add a comment → view comments → edit their own comment → delete their own comment.

### What was built

**Backend**
- `Like` model (`user`, `post`, `createdAt`) with a **unique index on `{ post, user }`**, so one user can only have one like per post.
- `Comment` model (`post`, `author`, `content` of 1–300 characters, timestamps), indexed by `{ post, createdAt, _id }` for listing and by `author` for future profile pages.
- Like and unlike return `{ likeCount, likedByMe }`. Comments support create, list (newest first, cursor-paginated, an empty list when there are none), and owner-only edit and delete (`403` otherwise, `404` if missing).
- The feed and single-post responses include `likeCount`, `commentCount`, and `likedByMe`.
- Deleting a post also deletes its likes and comments.

**Frontend**
- **Like button:** heart icon and count, optimistic update, a busy state while a request is in flight, and an automatic revert with a message if the request fails.
- **Comments:** a "💬 N comments" toggle on each post loads comments only when opened. It includes a composer with a 300-character counter, a newest-first list with author, relative time and an "Edited" label, inline edit, and delete with a confirmation step. Edit and Delete appear only on your own comments. There's also "View more comments", loading and error states, and a "Hide comments" button. Escape closes the section and returns focus to the toggle, and an unsent comment draft is kept if the section is closed.

### Key decisions and why

**Counters live on the post and change atomically.** The feed shows like and comment counts for every post, so `likeCount` and `commentCount` are stored on the post. Counting likes per post on each request would be slow. They change with `$inc` (atomic), so parallel likes from different users are never lost.

**Likes are race-safe.** Like uses one atomic `updateOne(..., { upsert: true })` with `$setOnInsert`, and the count only increases if a like was actually inserted (`upsertedCount === 1`). If two requests still race, the unique index rejects the second one (error `11000`), and it's treated as "already liked". Unlike only decrements when `deletedCount === 1`. Liking twice or unliking twice is safe. Verified with 10 parallel like requests: exactly 1 like.

**`likedByMe` is one query per page, not one per post.** `withLikedByMe()` fetches the current user's likes for all posts on the page with a single `$in` query (this avoids the N+1 query problem), then marks each post.

**Optimistic likes that survive rapid clicking.** `useLike` updates the UI instantly, but sends only one request at a time. Clicks while a request is in flight only change the *desired* state. When the request finishes, another is sent only if the desired state differs from what the server confirmed. The count shown is always "last confirmed count ± 1", so it can't drift, and on failure the UI returns to the last confirmed state. Tested with 7 rapid clicks: the server ends with exactly 1 like.

**Comments are loaded on demand and shown newest first.** Opening a post's comments triggers the fetch, so the feed doesn't make an extra request per post. New comments appear at the top, and "View more comments" loads older ones with a `before` cursor, the same stable `createdAt` + `_id` approach as the feed.

**Comment count stays in sync.** Creating or deleting a comment changes `commentCount` on the server. The UI updates it through `patchPost(id, fn)`, a functional update in `useFeed`, so quick successive changes are never based on a stale value. The decrement only runs while the count is above 0.

### Day 2 review follow-ups (done today)
- **The live URL returned 404:** the reviewer opened the API's base URL, which has no page. The frontend was working. The API base URL (`/` and `/api`) now returns a short info object pointing to the app and the health check, and the top of this README says which link to open.
- **Credential stuffing:** a second login limit **per IP only** (30 failed attempts per 15 minutes) was added alongside the per-IP-and-email limit, so one IP can't try unlimited different accounts.
- **Simpler pagination:** the feed now uses the cursor for every request (the first page has no `before`), and `?page=` stays available for the task spec.

---

### Security hardening (end-of-day audit)

A review of the Day 1 and Day 2 code found no critical issues: no NoSQL injection, no mass assignment, no password exposure, and no ownership bypass. These improvements were made:

| Issue | Fix |
|---|---|
| Login timing revealed registered emails (~0.13s unknown email vs ~0.45s wrong password) | When the email doesn't exist, bcrypt still compares against a dummy hash, so both cases take the same time |
| No brute-force protection | `express-rate-limit`: 10 failed logins per IP + email and 30 per IP (added in Day 3 after review) per 15 minutes, and 20 sign-ups per IP per 15 minutes, returning `429` with `Retry-After`. `trust proxy` is set so `req.ip` is the real client behind Vercel. |
| Cookie was `SameSite=None` in production, which it no longer needs because of the proxy (CSRF surface) | `SameSite=Lax` everywhere, plus `Secure` in production |
| Missing security headers, and `X-Powered-By: Express` exposed | `helmet` on the API. The frontend's `vercel.json` adds `X-Frame-Options: DENY` (no clickjacking), `nosniff`, and a `Referrer-Policy`. |
| `http://` image URLs are blocked as mixed content on an https site | Only `https://` image URLs are accepted (API and forms) |
| An expired session left the UI looking logged in while every action failed | An Axios response interceptor drops the user on any unexpected `401`. The app redirects to login with a "session expired" notice. |
| A failed logout request caused an unhandled promise rejection | `logout` catches the error and always clears local state |
| A missing `NODE_ENV` would expose 500 error details | Details are hidden unless `NODE_ENV=development` |
| JWT verification accepted any algorithm the library allows | Verification is pinned to `HS256` |

---

## Day 4 — Profiles, follow system and personalized feed

**Goal:** a logged-in user can search users → open a profile → follow → see the follower count update → view followers and following → unfollow → view a personalized feed.

### What was built

**Backend**
- `Follow` model (`follower`, `following`, `createdAt`) with a **unique index on `{ follower, following }`** and a check that rejects following yourself.
- `User` now stores `followerCount`, `followingCount` and `postCount`.
- Profiles: `GET /api/users/:id` (public fields, counts, `isFollowing`) and `PATCH /api/users/me` (name, bio up to 160 characters, `https://` avatar URL).
- Follow and unfollow return the updated counts. Followers and following lists are cursor-paginated and include `isFollowing` for each user.
- `GET /api/users?search=` searches by name, case-insensitive, with page/limit pagination. It never returns emails, and it excludes the person searching.
- `GET /api/feed` (also available at `/api/posts/feed`): your own posts plus posts from people you follow, newest first.
- `GET /api/users/:id/posts`: one user's posts for the profile page.
- The Postman collection has a Follow folder and covers every new endpoint, including `404`, `400` and `403` cases.

**Frontend**
- **Profile page `/users/:id`:** avatar, name, bio, join date, and Posts, Followers and Following counts. Followers and Following link to their lists. Your own profile shows **Edit profile**. Anyone else's shows **Follow/Unfollow**.
- **Posts on the profile, Instagram style:** a 3-column grid by default.
  - Photo posts show the photo. Text posts show their first lines on a soft color.
  - Hovering or keyboard-focusing a tile shows its like and comment counts.
  - Clicking a tile opens the list view at that post, with a sticky "← Back to grid" bar. The full card works there: like, comment, edit, delete.
  - Going back scrolls the grid to the same tile. Grid and list icons switch between the views.
- **Edit profile form:** inline, with validation that matches the API, a bio counter, and Escape to cancel. The Navbar avatar updates right away.
- **Search page `/search`:** results update as you type (300 ms debounce), the query stays in the URL (`?q=`), and there's a Load more button.
- **Followers and Following pages:** tabs, Load more, and an empty state that links to search.
- **Home feed:** **Following** (personalized) and **Everyone** tabs.
- **One follow button everywhere** (profile, search, lists), with optimistic updates and a revert if the request fails.

### Key decisions and why

**Direct follow, no follow requests.** The task describes a public follow: follow → counts update. Follow requests and accept/decline would need private accounts and a pending state, which the task doesn't ask for. (Both were added later as a Day 5 bonus. Public accounts still work exactly like this.)

**Follows are race-safe and counters change atomically.** Same approach as likes: one `updateOne` with `upsert`, and the counts only change with `$inc` when a follow was actually inserted (`upsertedCount === 1`) or removed (`deletedCount === 1`). A duplicate-key error from a parallel request counts as "already following". Following twice or unfollowing twice never changes the counts twice.

**Counts are stored, not counted per request.** Profile pages and search results show counts for many users. Counting follows or posts on every request would get slower as data grows, so the counts live on `User` and update with `$inc`.

**Search escapes regex characters.** The search text is escaped before it's used in `$regex`, so `.*` searches for those characters literally. It can't match every user or run an expensive pattern.

**Cursor pagination for growing lists, page/limit for search.** Feeds and follow lists use the same `before` + `beforeId` cursor as Day 2, so new follows or posts never make Load more repeat or skip an item. Search results are a fixed snapshot, where page/limit is simpler and gives a total count.

**`/api/feed` and `/api/posts/feed` share one handler.** `/api/feed` is the path in the task spec. The frontend already used `/api/posts/feed`, so both stay working instead of one being renamed.

**Follow buttons stay in sync through one event.** The same user can appear on a profile, in search results and in a followers list at once. After a follow changes, `useFollow` dispatches a `follow-change` window event with the new state and counts. Every button and the profile header for that user update, without a global store.

**Grid and list share the same posts.** Both views read from one `useFeed` state inside `FeedList`, so a like, comment, edit or delete in the list is already in the grid when you go back, with no refetch. Scroll targets are plain element ids (`post-<id>`, `tile-<id>`).

**Likes and comments no longer mark a post "Edited".** A `$inc` on `likeCount` or `commentCount` also changed `updatedAt`, which the card uses for the "Edited" label. Those updates now pass `timestamps: false`.

**Fixes found during testing.**
- A missing `JWT_EXPIRES_IN` now falls back to `7d` instead of creating a token that never expires.
- Login rejects a non-string password with a clean `400`.
- One account had a stale `postCount` from posts created before the counter existed. It was recomputed from the real posts.
- The Postman auto-login scripts read `baseUrl` with `pm.variables` instead of `pm.collectionVariables`, so a run against the live API logs in to the live API, not localhost.

---

## Day 5 — Notifications, post search, testing and final polish

**Goal:** the full flow works end to end: Register → Login → profile → discover and follow users → post → personalized feed → like → comment → **receive notifications** → manage profile → logout. The app is tested, optimized and ready for submission.

### What was built

**Backend**
- `Notification` model: `recipient`, `actor`, `type` (`LIKE`, `COMMENT`, `FOLLOW`, plus `FOLLOW_REQUEST` and `FOLLOW_ACCEPTED`), an optional `post` and `comment`, `isRead`, and `createdAt`.
- Notifications are created on like, comment and follow, but never for your own action (liking or commenting on your own post).
- Undoing an action removes its notification: unlike, unfollow, cancelling a request, deleting a comment. Deleting a post removes all of its notifications.
- Notifications API: list (newest first, cursor-paginated, with the actor's name and avatar and a short preview of the post or comment), unread count, mark one as read, mark all as read. You can only see or change your own notifications.
- **Post search:** `GET /api/posts?search=` searches post text, case-insensitive, on the same endpoint as the feed. It keeps the same privacy rules and pagination.
- **Bonus — private accounts and follow requests (Instagram style):**
  - `isPrivate` on `User`.
  - A `FollowRequest` model.
  - Following a private account sends a request, which the owner can accept or decline.
  - A non-follower gets `403` for the account's posts, single posts, likes, comments, and followers/following lists. The global feed and post search skip that account's posts.
  - Switching back to public accepts everyone still waiting.
- The Postman collection has three new folders: **Post Search**, **Notifications**, and **Follow Requests & Private Accounts**.

**Frontend**
- **Bell in the navbar** with an unread badge (shows `9+` above 9). It refreshes on every page change, every minute while the tab is visible, and when you come back to the tab.
- **Notifications page `/notifications`:**
  - Each row shows the actor's avatar with a small type icon, a message ("liked your post", "commented: …"), the time, and an unread dot and tint.
  - Clicking a row marks it read. Follow-type rows open the person's profile. Like and comment rows open your profile, where the post is (there's no single-post page yet).
  - **Mark all as read** button. The badge updates right away.
  - Follow requests show **Confirm** and **Delete** in the row.
- **Search page** now has **People | Posts** tabs. The tab and the query stay in the URL (`?q=&type=posts`). Post results use the same `FeedList` as the feed (like, comment, Load more), with an empty state when nothing matches.
- **Private accounts:**
  - A toggle in Edit profile.
  - The follow button shows **Follow**, **Requested** or **Following**. Leaving a private account asks for confirmation first.
  - A non-follower sees a lock notice instead of the posts.
- **404 page** for unknown URLs, instead of silently redirecting home.
- **Friendlier errors:** a network failure says "Can't reach the server…", and a validation error shows the first field's message instead of "Validation failed".

### Key decisions and why

**Notifications never break the action they come from.** `notify()` and `unnotify()` catch their own errors. A like that worked must not return `500` just because its notification failed to save, so a failed notification is logged and skipped.

**Undo removes the notification.** Like → unlike → like again would otherwise leave two "liked your post" rows. Removing on undo keeps one notification per real action, the same way Instagram does it.

**Unread count comes from the server, not from the list.** The list is paginated, so counting unread items on the client would be wrong whenever there are more than one page. Every write (mark one, mark all, accept, decline) returns the new `unreadCount`. The page passes it to the navbar badge through a small window event, without an extra request.

**Polling, not WebSockets.** Vercel runs the API as serverless functions, which can't hold a socket open. A cheap `unread-count` request on navigation, every 60 seconds and on tab focus is enough for this app. It pauses while the tab is hidden.

**Someone else's notification is a `404`, not a `403`.** Mark-as-read filters by `_id` **and** `recipient` in one query. A `403` would confirm that the id exists.

**Post search reuses the feed endpoint.** `?search=` adds one condition on top of the feed's existing filter, so privacy, `likedByMe`, cursor pagination and page mode all keep working with no new code paths. The text is regex-escaped (as in user search) and limited to 100 characters. Searching by author name was not added, because the People tab already covers it.

**Follow requests are a separate collection.** `Follow` only ever holds accepted follows, so the feed, follower counts and lists didn't need to change. Accept deletes the request **first**, then creates the follow. If two accepts run at the same time, only one deletes the request, so only one follow is created.

**Private profile headers stay visible.** Like Instagram, anyone can see the name, bio and counts, so they know who they're requesting. Only the content is locked, checked in one helper (`assertCanViewUser`).

### Review and testing (Parts 6–9)

**Security review.** Re-checked every ownership rule from the spec with a probe script (30 checks):
- Edit/delete on posts and comments, self-follow, duplicate follows and likes under 10 parallel requests.
- NoSQL injection in login and search, mass assignment, `413` on oversized bodies.
- Every error uses `{ success: false, message }`. No password hash or email appears in any response, and the live API shows no stack traces.

**Performance.** Ran `explain()` on every frequent query. Four were scanning the whole collection or sorting in memory, so indexes were added:

| Query | Index added |
|---|---|
| A profile's posts / the following feed (filter by author, newest first) | `Post { author, createdAt, _id }` (replaces the single `author` index) |
| Followers / following lists, newest first | `Follow { following, createdAt, _id }` and `{ follower, createdAt, _id }` |
| Private accounts to hide from the global feed | Partial index `User { isPrivate }` for private users only, so it stays tiny |
| Removing notifications when a post or comment is deleted | Sparse `Notification { post }` and `{ comment }` |

All frequent queries now use an index scan. Lists always use pagination and `select`/`populate` with only the fields shown. `likedByMe`, `isFollowing` and `isRequested` are computed with one query per page, not one per item, so there are no N+1 queries.

**UI walk-through.** A browser script opened all 11 pages at 375px, 768px and 1280px and checked each one for horizontal overflow and console errors or warnings. It found 0 of each. Long search terms in empty states now wrap.

**Tests run:**
- Postman: 236 requests, 338 assertions, 0 failures.
- Notifications script, private-accounts script (48 checks) and search script (19 checks): all passing.
- Browser tests for search and private accounts (desktop and 375px): all passing.
- `npm run lint` and `npm run build` are clean.

---

## Deployment (Vercel)

The frontend and backend are two separate Vercel projects from the same repo.

### Backend: `social-feed-api`

**Vercel settings:** Framework Preset **Other** · Root Directory `backend`

**Environment variables:** `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=7d`, `NODE_ENV=production`, `CLIENT_URL=<frontend URL>`. Don't set `PORT`.

Vercel runs Express as a **serverless function**, not a long-running server, so three pieces of code exist for it:

1. **`backend/api/index.js`** re-exports the Express app from `src/app.js`. Vercel turns files in `api/` into functions. `server.js` (`app.listen`) is only used locally.
2. **`backend/vercel.json`** rewrites every path to that one function, so Express still sees the original URL and handles routing itself.
3. **Cached DB connection** in `src/config/db.js`, plus a middleware in `app.js` that awaits it before every request. Serverless instances are reused between requests, so the connection promise is stored at module level and reused instead of opening a new Atlas connection per request. A failed attempt clears the cache so the next request retries.

MongoDB Atlas **Network Access** must allow `0.0.0.0/0`, because Vercel doesn't use fixed IPs.

After changing any environment variable, **Redeploy** for it to take effect.

### Frontend

**Vercel settings:** Framework Preset **Vite** · Root Directory `frontend`

**Environment variable:** `VITE_API_URL=/api`

**`frontend/vercel.json`** does two jobs:

1. **SPA fallback** (`/(.*)` → `/index.html`). Routes like `/profile` only exist in React Router. Without this, refreshing any page except `/` returns a Vercel 404.
2. **API proxy** (`/api/:path*` → `https://social-feed-api.vercel.app/api/:path*`). The browser calls `/api/...` on the frontend's own domain, and Vercel forwards the request to the backend. This makes the auth cookie **first-party**. If the browser called the backend domain directly, the cookie would be third-party, and Safari (and any browser that blocks third-party cookies) would drop it, so login would appear to succeed and then every request would return `401`. It also means production requests don't need CORS.

Locally, `VITE_API_URL` points straight at `http://localhost:5000/api`. `localhost:5173` and `localhost:5000` count as the same site, so the cookie works there without a proxy.

---

## Known limitations

- **Logout doesn't revoke the JWT.** It clears the cookie, but a copied token stays valid until it expires (7 days). A token blocklist or short-lived access tokens with refresh tokens would fix this.
- **The rate limiter uses in-memory storage.** On Vercel each serverless instance keeps its own counters, so the limit applies per instance. A shared store such as Redis would make it global.
- **No email verification.** Registration therefore reveals whether an email is already in use.
- **Avatars are URLs, not uploads.** Users paste a direct `https://` image link. File upload would need storage such as Cloudinary or S3.
- **Notifications are not real-time.** The badge refreshes on navigation, every 60 seconds and on tab focus. Instant updates would need WebSockets or a push service, which Vercel's serverless functions can't host.
- **Post search is a regex scan.** Fine at this size, but an unanchored regex can't use an index on `content`. A MongoDB text index or Atlas Search would be the next step for large data and relevance ranking.
- **Relative timestamps** ("5 minutes ago") only update on re-render or refresh.
- **Relationships are cleaned up only for post deletion.** Deleting a user account (not implemented yet) would also need to remove that user's posts, likes, comments, and follows, and fix the other users' counts.

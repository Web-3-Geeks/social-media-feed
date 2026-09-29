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
- [ ] Test the full flow end to end (local + live)
- [x] Lint, build, audit (a11y, edge cases, empty feed)
- [x] README Day 2 section
- [ ] Commit, `week5/Day2` snapshot, push

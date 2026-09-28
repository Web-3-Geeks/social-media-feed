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
- [ ] Create the User model
- [ ] Register endpoint
- [ ] Login endpoint
- [ ] Auth middleware + `/api/auth/me`
- [ ] Logout endpoint
- [ ] `/api/users/me` endpoint
- [ ] Test every endpoint in Postman

**Part 3 — Frontend**
- [ ] Set up React + Tailwind + Router
- [ ] Auth context (keeps track of the logged-in user)
- [ ] Protected routes
- [ ] Register and Login pages
- [ ] Dashboard and Profile pages

**Part 4 — Finish up**
- [ ] Test the full flow end to end
- [ ] Run lint and build, fix any issues
- [ ] Write the README
- [ ] Push to GitHub and create the `week5/Day1` snapshot

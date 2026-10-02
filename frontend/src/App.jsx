import { BrowserRouter, Route, Routes } from "react-router";
import GuestRoute from "./components/GuestRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Search from "./pages/Search";
import UserProfile from "./pages/UserProfile";
import FollowList from "./pages/FollowList";
import AppLayout from "./components/AppLayout";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/users/:id" element={<UserProfile />} />
            <Route
              path="/users/:id/followers"
              element={<FollowList type="followers" />}
            />
            <Route
              path="/users/:id/following"
              element={<FollowList type="following" />}
            />
            {/* Logged-out visitors are sent to /login by ProtectedRoute first. */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

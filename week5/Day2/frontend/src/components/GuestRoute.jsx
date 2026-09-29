import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";
import FullPageLoader from "./FullPageLoader";

export default function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (user) return <Navigate to="/" replace />;

  return <Outlet />;
}

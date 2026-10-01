import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

// Old /profile link. Your profile now lives at /users/:id like everyone else's.
export default function Profile() {
  const { user } = useAuth();
  return <Navigate to={`/users/${user.id}`} replace />;
}

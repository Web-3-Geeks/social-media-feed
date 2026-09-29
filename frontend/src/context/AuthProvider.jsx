import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "./AuthContext";

// A 401 from these means "wrong credentials" or "not logged in yet",
// not "your session just expired".
const AUTH_CHECK_URLS = ["/auth/login", "/auth/me"];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  // Mirrors `user` so the interceptor (registered once) can read the latest value.
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // If any other request comes back 401 (cookie expired or revoked while the app
  // is open), drop the user. ProtectedRoute then redirects to /login.
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const url = error.config?.url || "";
        if (error.response?.status === 401 && !AUTH_CHECK_URLS.includes(url)) {
          // Only show "session expired" if someone was actually logged in.
          if (userRef.current) setSessionExpired(true);
          setUser(null);
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const register = useCallback(async (formData) => {
    await api.post("/auth/register", formData);
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await api.post("/auth/login", credentials);
    setSessionExpired(false);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Log out locally even if the request fails (e.g. offline).
    } finally {
      setSessionExpired(false);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, sessionExpired, register, login, logout }),
    [user, loading, sessionExpired, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

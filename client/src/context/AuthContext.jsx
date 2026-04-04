import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../../api";
import api from "../api.js";

const AuthContext = createContext(null);

// Synchronously initialize the Axios Authorization header from localStorage
// so it is present on the very first request (avoids the useEffect timing gap).
const storedToken = localStorage.getItem("scholarai_token");
if (storedToken) {
  api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(storedToken);
  // authReady: false while the initial /auth/me check is in-flight.
  // ProtectedRoute must not redirect until this is true.
  const [authReady, setAuthReady] = useState(false);

  // Keep Axios header in sync whenever token changes after mount.
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Validate the stored token by fetching the current user from the server.
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setAuthReady(true);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
      } catch (err) {
        // Only invalidate the token on a definitive 401 Unauthorized.
        // Network errors or 5xx responses must NOT log the user out.
        if (err.response?.status === 401) {
          localStorage.removeItem("scholarai_token");
          setToken(null);
          setUser(null);
          delete api.defaults.headers.common["Authorization"];
        }
      } finally {
        setAuthReady(true);
      }
    };
    fetchUser();
  }, [token]);

  const login = useCallback((newToken) => {
    localStorage.setItem("scholarai_token", newToken);
    // Set Axios header synchronously here too so any request fired
    // immediately after login() already has the auth header.
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("scholarai_token");
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    authReady,
    // isAuthenticated: true as soon as we have a token (optimistic) OR
    // confirmed by the server (/auth/me). Falls back to false only when
    // authReady is true AND both token and user are null.
    isAuthenticated: authReady ? !!user : !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

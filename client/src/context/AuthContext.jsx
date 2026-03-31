import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('scholarai_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete axios.defaults.headers.common['Authorization'];
  }, [token]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) { setLoading(false); return; }
      try { const { data } = await axios.get('/auth/me'); setUser(data.user); }
      catch { localStorage.removeItem('scholarai_token'); setToken(null); setUser(null); }
      finally { setLoading(false); }
    };
    fetchUser();
  }, [token]);

  const login = (newToken) => { localStorage.setItem('scholarai_token', newToken); setToken(newToken); };
  const logout = () => { localStorage.removeItem('scholarai_token'); setToken(null); setUser(null); delete axios.defaults.headers.common['Authorization']; };

  return <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!user }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx; };

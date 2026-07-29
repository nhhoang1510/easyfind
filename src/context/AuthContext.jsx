// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // loading initial auth check

  // On mount: restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('kcp_token');
    if (!token) { setLoading(false); return; }
    api.getMe()
      .then(u => setUser(u))
      .catch(() => { localStorage.removeItem('kcp_token'); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const { user: u, token } = await api.login({ username, password });
    localStorage.setItem('kcp_token', token);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (data) => {
    const { user: u, token } = await api.register(data);
    localStorage.setItem('kcp_token', token);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('kcp_token');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const updated = await api.updateProfile(data);
    setUser(updated);
    return updated;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

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

  const socialLogin = useCallback(async (providerName) => {
    if (providerName === 'Google') {
      try {
        const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
        const { auth } = await import('../api/firebase');
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const userObj = result.user;

        const googleUser = {
          id: userObj.uid,
          full_name: userObj.displayName || 'Người dùng Google',
          username: userObj.email ? userObj.email.split('@')[0] : 'google_user_' + userObj.uid.slice(0, 6),
          phone: userObj.phoneNumber || '',
          gender: 'other',
          role: 'user',
          skill_level: 'Trung bình',
          city: 'Hà Nội',
          avatar: userObj.photoURL || null
        };

        const token = await userObj.getIdToken();
        localStorage.setItem('kcp_token', token);
        setUser(googleUser);
        return googleUser;
      } catch (err) {
        console.error("Lỗi Google Sign In:", err);
        if (err.code === 'auth/popup-closed-by-user') {
          throw new Error('Bạn đã đóng cửa sổ đăng nhập Google');
        } else if (err.code === 'auth/invalid-api-key') {
          throw new Error('Cấu hình API Key Firebase không hợp lệ');
        }
        throw new Error(err.message || 'Đăng nhập Google thất bại');
      }
    }

    const mockSocialUser = {
      id: Date.now(),
      full_name: providerName === 'Google' ? 'Nguyễn Văn Google' : 'Nguyễn Văn Zalo',
      username: (providerName.toLowerCase()) + '_user_' + Math.floor(Math.random() * 1000),
      phone: '0912345678',
      gender: 'male',
      role: 'user',
      skill_level: 'Trung bình',
      city: 'Hà Nội'
    };
    const token = 'social_token_' + Date.now();
    localStorage.setItem('kcp_token', token);
    setUser(mockSocialUser);
    return mockSocialUser;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, socialLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

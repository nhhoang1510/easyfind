// src/pages/LoginPage.jsx — Professional minimalist redesign
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lp-page">
      <div className="lp-card">
        {/* Brand */}
        <Link to="/" className="lp-brand">EasyFind</Link>

        <div className="lp-header">
          <h1 className="lp-title">Đăng nhập</h1>
          <p className="lp-sub">Chào mừng trở lại! Đăng nhập để tiếp tục.</p>
        </div>

        {error && <div className="lp-error">{error}</div>}

        <form onSubmit={handleSubmit} className="lp-form">
          <div className="lp-field">
            <label className="lp-label">Tên đăng nhập</label>
            <input
              type="text"
              className="lp-input"
              placeholder="Nhập tên đăng nhập"
              required
              autoComplete="username"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            />
          </div>

          <div className="lp-field">
            <label className="lp-label">Mật khẩu</label>
            <input
              type="password"
              className="lp-input"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
          </div>

          <button type="submit" className="lp-submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="lp-footer">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="lp-link">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}

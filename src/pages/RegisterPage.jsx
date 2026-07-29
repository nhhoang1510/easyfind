// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SKILL_LEVELS, CITIES } from '../utils/helpers';

const ROLE_OPTIONS = [
  {
    value: 'player',
    label: 'Người chơi',
    desc: 'Tìm kèo, đăng ký slot, tham gia cộng đồng',
    icon: '🏸',
  },
  {
    value: 'host',
    label: 'Người tổ chức',
    desc: 'Tạo kèo, quản lý danh sách, duyệt cọc tiền',
    icon: '📋',
  },
];

const GENDER_OPTIONS = [
  { value: 'male',   label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other',  label: 'Khác' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '', username: '', password: '', confirm_password: '',
    role: 'player', gender: 'male', skill_level: 'Trung bình', city: 'Hà Nội',
  });

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.username.trim())   { setError('Vui lòng nhập tên đăng nhập'); return; }
    if (form.password.length < 6){ setError('Mật khẩu phải ít nhất 6 ký tự'); return; }
    if (form.password !== form.confirm_password) { setError('Mật khẩu xác nhận không khớp'); return; }
    setLoading(true);
    try {
      const { confirm_password, ...payload } = form;
      await register(payload);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        {/* Logo */}
        <Link to="/" className="auth-logo">
          <span className="auth-logo-icon">🏸</span>
          <span>EasyFind</span>
        </Link>

        <h1 className="auth-title">Tạo tài khoản</h1>
        <p className="auth-subtitle">Chỉ mất 1 phút để bắt đầu tham gia cộng đồng!</p>

        {error && <div className="auth-alert auth-alert--error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">

          {/* Role selection */}
          <div className="form-group">
            <label className="form-label">Bạn muốn là?</label>
            <div className="auth-role-grid">
              {ROLE_OPTIONS.map(r => (
                <div
                  key={r.value}
                  className={`auth-role-card ${form.role === r.value ? 'auth-role-card--active' : ''}`}
                  onClick={() => set('role', r.value)}
                >
                  <span className="auth-role-icon">{r.icon}</span>
                  <span className="auth-role-label">{r.label}</span>
                  <span className="auth-role-desc">{r.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div className="form-group">
            <label className="form-label">Giới tính</label>
            <div className="auth-gender-row">
              {GENDER_OPTIONS.map(g => (
                <button
                  key={g.value}
                  type="button"
                  className={`auth-gender-btn ${form.gender === g.value ? 'auth-gender-btn--active' : ''}`}
                  onClick={() => set('gender', g.value)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name + username */}
          <div className="auth-grid-2">
            <div className="form-group">
              <label className="form-label">Họ & Tên</label>
              <input className="form-input" required placeholder="Nguyễn Văn A"
                value={form.full_name} onChange={e => set('full_name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Tên đăng nhập</label>
              <input className="form-input" required placeholder="user123"
                value={form.username} onChange={e => set('username', e.target.value)} />
            </div>
          </div>

          {/* Password */}
          <div className="auth-grid-2">
            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <input type="password" className="form-input" required placeholder="Ít nhất 6 ký tự"
                value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu</label>
              <input type="password" className="form-input" required placeholder="Nhập lại mật khẩu"
                value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)} />
            </div>
          </div>

          {/* Skill + city */}
          <div className="auth-grid-2">
            <div className="form-group">
              <label className="form-label">Trình độ</label>
              <select className="form-select" value={form.skill_level} onChange={e => set('skill_level', e.target.value)}>
                {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Thành phố</label>
              <select className="form-select" value={form.city} onChange={e => set('city', e.target.value)}>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>
        </form>

        <p className="auth-switch">
          Đã có tài khoản?{' '}
          <Link to="/login" className="auth-link">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
